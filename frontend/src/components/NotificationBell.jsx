import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { formatDate } from '../constants';

const BellIcon = ({ hasUnread }) => (
  <div style={{ position: 'relative', display: 'inline-flex' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    {hasUnread && (
      <span style={{
        position: 'absolute', top: -2, right: -2,
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--urgent)',
        border: '1.5px solid var(--surface)',
        animation: 'pulse 2.5s infinite',
      }} />
    )}
  </div>
);

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const unread = notifications.filter(n => !n.is_read).length;

  const load = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch { /* silently fail */ }
  }, []);

  // Poll every 25 seconds
  useEffect(() => {
    load();
    const interval = setInterval(load, 25000);
    return () => clearInterval(interval);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = async () => {
    setOpen(o => !o);
    if (!open && unread > 0) {
      await api.markAllRead().catch(() => {});
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    }
  };

  const handleClearAll = async e => {
    e.stopPropagation();
    await api.clearNotifications().catch(() => {});
    setNotifications([]);
    setOpen(false);
  };

  const handleClick = (n) => {
    setOpen(false);
    if (n.ticket_id) navigate(`/tickets/${n.ticket_id}`);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          background: open ? 'var(--primary-light)' : 'none',
          border: `1.5px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          width: 38, height: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: open ? 'var(--primary)' : 'var(--text-muted)',
          transition: 'all .15s',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
      >
        <BellIcon hasUnread={unread > 0} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="animate-in"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 500,
            width: 340, background: 'var(--surface)',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Notifications</span>
              {unread > 0 && (
                <span style={{
                  background: 'var(--urgent)', color: '#fff',
                  borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700,
                }}>
                  {unread}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  background: 'none', border: 'none', fontSize: 12,
                  color: 'var(--text-muted)', cursor: 'pointer',
                  padding: '3px 6px', borderRadius: 'var(--radius-xs)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--urgent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                You're all caught up
              </div>
            ) : (
              notifications.map((n, i) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    width: '100%', display: 'block', padding: '12px 16px',
                    textAlign: 'left', background: n.is_read ? 'transparent' : 'var(--primary-light)',
                    border: 'none', borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: n.ticket_id ? 'pointer' : 'default',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => { if (n.ticket_id) e.currentTarget.style.background = 'var(--bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.is_read ? 'transparent' : 'var(--primary-light)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    {/* Dot */}
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                      background: n.is_read ? 'var(--border)' : 'var(--primary)',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: n.is_read ? 400 : 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
                        {n.title}
                      </div>
                      {n.body && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {n.body}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                        {formatDate(n.created_at)}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
