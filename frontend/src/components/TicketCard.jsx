import { useNavigate } from 'react-router-dom';
import { PriorityBadge, StatusBadge, TypeBadge } from './Badges';
import { formatDate } from '../constants';

const priorityBar = {
  urgent: 'var(--urgent)',
  high:   'var(--high)',
  medium: 'var(--medium)',
  low:    'var(--low)',
};

export default function TicketCard({ ticket, showBranch = false }) {
  const navigate = useNavigate();
  const isUrgent = ticket.priority === 'urgent';
  const isActive = !['resolved', 'closed'].includes(ticket.status);

  return (
    <div
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className="animate-in"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isUrgent && isActive ? 'var(--urgent-border)' : 'var(--border)'}`,
        borderLeft: `3px solid ${priorityBar[ticket.priority] || 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        cursor: 'pointer',
        transition: 'box-shadow .15s, transform .15s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Urgent label */}
      {isUrgent && isActive && (
        <span style={{
          position: 'absolute', top: 12, right: 14,
          background: 'var(--urgent)', color: '#fff',
          borderRadius: 'var(--radius-xs)', padding: '2px 8px',
          fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
          animation: 'pulse 2.5s infinite',
        }}>
          URGENT
        </span>
      )}

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)',
          background: 'var(--bg)', padding: '2px 7px', borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border)',
        }}>
          {ticket.ticket_number}
        </span>
        <TypeBadge value={ticket.type} />
        {showBranch && (
          <span style={{
            fontSize: 11, color: 'var(--accent)', fontWeight: 600,
            background: 'var(--accent-light)', borderRadius: 99, padding: '2px 9px',
          }}>
            {ticket.branch}
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 5, lineHeight: 1.4 }}>
        {ticket.title}
      </div>

      {/* Description preview */}
      {ticket.description && (
        <div style={{
          fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {ticket.description}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <PriorityBadge value={ticket.priority} />
          <StatusBadge   value={ticket.status} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 500 }}>
          {formatDate(ticket.created_at)}
        </span>
      </div>
    </div>
  );
}
