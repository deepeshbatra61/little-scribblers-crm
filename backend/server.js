const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'ls-crm-jwt-secret-2024';

app.use(cors());
app.use(express.json());

// ─── Middleware ────────────────────────────────────────────────────────────

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Branch code mapping for ticket numbering
const BRANCH_CODES = {
  Ashfield:    'ASH',
  Burwood:     'BUR',
  Strathfield: 'STR',
  Newtown:     'NEW',
  Marrickville:'MAR',
};

// Priority sort order
const PRIORITY_ORDER = "CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END";

const parseTicket = t => ({ ...t, metadata: JSON.parse(t.metadata || '{}') });

// ─── Auth Routes ───────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid username or password' });

  const payload = {
    id: user.id, username: user.username,
    full_name: user.full_name, role: user.role, branch: user.branch,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: payload });
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/change-password', auth, (req, res) => {
  const { current_password, new_password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password_hash))
    return res.status(400).json({ error: 'Current password is incorrect' });
  if (new_password.length < 8)
    return res.status(400).json({ error: 'New password must be at least 8 characters' });

  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ message: 'Password updated successfully' });
});

// ─── Ticket Routes ─────────────────────────────────────────────────────────

// GET /api/tickets — account_manager sees all; director sees own
app.get('/api/tickets', auth, (req, res) => {
  if (req.user.role === 'account_manager') {
    const { status, priority, branch, type, search } = req.query;
    const conditions = [];
    const params = [];

    if (status   && status   !== 'all') { conditions.push('t.status = ?');   params.push(status); }
    if (priority && priority !== 'all') { conditions.push('t.priority = ?'); params.push(priority); }
    if (branch   && branch   !== 'all') { conditions.push('t.branch = ?');   params.push(branch); }
    if (type     && type     !== 'all') { conditions.push('t.type = ?');     params.push(type); }
    if (search) {
      conditions.push('(t.title LIKE ? OR t.description LIKE ? OR t.ticket_number LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const tickets = db.prepare(`
      SELECT t.*, u.full_name AS creator_name
      FROM tickets t
      JOIN users u ON t.created_by = u.id
      ${where}
      ORDER BY ${PRIORITY_ORDER}, t.created_at DESC
    `).all(...params);

    return res.json(tickets.map(parseTicket));
  }

  // Director: own tickets only
  const tickets = db.prepare(`
    SELECT t.*, u.full_name AS creator_name
    FROM tickets t
    JOIN users u ON t.created_by = u.id
    WHERE t.created_by = ?
    ORDER BY ${PRIORITY_ORDER}, t.created_at DESC
  `).all(req.user.id);

  res.json(tickets.map(parseTicket));
});

// POST /api/tickets — directors only
app.post('/api/tickets', auth, (req, res) => {
  if (req.user.role !== 'director')
    return res.status(403).json({ error: 'Only directors can raise tickets' });

  const { title, type, priority, description, metadata } = req.body;
  if (!title || !type || !priority)
    return res.status(400).json({ error: 'Title, type, and priority are required' });

  const code = BRANCH_CODES[req.user.branch] || req.user.branch.substring(0, 3).toUpperCase();
  const { cnt } = db.prepare('SELECT COUNT(*) AS cnt FROM tickets WHERE branch = ?').get(req.user.branch);
  const ticketNumber = `${code}-${String(cnt + 1).padStart(3, '0')}`;

  const id = uuidv4();
  db.prepare(`
    INSERT INTO tickets (id, ticket_number, title, type, priority, description, created_by, branch, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, ticketNumber, title, type, priority, description || '', req.user.id, req.user.branch, JSON.stringify(metadata || {}));

  const ticket = db.prepare(`
    SELECT t.*, u.full_name AS creator_name FROM tickets t
    JOIN users u ON t.created_by = u.id WHERE t.id = ?
  `).get(id);

  res.status(201).json(parseTicket(ticket));
});

// GET /api/tickets/:id
app.get('/api/tickets/:id', auth, (req, res) => {
  const ticket = db.prepare(`
    SELECT t.*, u.full_name AS creator_name, u.branch AS creator_branch
    FROM tickets t JOIN users u ON t.created_by = u.id
    WHERE t.id = ?
  `).get(req.params.id);

  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (req.user.role === 'director' && ticket.created_by !== req.user.id)
    return res.status(403).json({ error: 'Access denied' });

  const comments = db.prepare(`
    SELECT c.*, u.full_name, u.role
    FROM comments c JOIN users u ON c.user_id = u.id
    WHERE c.ticket_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.id);

  res.json({ ...parseTicket(ticket), comments });
});

// PATCH /api/tickets/:id — update status/priority
app.patch('/api/tickets/:id', auth, (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (req.user.role === 'director' && ticket.created_by !== req.user.id)
    return res.status(403).json({ error: 'Access denied' });

  const allowed = req.user.role === 'account_manager'
    ? ['status', 'priority', 'title', 'description']
    : ['description'];

  const updates = [];
  const params = [];

  allowed.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  });

  if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });

  updates.push("updated_at = datetime('now')");
  db.prepare(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`).run(...params, req.params.id);

  const updated = db.prepare(`
    SELECT t.*, u.full_name AS creator_name FROM tickets t
    JOIN users u ON t.created_by = u.id WHERE t.id = ?
  `).get(req.params.id);

  res.json(parseTicket(updated));
});

// POST /api/tickets/:id/comments
app.post('/api/tickets/:id/comments', auth, (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (req.user.role === 'director' && ticket.created_by !== req.user.id)
    return res.status(403).json({ error: 'Access denied' });

  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });

  const id = uuidv4();
  db.prepare('INSERT INTO comments (id, ticket_id, user_id, content) VALUES (?, ?, ?, ?)').run(
    id, req.params.id, req.user.id, content.trim()
  );
  db.prepare("UPDATE tickets SET updated_at = datetime('now') WHERE id = ?").run(req.params.id);

  const comment = db.prepare(`
    SELECT c.*, u.full_name, u.role FROM comments c
    JOIN users u ON c.user_id = u.id WHERE c.id = ?
  `).get(id);

  res.status(201).json(comment);
});

// ─── Stats Routes ──────────────────────────────────────────────────────────

app.get('/api/stats', auth, (req, res) => {
  if (req.user.role === 'director') {
    const stats = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'resolved' OR status = 'closed' THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN priority = 'urgent' AND status NOT IN ('resolved','closed') THEN 1 ELSE 0 END) AS urgent
      FROM tickets WHERE created_by = ?
    `).get(req.user.id);
    return res.json(stats);
  }

  const overall = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
      SUM(CASE WHEN status = 'resolved' OR status = 'closed' THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN priority = 'urgent' AND status NOT IN ('resolved','closed') THEN 1 ELSE 0 END) AS urgent,
      SUM(CASE WHEN status NOT IN ('resolved','closed') AND date(created_at) = date('now') THEN 1 ELSE 0 END) AS today
    FROM tickets
  `).get();

  const branches = db.prepare(`
    SELECT branch,
      COUNT(*) AS total,
      SUM(CASE WHEN status NOT IN ('resolved','closed') THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN priority = 'urgent' AND status NOT IN ('resolved','closed') THEN 1 ELSE 0 END) AS urgent
    FROM tickets GROUP BY branch ORDER BY branch
  `).all();

  res.json({ ...overall, branches });
});

// ─── User Routes ───────────────────────────────────────────────────────────

app.get('/api/users', auth, (req, res) => {
  if (req.user.role !== 'account_manager')
    return res.status(403).json({ error: 'Access denied' });
  const users = db.prepare(
    'SELECT id, username, full_name, role, branch FROM users ORDER BY role, branch'
  ).all();
  res.json(users);
});

// ─── Start Server ──────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🌟 Little Scribblers CRM — Backend running on http://localhost:${PORT}\n`);
});
