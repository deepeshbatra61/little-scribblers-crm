import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import TicketCard from '../components/TicketCard';
import { TICKET_TYPES, PRIORITIES, BRANCHES } from '../constants';

const StatBox = ({ label, value, color, icon, sublabel }) => (
  <div style={{
    background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)',
    padding:'16px 20px', flex:1, minWidth:0,
  }}>
    <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
    <div style={{ fontSize:28, fontWeight:800, color: color || 'var(--text)', lineHeight:1 }}>{value ?? '—'}</div>
    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{label}</div>
    {sublabel && <div style={{ fontSize:11, color: color, marginTop:2, fontWeight:600 }}>{sublabel}</div>}
  </div>
);

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'active', priority: 'all', branch: 'all', type: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilters = { ...filters };
      // 'active' is a UI concept — translate to actual statuses on frontend
      if (apiFilters.status === 'active') delete apiFilters.status;
      const [t, s] = await Promise.all([
        api.getTickets(Object.fromEntries(Object.entries(apiFilters).filter(([, v]) => v && v !== 'all'))),
        api.getStats(),
      ]);
      // Frontend-side active filter
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

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setFilter('search', searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const urgentCount = tickets.filter(t => t.priority === 'urgent' && !['resolved','closed'].includes(t.status)).length;

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontWeight:800, fontSize:22, color:'var(--text)', marginBottom:4 }}>
          All Centres — Ticket Queue 📋
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>
          Manage and prioritise requests across all Little Scribblers branches
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <StatBox icon="📬" label="Total Active"    value={stats?.open}        color="var(--status-open)" />
        <StatBox icon="⚡" label="In Progress"      value={stats?.in_progress} color="var(--status-progress)" />
        <StatBox icon="✅" label="Resolved"          value={stats?.resolved}    color="var(--status-resolved)" />
        <StatBox icon="📅" label="Added Today"       value={stats?.today}       color="var(--primary)" />
        {(stats?.urgent > 0) && (
          <StatBox icon="🚨" label="Urgent Pending"  value={stats?.urgent}      color="var(--urgent)" sublabel="Needs immediate action" />
        )}
      </div>

      {/* Branch overview pills */}
      {stats?.branches?.length > 0 && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
          {stats.branches.map(b => (
            <button
              key={b.branch}
              onClick={() => setFilter('branch', filters.branch === b.branch ? 'all' : b.branch)}
              style={{
                display:'flex', alignItems:'center', gap:6,
                background: filters.branch === b.branch ? 'var(--primary-light)' : 'var(--surface)',
                border: `1.5px solid ${filters.branch === b.branch ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius:99, padding:'6px 14px', cursor:'pointer', transition:'all .15s',
              }}
            >
              <span style={{ fontSize:11, fontWeight:600, color: filters.branch === b.branch ? 'var(--primary)' : 'var(--text)' }}>
                📍 {b.branch}
              </span>
              {b.active > 0 && (
                <span style={{
                  background: b.urgent > 0 ? 'var(--urgent)' : 'var(--primary)',
                  color:'#fff', borderRadius:99, padding:'1px 7px', fontSize:10, fontWeight:700,
                }}>
                  {b.active}{b.urgent > 0 ? ` (${b.urgent} 🚨)` : ''}
                </span>
              )}
            </button>
          ))}
          {filters.branch !== 'all' && (
            <button onClick={() => setFilter('branch', 'all')} style={{ background:'none', border:'none', fontSize:12, color:'var(--text-muted)', cursor:'pointer', textDecoration:'underline' }}>
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
            background:'linear-gradient(135deg, var(--urgent-bg) 0%, #FFF 100%)',
            border:'1.5px solid var(--urgent-border)', borderRadius:'var(--radius-md)',
            padding:'12px 16px', marginBottom:20, cursor:'pointer',
            display:'flex', alignItems:'center', gap:10,
          }}
        >
          <span style={{ fontSize:20 }}>🚨</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'var(--urgent)' }}>
              {urgentCount} urgent ticket{urgentCount > 1 ? 's' : ''} need{urgentCount === 1 ? 's' : ''} immediate attention
            </div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Click to filter urgent only</div>
          </div>
          <span style={{ marginLeft:'auto', color:'var(--urgent)', fontWeight:700 }}>View →</span>
        </div>
      )}

      {/* Filter bar */}
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-md)', padding:'14px 16px',
        display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:20,
      }}>
        {/* Search */}
        <div style={{ position:'relative', flex:'1 1 200px', minWidth:180 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:14 }}>🔍</span>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search tickets…"
            style={{
              width:'100%', paddingLeft:32, paddingRight:12, paddingTop:8, paddingBottom:8,
              borderRadius:'var(--radius-sm)', border:'1.5px solid var(--border)',
              outline:'none', fontSize:13, background:'var(--bg)', color:'var(--text)',
              transition:'border .15s',
            }}
            onFocus={e => e.target.style.borderColor='var(--border-focus)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={e => setFilter('status', e.target.value)}
          style={selectStyle}
        >
          <option value="active">Active tickets</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="pending_info">Pending Info</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
          <option value="all">All statuses</option>
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={e => setFilter('priority', e.target.value)}
          style={selectStyle}
        >
          <option value="all">All priorities</option>
          {PRIORITIES.map(p => (
            <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
          ))}
        </select>

        {/* Type */}
        <select
          value={filters.type}
          onChange={e => setFilter('type', e.target.value)}
          style={selectStyle}
        >
          <option value="all">All types</option>
          {TICKET_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
          ))}
        </select>

        {/* Clear */}
        {(filters.priority !== 'all' || filters.type !== 'all' || filters.branch !== 'all' || filters.status !== 'active' || filters.search) && (
          <button
            onClick={() => { setFilters({ status:'active', priority:'all', branch:'all', type:'all', search:'' }); setSearchInput(''); }}
            style={{ background:'none', border:'none', fontSize:12, color:'var(--text-muted)', cursor:'pointer', textDecoration:'underline', whiteSpace:'nowrap' }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14 }}>
        {loading ? 'Loading…' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`}
        {filters.branch !== 'all' && ` · ${filters.branch}`}
      </div>

      {/* Ticket list */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <div style={{ fontSize:32, marginBottom:12, animation:'pulse 1.5s infinite' }}>⏳</div>
          Loading tickets…
        </div>
      ) : tickets.length === 0 ? (
        <div style={{
          textAlign:'center', padding:'60px 20px',
          background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px dashed var(--border)',
        }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
          <div style={{ fontWeight:600, color:'var(--text)', marginBottom:6 }}>No tickets here</div>
          <div style={{ fontSize:13, color:'var(--text-muted)' }}>Adjust your filters or enjoy the quiet!</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {tickets.map(t => <TicketCard key={t.id} ticket={t} showBranch />)}
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1.5px solid var(--border)',
  outline:'none', fontSize:13, background:'var(--bg)', color:'var(--text)',
  cursor:'pointer', transition:'border .15s',
};
