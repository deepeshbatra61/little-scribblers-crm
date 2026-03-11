import { getPriority, getStatus, getType } from '../constants';

export const PriorityBadge = ({ value, size = 'sm' }) => {
  const p   = getPriority(value);
  const pad = size === 'lg' ? '5px 12px' : '3px 9px';
  const fs  = size === 'lg' ? 12 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: p.bg, color: p.color, border: `1px solid ${p.border}`,
      borderRadius: 99, padding: pad, fontSize: fs, fontWeight: 600,
      whiteSpace: 'nowrap', letterSpacing: '.01em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
      {p.label}
    </span>
  );
};

export const StatusBadge = ({ value, size = 'sm' }) => {
  const s   = getStatus(value);
  const pad = size === 'lg' ? '5px 12px' : '3px 9px';
  const fs  = size === 'lg' ? 12 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: s.color + '15', color: s.color,
      borderRadius: 99, padding: pad, fontSize: fs, fontWeight: 600,
      whiteSpace: 'nowrap', letterSpacing: '.01em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  );
};

export const TypeBadge = ({ value }) => {
  const t = getType(value);
  if (!t) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'var(--primary-light)', color: 'var(--primary)',
      borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600,
      letterSpacing: '.01em',
    }}>
      {t.label}
    </span>
  );
};
