import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { PriorityBadge, StatusBadge, TypeBadge } from '../components/Badges';
import { STATUSES, formatDate } from '../constants';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [commentError, setCommentError] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const commentRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.getTicket(id)
      .then(setTicket)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Shady: requires a comment before status change.
  // Comment is submitted first, then status is updated.
  const handleStatusChange = async newStatus => {
    if (updating) return;

    if (user?.role === 'account_manager' && !comment.trim()) {
      setCommentError(true);
      commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      commentRef.current?.focus();
      setTimeout(() => setCommentError(false), 3500);
      return;
    }

    setUpdating(true);
    try {
      if (user?.role === 'account_manager' && comment.trim()) {
        const c = await api.addComment(id, comment.trim());
        setTicket(t => ({ ...t, comments: [...(t.comments || []), c] }));
        setComment('');
      }
      const updated = await api.updateTicket(id, { status: newStatus });
      setTicket(t => ({ ...t, ...updated }));
    } finally {
      setUpdating(false);
    }
  };

  // Director: withdraw = close their own ticket
  const handleWithdraw = async () => {
    if (withdrawing) return;
    setWithdrawing(true);
    try {
      const updated = await api.updateTicket(id, { status: 'closed' });
      setTicket(t => ({ ...t, ...updated }));
    } finally {
      setWithdrawing(false);
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)', fontSize: 14 }}>
      Loading ticket…
    </div>
  );

  if (!ticket) return null;

  const isManager  = user?.role === 'account_manager';
  const isDirector = user?.role === 'director';
  const isResolved = ['resolved', 'closed'].includes(ticket.status);
  const canWithdraw = isDirector && !isResolved;
  const hasComment = comment.trim().length > 0;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}
      >
        ← Back to dashboard
      </button>

      {/* Main card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 20 }}>
        {/* Priority colour bar */}
        <div style={{
          height: 5,
          background: ticket.priority === 'urgent' ? 'var(--urgent)' : ticket.priority === 'high' ? 'var(--high)' : ticket.priority === 'medium' ? 'var(--medium)' : 'var(--low)',
        }} />

        <div style={{ padding: '24px 28px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Ticket number + type + branch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', background: 'var(--bg)', color: 'var(--text-muted)', borderRadius: 'var(--radius-xs)', padding: '3px 8px', fontSize: 12 }}>
                  {ticket.ticket_number}
                </span>
                <TypeBadge value={ticket.type} />
                {ticket.branch && (
                  <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500, background: 'var(--primary-light)', borderRadius: 99, padding: '2px 8px' }}>
                    {ticket.branch}
                  </span>
                )}
              </div>
              {/* Title */}
              <h1 style={{ fontWeight: 800, fontSize: 20, color: 'var(--text)', lineHeight: 1.3, marginBottom: 8 }}>
                {ticket.title}
              </h1>
              {/* Meta */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Raised by <strong>{ticket.creator_name}</strong> · {formatDate(ticket.created_at)}
                {ticket.updated_at !== ticket.created_at && ` · Updated ${formatDate(ticket.updated_at)}`}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <PriorityBadge value={ticket.priority} size="lg" />
            <StatusBadge   value={ticket.status}   size="lg" />
          </div>

          {/* Description */}
          {ticket.description && (
            <div style={{
              background: 'var(--bg)', borderRadius: 'var(--radius-md)',
              padding: '14px 16px', fontSize: 14, color: 'var(--text)', lineHeight: 1.7, marginBottom: 20,
            }}>
              {ticket.description}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 20 }} />

          {/* ── Manager: status update (comment required) ── */}
          {isManager && !isResolved && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>
                Update Status
              </div>
              <div style={{
                fontSize: 12,
                color: commentError ? 'var(--urgent)' : 'var(--text-muted)',
                marginBottom: 10,
                transition: 'color .2s',
              }}>
                {commentError
                  ? 'Please add a note below before updating the status.'
                  : 'Add a note below, then select the new status.'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {STATUSES.map(s => {
                  const isCurrent = ticket.status === s.value;
                  const dimmed = !hasComment && !isCurrent;
                  return (
                    <button
                      key={s.value}
                      disabled={updating || isCurrent}
                      onClick={() => handleStatusChange(s.value)}
                      style={{
                        padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                        cursor: isCurrent ? 'default' : 'pointer',
                        border: '1.5px solid',
                        borderColor: isCurrent ? s.color : dimmed ? 'var(--border)' : s.color + '80',
                        background: isCurrent ? s.color + '20' : 'var(--bg)',
                        color: isCurrent ? s.color : dimmed ? 'var(--text-light)' : s.color,
                        opacity: (updating || dimmed) ? (isCurrent ? 1 : 0.45) : 1,
                        transition: 'all .15s',
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Director: withdraw button ── */}
          {canWithdraw && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>
                Actions
              </div>
              <button
                disabled={withdrawing}
                onClick={handleWithdraw}
                style={{
                  padding: '8px 20px', borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--urgent)', background: 'transparent',
                  color: 'var(--urgent)', fontSize: 13, fontWeight: 600,
                  cursor: withdrawing ? 'not-allowed' : 'pointer',
                  opacity: withdrawing ? 0.6 : 1,
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { if (!withdrawing) e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {withdrawing ? 'Withdrawing…' : 'Withdraw Request'}
              </button>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                This will close the ticket and notify the account manager.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Comments / Notes ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
          Notes &amp; Updates ({ticket.comments?.length || 0})
        </div>

        {/* Comment list */}
        <div style={{ padding: '0 24px', maxHeight: 400, overflowY: 'auto' }}>
          {(!ticket.comments || ticket.comments.length === 0) ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No notes yet. Be the first to add one.
            </div>
          ) : (
            ticket.comments.map((c, i) => {
              const isMgr = c.role === 'account_manager';
              return (
                <div key={c.id} className="animate-in" style={{
                  padding: '14px 0',
                  borderBottom: i < ticket.comments.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                      background: isMgr ? 'var(--primary-light)' : 'var(--bg-alt)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 12,
                      color: isMgr ? 'var(--primary)' : 'var(--text-muted)',
                      border: `1px solid ${isMgr ? 'var(--primary)' : 'var(--border)'}`,
                    }}>
                      {c.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{c.full_name}</span>
                      {isMgr && (
                        <span style={{ fontSize: 10, background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 99, padding: '1px 6px', marginLeft: 6, fontWeight: 600 }}>
                          Account Manager
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--text-light)', marginLeft: 8 }}>{formatDate(c.created_at)}</span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 14, color: 'var(--text)', lineHeight: 1.6,
                    background: isMgr ? 'var(--primary-light)' : 'var(--bg)',
                    borderRadius: 'var(--radius-md)', padding: '10px 14px',
                    marginLeft: 38,
                  }}>
                    {c.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add comment form */}
        {!isResolved && (
          <form
            onSubmit={handleComment}
            style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-end' }}
          >
            <div style={{ flex: 1, position: 'relative' }}>
              {commentError && (
                <div style={{
                  position: 'absolute', top: -28, left: 0,
                  fontSize: 11, color: 'var(--urgent)', fontWeight: 600,
                  background: 'rgba(220,38,38,0.07)', borderRadius: 'var(--radius-xs)',
                  padding: '3px 8px', whiteSpace: 'nowrap',
                }}>
                  A note is required before updating status
                </div>
              )}
              <textarea
                ref={commentRef}
                value={comment}
                onChange={e => { setComment(e.target.value); if (commentError) setCommentError(false); }}
                placeholder={isManager ? 'Add a note before updating the ticket status…' : 'Add a note or ask Shady a question…'}
                rows={2}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  border: commentError ? '1.5px solid var(--urgent)' : '1.5px solid var(--border)',
                  outline: 'none', fontSize: 13,
                  background: 'var(--bg)', color: 'var(--text)', resize: 'none', lineHeight: 1.5,
                  transition: 'border .15s', boxSizing: 'border-box',
                }}
                onFocus={e => { if (!commentError) e.target.style.borderColor = 'var(--border-focus)'; }}
                onBlur={e => { if (!commentError) e.target.style.borderColor = 'var(--border)'; }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(e); } }}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              style={{
                padding: '10px 18px', borderRadius: 'var(--radius-md)', border: 'none',
                background: submitting || !comment.trim() ? 'var(--text-light)' : 'var(--primary)',
                color: '#fff', fontWeight: 600, fontSize: 13,
                cursor: submitting || !comment.trim() ? 'not-allowed' : 'pointer',
                transition: 'background .15s', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {submitting ? '…' : 'Send'}
            </button>
          </form>
        )}

        {isResolved && (
          <div style={{ padding: '14px 24px', background: 'var(--low-bg)', borderTop: '1px solid var(--low-border)', fontSize: 13, color: 'var(--low)', textAlign: 'center', fontWeight: 500 }}>
            This ticket is {ticket.status}. New comments are disabled.
          </div>
        )}
      </div>
    </div>
  );
}
