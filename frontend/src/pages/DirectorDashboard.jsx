import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import TicketCard from '../components/TicketCard';
import NewTicketModal from '../components/NewTicketModal';

const StatBox = ({ label, value, color }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '18px 20px', flex: 1, minWidth: 0,
  }}>
    <div style={{
      fontSize: 26, fontWeight: 800,
      color: color || 'var(--text)', lineHeight: 1, marginBottom: 5,
    }}>
      {value ?? '—'}
    </div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
  </div>
);

export default function DirectorDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets]       = useState([]);
  const [stats, setStats]           = useState(null);
  const [statusFilter, setFilter]   = useState('active');
  const [showModal, setShowModal]   = useState(false);
  const [loading, setLoading]       = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([api.getTickets(), api.getStats()]);
      setTickets(t);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tickets.filter(t => {
    if (statusFilter === 'active')   return !['resolved', 'closed'].includes(t.status);
    if (statusFilter === 'resolved') return  ['resolved', 'closed'].includes(t.status);
    return t.status === statusFilter;
  });

  const handleCreated = ticket => {
    setTickets(prev => [ticket, ...prev]);
    setShowModal(false);
    load();
  };

  const tabs = [
    { key: 'active',       label: 'Active' },
    { key: 'open',         label: 'Open' },
    { key: 'in_progress',  label: 'In Progress' },
    { key: 'pending_info', label: 'Pending Info' },
    { key: 'resolved',     label: 'Resolved' },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>
          Welcome, {user?.full_name}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {user?.branch} Branch &mdash; Your request overview
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatBox label="Total Raised"  value={stats?.total}       />
        <StatBox label="Open"          value={stats?.open}        color="var(--status-open)" />
        <StatBox label="In Progress"   value={stats?.in_progress} color="var(--status-progress)" />
        <StatBox label="Resolved"      value={stats?.resolved}    color="var(--status-resolved)" />
        {stats?.urgent > 0 && (
          <StatBox label="Urgent"      value={stats?.urgent}      color="var(--urgent)" />
        )}
      </div>

      {/* Raise ticket */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          width: '100%', padding: '15px', borderRadius: 'var(--radius-lg)',
          background: 'var(--primary)', border: 'none',
          color: '#fff', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', marginBottom: 28, letterSpacing: '.01em',
          boxShadow: '0 4px 14px rgba(134,93,54,.28)',
          transition: 'background .15s, transform .15s, box-shadow .15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background  = 'var(--primary-dark)';
          e.currentTarget.style.transform   = 'translateY(-1px)';
          e.currentTarget.style.boxShadow   = '0 6px 18px rgba(134,93,54,.35)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background  = 'var(--primary)';
          e.currentTarget.style.transform   = 'translateY(0)';
          e.currentTarget.style.boxShadow   = '0 4px 14px rgba(134,93,54,.28)';
        }}
      >
        + Raise a New Request
      </button>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map(f => {
          const active = statusFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 15px', borderRadius: 'var(--radius-md)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: '1.5px solid',
                borderColor: active ? 'var(--primary)' : 'var(--border)',
                background:  active ? 'var(--primary-light)' : 'var(--surface)',
                color:       active ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all .15s',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          Loading your requests…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '56px 20px',
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border)',
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>No tickets found</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {statusFilter === 'active' ? 'All caught up!' : 'No tickets match this filter.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(t => <TicketCard key={t.id} ticket={t} />)}
        </div>
      )}

      {showModal && <NewTicketModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
    </div>
  );
}
