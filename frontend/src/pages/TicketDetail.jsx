import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { PriorityBadge, StatusBadge, TypeBadge } from '../components/Badges';
import { STATUSES, PRIORITIES, getType, formatDate } from '../constants';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const commentRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.getTicket(id)
      .then(setTicket)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async newStatus => {
    setUpdating(true);
    try {
      const updated = await api.updateTicket(id, { status: newStatus });
      setTicket(t => ({ ...t, ...updated }));
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async newPriority => {
    setUpdating(true);
    try {
      const updated = await api.updateTicket(id, { priority: newPriority });
      setTicket(t => ({ ...t, ...updated }));
    } finally {
      setUpdating(false);
    }
  };

  const handleComment = async e => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const c = await api.addComment(id, comment.trim());
      setTicket(t => ({ ...t, comments: [...(t.comments || []), c] }));
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:12, animation:'pulse 1.5s infinite' }}>⏳</div>
        Loading ticket…
      </div>
    </div>
  );

  if (!ticket) return null;

  const typeInfo = getType(ticket.type);
  const isManager = user?.role === 'account_manager';
  const isResolved = ['resolved', 'closed'].includes(ticket.status);

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'24px 20px' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', marginBottom:20, display:'flex', alignItems:'center', gap:4 }}
      >
        ← Back to dashboard
      </button>

      {/* Main card */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', marginBottom:20 }}>
        {/* Top colour bar */}
        <div style={{
          height:5,
          background: ticket.priority === 'urgent' ? 'var(--urgent)' : ticket.priority === 'high' ? 'var(--high)' : ticket.priority === 'medium' ? 'var(--medium)' : 'var(--low)',
        }} />

        <div style={{ padding:'24px 28px' }}>
          {/* Header row */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:16, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:0 }}>
              {/* Ticket number + type */}
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                <span style={{ fontFamily:'monospace', background:'var(--bg)', color:'var(--text-muted)', borderRadius:'var(--radius-xs)', padding:'3px 8px', fontSize:12 }}>
                  {ticket.ticket_number}
                </span>
                <TypeBadge value={ticket.type} />
                {ticket.branch && (
                  <span style={{ fontSize:12, color:'var(--primary)', fontWeight:500, background:'var(--primary-light)', borderRadius:99, padding:'2px 8px' }}>
                    📍 {ticket.branch}
                  </span>
                )}
              </div>
              {/* Title */}
              <h1 style={{ fontWeight:800, fontSize:20, color:'var(--text)', lineHeight:1.3, marginBottom:8 }}>
                {ticket.title}
              </h1>
              {/* Meta */}
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                Raised by <strong>{ticket.creator_name}</strong> · {formatDate(ticket.created_at)}
                {ticket.updated_at !== ticket.created_at && ` · Updated ${formatDate(ticket.updated_at)}`}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
            <PriorityBadge value={ticket.priority} size="lg" />
            <StatusBadge   value={ticket.status}   size="lg" />
          </div>

          {/* Description */}
          {ticket.description && (
            <div style={{
              background:'var(--bg)', borderRadius:'var(--radius-md)',
              padding:'14px 16px', fontSize:14, color:'var(--text)', lineHeight:1.7, marginBottom:20,
            }}>
              {ticket.description}
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop:'1px solid var(--border)', marginBottom:20 }} />

          {/* Actions — Shady only */}
          {isManager && (
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:'var(--text)', marginBottom:12 }}>
                Manage Ticket
              </div>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                {/* Status change */}
                <div style={{ flex:'1 1 200px' }}>
                  <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', fontWeight:600, marginBottom:8 }}>
                    Update Status
                  </label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {STATUSES.map(s => (
                      <button
                        key={s.value}
                        disabled={updating || ticket.status === s.value}
                        onClick={() => handleStatusChange(s.value)}
                        style={{
                          padding:'6px 12px', borderRadius:99, fontSize:12, fontWeight:500,
                          cursor: ticket.status === s.value ? 'default' : 'pointer',
                          border:'1.5px solid',
                          borderColor: ticket.status === s.value ? s.color : 'var(--border)',
                          background: ticket.status === s.value ? s.color + '20' : 'var(--bg)',
                          color: ticket.status === s.value ? s.color : 'var(--text-muted)',
                          opacity: updating ? 0.5 : 1,
                          transition:'all .15s',
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority change */}
                <div style={{ flex:'1 1 200px' }}>
                  <label style={{ display:'block', fontSize:12, color:'var(--text-muted)', fontWeight:600, marginBottom:8 }}>
                    Adjust Priority
                  </label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        disabled={updating || ticket.priority === p.value}
                        onClick={() => handlePriorityChange(p.value)}
                        style={{
                          padding:'6px 12px', borderRadius:99, fontSize:12, fontWeight:500,
                          cursor: ticket.priority === p.value ? 'default' : 'pointer',
                          border:'1.5px solid',
                          borderColor: ticket.priority === p.value ? p.border : 'var(--border)',
                          background: ticket.priority === p.value ? p.bg : 'var(--bg)',
                          color: ticket.priority === p.value ? p.color : 'var(--text-muted)',
                          opacity: updating ? 0.5 : 1,
                          transition:'all .15s',
                        }}
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
        <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', fontWeight:700, fontSize:14, color:'var(--text)' }}>
          Notes &amp; Updates ({ticket.comments?.length || 0})
        </div>

        {/* Comment list */}
        <div style={{ padding:'0 24px', maxHeight:400, overflowY:'auto' }}>
          {(!ticket.comments || ticket.comments.length === 0) ? (
            <div style={{ padding:'32px 0', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>
              No notes yet. Be the first to add one.
            </div>
          ) : (
            ticket.comments.map((c, i) => {
              const isMe = c.user_id === user?.id;
              const isMgr = c.role === 'account_manager';
              return (
                <div key={c.id} className="animate-in" style={{
                  padding:'14px 0',
                  borderBottom: i < ticket.comments.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <div style={{
                      width:30, height:30, borderRadius:'50%', flexShrink:0,
                      background: isMgr ? 'var(--primary-light)' : 'var(--bg-alt)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:700, fontSize:12, color: isMgr ? 'var(--primary)' : 'var(--text-muted)',
                      border:`1px solid ${isMgr ? 'var(--primary)' : 'var(--border)'}`,
                    }}>
                      {c.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontWeight:600, fontSize:13, color:'var(--text)' }}>{c.full_name}</span>
                      {isMgr && <span style={{ fontSize:10, background:'var(--primary-light)', color:'var(--primary)', borderRadius:99, padding:'1px 6px', marginLeft:6, fontWeight:600 }}>Account Manager</span>}
                      <span style={{ fontSize:11, color:'var(--text-light)', marginLeft:8 }}>{formatDate(c.created_at)}</span>
                    </div>
                  </div>
                  <div style={{
                    fontSize:14, color:'var(--text)', lineHeight:1.6,
                    background: isMgr ? 'var(--primary-light)' : 'var(--bg)',
                    borderRadius:'var(--radius-md)', padding:'10px 14px',
                    marginLeft:38,
                  }}>
                    {c.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add comment */}
        {!isResolved && (
          <form onSubmit={handleComment} style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', gap:10, alignItems:'flex-end' }}>
            <textarea
              ref={commentRef}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={isManager ? "Add a note or update for the director…" : "Add a note or ask Shady a question…"}
              rows={2}
              style={{
                flex:1, padding:'10px 12px', borderRadius:'var(--radius-md)',
                border:'1.5px solid var(--border)', outline:'none', fontSize:13,
                background:'var(--bg)', color:'var(--text)', resize:'none', lineHeight:1.5,
                transition:'border .15s',
              }}
              onFocus={e => e.target.style.borderColor='var(--border-focus)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(e); } }}
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              style={{
                padding:'10px 18px', borderRadius:'var(--radius-md)', border:'none',
                background: submitting || !comment.trim() ? 'var(--text-light)' : 'var(--primary)',
                color:'#fff', fontWeight:600, fontSize:13,
                cursor: submitting || !comment.trim() ? 'not-allowed' : 'pointer',
                transition:'background .15s', whiteSpace:'nowrap', flexShrink:0,
              }}
            >
              {submitting ? '…' : 'Send'}
            </button>
          </form>
        )}

        {isResolved && (
          <div style={{ padding:'14px 24px', background:'var(--low-bg)', borderTop:'1px solid var(--low-border)', fontSize:13, color:'var(--low)', textAlign:'center', fontWeight:500 }}>
            This ticket is resolved. New comments are disabled.
          </div>
        )}
      </div>
    </div>
  );
}
