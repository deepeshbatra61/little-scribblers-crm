import { getPriority, getStatus, getType } from '../constants';

export const PriorityBadge = ({ value, size = 'sm' }) => {
  const p = getPriority(value);
  const pad = size === 'lg' ? '5px 12px' : '3px 8px';
  const fs  = size === 'lg' ? 13 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: p.bg, color: p.color, border: `1px solid ${p.border}`,
      borderRadius: 99, padding: pad, fontSize: fs, fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {p.icon} {p.label}
    </span>
  );
};

export const StatusBadge = ({ value, size = 'sm' }) => {
  const s = getStatus(value);
  const pad = size === 'lg' ? '5px 12px' : '3px 8px';
  const fs  = size === 'lg' ? 13 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.color + '18', color: s.color,
      borderRadius: 99, padding: pad, fontSize: fs, fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background: s.color, flexShrink:0 }} />
      {s.label}
    </span>
  );
};

export const TypeBadge = ({ value }) => {
  const t = getType(value);
  if (!t) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'var(--primary-light)', color: 'var(--primary)',
      borderRadius: 99, padding: '3px 8px', fontSize: 11, fontWeight: 500,
    }}>
      {t.icon} {t.label}
    </span>
  );
};
