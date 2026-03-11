const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const db = new Database(path.join(__dirname, 'littlescribblers.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('director', 'account_manager')),
    branch TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('urgent', 'high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'pending_info', 'resolved', 'closed')),
    description TEXT DEFAULT '',
    created_by TEXT NOT NULL,
    branch TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const seedUsers = () => {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (count > 0) return;

  const hash = bcrypt.hashSync('LittleScribblers2024', 10);

  const users = [
    { username: 'shady',                 full_name: 'Shady',                     role: 'account_manager', branch: null },
    { username: 'bani',                  full_name: 'Bani',                       role: 'director',        branch: 'Ashfield' },
    { username: 'director_burwood',      full_name: 'Director — Burwood',         role: 'director',        branch: 'Burwood' },
    { username: 'director_strathfield',  full_name: 'Director — Strathfield',     role: 'director',        branch: 'Strathfield' },
    { username: 'director_newtown',      full_name: 'Director — Newtown',         role: 'director',        branch: 'Newtown' },
    { username: 'director_marrickville', full_name: 'Director — Marrickville',    role: 'director',        branch: 'Marrickville' },
  ];

  const insert = db.prepare(
    'INSERT INTO users (id, username, password_hash, full_name, role, branch) VALUES (?, ?, ?, ?, ?, ?)'
  );

  users.forEach(u =>
    insert.run(uuidv4(), u.username, hash, u.full_name, u.role, u.branch)
  );

  console.log('✅ Database seeded with initial users');
  console.log('   Default password for all accounts: LittleScribblers2024');
};

seedUsers();

module.exports = db;
