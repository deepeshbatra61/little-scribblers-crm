import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import TicketCard from '../components/TicketCard';
import CustomSelect from '../components/CustomSelect';
import { TICKET_TYPES, PRIORITIES } from '../constants';

const STATUS_OPTIONS = [
  { value: 'active',       label: 'Active tickets' },
  { value: 'open',         label: 'Open' },
  { value: 'in_progress',  label: 'In Progress' },
  { value: 'pending_info', label: 'Pending Info' },
  { value: 'resolved',     label: 'Resolved' },
  { value: 'closed',       label: 'Closed' },
  { value: 'all',          label: 'All statuses' },
];

const StatBox = ({ label, value, color, sublabel }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '18px 20px', flex: 1, minWidth: 0,
  }}>
    <div style={{ fontSize: 26, fontWeight: 800, color: color || 'var(--text)', lineHeight: 1, marginBottom: 5 }}>
      {value ?? '—'}
    </div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
    {sublabel && <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 3 }}>{sublabel}</div>}
  </div>
);

export default function ManagerDashboard() {
  const [tickets, setTickets]         = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [filters, setFilters]         = useState({ status: 'active', priority: 'all', branch: 'all', type: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilters = { ...filters };
      if (apiFilters.status === 'active') delete apiFilters.status;
      const [t, s] = await Promise.all([
        api.getTickets(Object.fromEntries(Object.entries(apiFilters).filter(([, v]) => v && v !== 'all'))),
        api.getStats(),
      ]);
      const result = filters.status === 'active'
        ? t.filter(tk => !['resolved', 'closed'].includes(tk.status))
        : t;
      setTickets(result);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setFilter('search', searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const urgentCount = tickets.filter(t =>
    t.priority === 'urgent' && !['resolved', 'closed'].includes(t.status)
  ).length;

  const hasFilters = filters.priority !== 'all' || filters.type !== 'all' ||
    filters.branch !== 'all' || filters.status !== 'active' || filters.search;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>
          Ticket Queue — All Centres
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Manage and prioritise requests across all Little Scribblers branches
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatBox label="Open"         value={stats?.open}        color="var(--status-open)" />
        <StatBox label="In Progress"  value={stats?.in_progress} color="var(--status-progress)" />
        <StatBox label="Resolved"     value={stats?.resolved}    color="var(--status-resolved)" />
        <StatBox label="Added Today"  value={stats?.today}       color="var(--accent)" />
        {stats?.urgent > 0 && (
          <StatBox label="Urgent"     value={stats?.urgent}      color="var(--urgent)" sublabel="Needs immediate action" />
        )}
      </div>

      {/* Branch pills */}
      {stats?.branches?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {stats.branches.map(b => {
            const active = filters.branch === b.branch;
            return (
              <button
                key={b.branch}
                onClick={() => setFilter('branch', active ? 'all' : b.branch)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: active ? 'var(--primary-light)' : 'var(--surface)',
                  border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', padding: '6px 14px',
                  cursor: 'pointer', transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: active ? 'var(--primary)' : 'var(--text)' }}>
                  {b.branch}
                </span>
                {b.active > 0 && (
                  <span style={{
                    background: b.urgent > 0 ? 'var(--urgent)' : 'var(--primary)',
                    color: '#fff', borderRadius: 99, padding: '1px 7px',
                    fontSize: 10, fontWeight: 700,
                  }}>
                    {b.active}{b.urgent > 0 ? ` · ${b.urgent} urgent` : ''}
                  </span>
                )}
              </button>
            );
          })}
          {filters.branch !== 'all' && (
            <button
              onClick={() => setFilter('branch', 'all')}
              style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Urgent banner */}
      {urgentCount > 0 && filters.priority !== 'urgent' && (
        <div
          onClick={() => setFilter('priority', 'urgent')}
          style={{
            background: 'var(--urgent-bg)', border: '1.5px solid var(--urgent-border)',
            borderRadius: 'var(--radius-md)', padding: '12px 18px', marginBottom: 20,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: 'var(--urgent)',
            flexShrink: 0, animation: 'pulse 2s infinite',
          }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--urgent)' }}>
              {urgentCount} urgent request{urgentCount > 1 ? 's' : ''} require{urgentCount === 1 ? 's' : ''} immediate attention
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click to filter urgent tickets</div>
          </div>
          <span style={{ marginLeft: 'auto', color: 'var(--urgent)', fontWeight: 700, fontSize: 13 }}>View →</span>
        </div>
      )}

      {/* Filter bar */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '12px 16px',
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search tickets…"
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
              borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)',
              outline: 'none', fontSize: 13, background: 'var(--bg)', color: 'var(--text)',
              transition: 'border .15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <CustomSelect
          value={filters.status}
          onChange={v => setFilter('status', v)}
          options={STATUS_OPTIONS}
          minWidth={152}
        />

        <CustomSelect
          value={filters.priority}
          onChange={v => setFilter('priority', v)}
          options={[
            { value: 'all', label: 'All priorities' },
            ...PRIORITIES.map(p => ({ value: p.value, label: p.label, dot: p.color })),
          ]}
          minWidth={148}
        />

        <CustomSelect
          value={filters.type}
          onChange={v => setFilter('type', v)}
          options={[
            { value: 'all', label: 'All types' },
            ...TICKET_TYPES.map(t => ({ value: t.value, label: t.label })),
          ]}
          minWidth={148}
        />

        {hasFilters && (
          <button
            onClick={() => { setFilters({ status: 'active', priority: 'all', branch: 'all', type: 'all', search: '' }); setSearchInput(''); }}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              padding: '7px 12px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Count */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500 }}>
        {loading ? 'Loading…' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}${filters.branch !== 'all' ? ` · ${filters.branch}` : ''}`}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          Loading tickets…
        </div>
      ) : tickets.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border)',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>No tickets found</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Adjust your filters or enjoy the quiet!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tickets.map(t => <TicketCard key={t.id} ticket={t} showBranch />)}
        </div>
      )}
    </div>
  );
}
