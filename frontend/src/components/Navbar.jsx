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
      padding: '0 28px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 0 var(--border)',
    }}>
      {/* Logo + Brand */}
      <button
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', padding: 0 }}
      >
        <img
          src="/LS.png"
          alt="Little Scribblers"
          style={{ height: 38, width: 38, objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1.2 }}>
            Little Scribblers
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Centre Management
          </div>
        </div>
      </button>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* User info */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', lineHeight: 1.3 }}>
            {user?.full_name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {user?.role === 'account_manager' ? 'Account Manager' : user?.branch + ' Branch'}
          </div>
        </div>

        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, color: '#fff',
          flexShrink: 0,
        }}>
          {user?.full_name?.[0]?.toUpperCase()}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

        {/* Sign out */}
        <button
          onClick={handleLogout}
          style={{
            background: 'none', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '7px 16px',
            fontSize: 13, fontWeight: 500, color: 'var(--text-muted)',
            transition: 'all .15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
