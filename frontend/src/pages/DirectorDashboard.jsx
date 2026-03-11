import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import TicketCard from '../components/TicketCard';
import NewTicketModal from '../components/NewTicketModal';
import { STATUSES } from '../constants';

const StatBox = ({ label, value, color, icon }) => (
  <div style={{
    background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)',
    padding:'16px 20px', flex:1, minWidth:0,
  }}>
    <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
    <div style={{ fontSize:28, fontWeight:800, color: color || 'var(--text)', lineHeight:1 }}>{value ?? '—'}</div>
    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{label}</div>
  </div>
);

export default function DirectorDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (statusFilter === 'active') return !['resolved', 'closed'].includes(t.status);
    if (statusFilter === 'resolved') return ['resolved', 'closed'].includes(t.status);
    return t.status === statusFilter;
  });

  const handleCreated = ticket => {
    setTickets(prev => [ticket, ...prev]);
    setShowModal(false);
    load(); // refresh stats
  };

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'28px 20px' }}>
      {/* Welcome */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontWeight:800, fontSize:22, color:'var(--text)', marginBottom:4 }}>
          Good day, {user?.full_name} 👋
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>
          📍 {user?.branch} Branch — Here's your ticket overview
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:12, marginBottom:28, flexWrap:'wrap' }}>
        <StatBox icon="📬" label="Total Raised"    value={stats?.total}       color="var(--text)" />
        <StatBox icon="🟡" label="Open"             value={stats?.open}        color="var(--status-open)" />
        <StatBox icon="⚡" label="In Progress"      value={stats?.in_progress} color="var(--status-progress)" />
        <StatBox icon="✅" label="Resolved"          value={stats?.resolved}    color="var(--status-resolved)" />
        {(stats?.urgent > 0) && (
          <StatBox icon="🚨" label="Urgent Active"  value={stats?.urgent}      color="var(--urgent)" />
        )}
      </div>

      {/* Raise ticket CTA */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          width:'100%', padding:'16px', borderRadius:'var(--radius-lg)',
          background:'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          border:'none', color:'#fff', fontSize:15, fontWeight:700,
          cursor:'pointer', marginBottom:28,
          boxShadow:'0 4px 16px rgba(124,107,174,.3)',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          transition:'transform .15s, box-shadow .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(124,107,174,.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(124,107,174,.3)'; }}
      >
        <span style={{ fontSize:20 }}>+</span>
        Raise a New Ticket
      </button>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {[
          { key:'active',   label:'Active' },
          { key:'open',     label:'Open' },
          { key:'in_progress', label:'In Progress' },
          { key:'pending_info', label:'Pending Info' },
          { key:'resolved', label:'Resolved' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            style={{
              padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:500, cursor:'pointer',
              border:'1.5px solid',
              borderColor: statusFilter === f.key ? 'var(--primary)' : 'var(--border)',
              background: statusFilter === f.key ? 'var(--primary-light)' : 'var(--surface)',
              color: statusFilter === f.key ? 'var(--primary)' : 'var(--text-muted)',
              transition:'all .15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text-muted)' }}>
          <div style={{ fontSize:32, marginBottom:12, animation:'pulse 1.5s infinite' }}>⏳</div>
          Loading your tickets…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign:'center', padding:'60px 20px',
          background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px dashed var(--border)',
        }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
          <div style={{ fontWeight:600, color:'var(--text)', marginBottom:6 }}>No tickets here</div>
          <div style={{ fontSize:13, color:'var(--text-muted)' }}>
            {statusFilter === 'active' ? 'Everything is up to date!' : 'No tickets match this filter.'}
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(t => <TicketCard key={t.id} ticket={t} />)}
        </div>
      )}

      {showModal && <NewTicketModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
    </div>
  );
}
