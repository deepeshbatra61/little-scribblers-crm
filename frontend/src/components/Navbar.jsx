import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', padding:0 }}
      >
        <span style={{ fontSize: 22 }}>✏️</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>
          Little Scribblers
        </span>
        <span style={{
          fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
          background: 'var(--primary-light)', borderRadius: 99, padding: '2px 8px',
        }}>
          CRM
        </span>
      </button>

      {/* Right side */}
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        {/* User info */}
        <div style={{ textAlign:'right' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
            {user?.full_name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {user?.role === 'account_manager' ? 'Account Manager' : user?.branch}
          </div>
        </div>

        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, color: 'var(--primary)',
          flexShrink: 0,
        }}>
          {user?.full_name?.[0]?.toUpperCase()}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '6px 14px',
            fontSize: 13, color: 'var(--text-muted)',
            transition: 'all .15s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--urgent)'; e.target.style.color = 'var(--urgent)'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
