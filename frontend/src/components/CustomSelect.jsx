import { useState, useRef, useEffect } from 'react';

const ChevronDown = ({ open }) => (
  <svg
    width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function CustomSelect({ value, onChange, options, minWidth = 148 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, padding: '9px 13px',
          borderRadius: 'var(--radius-md)',
          border: `1.5px solid ${open ? 'var(--border-focus)' : 'var(--border)'}`,
          background: 'var(--surface)', color: 'var(--text)',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          boxShadow: open ? '0 0 0 3px rgba(134,93,54,0.12)' : 'none',
          transition: 'border-color .15s, box-shadow .15s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {selected?.dot && (
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: selected.dot, flexShrink: 0 }} />
          )}
          <span style={{ color: selected ? 'var(--text)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selected?.label || 'Select…'}
          </span>
        </span>
        <ChevronDown open={open} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="animate-in"
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
            minWidth: '100%', background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}
        >
          {options.map(opt => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '9px 14px', border: 'none',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'var(--text)',
                  fontSize: 13, fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap',
                  transition: 'background .1s',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                {opt.dot && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />
                )}
                {opt.label}
                {isSelected && (
                  <svg style={{ marginLeft: 'auto' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
