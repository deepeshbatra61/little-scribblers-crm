import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border)', outline: 'none', fontSize: 14,
    background: 'var(--bg)', color: 'var(--text)', transition: 'border .15s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(150deg, #F5E8D8 0%, #FAF8F5 55%, #E0F2F4 100%)',
      padding: 16,
    }}>
      {/* Subtle background shapes */}
      <div style={{ position: 'fixed', top: -100, right: -100, width: 380, height: 380, borderRadius: '50%', background: 'rgba(134,93,54,.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(44,95,110,.06)', pointerEvents: 'none' }} />

      <div className="animate-slide" style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
        padding: '44px 40px', width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <img
            src="/LS.png"
            alt="Little Scribblers"
            style={{ height: 64, width: 64, objectFit: 'contain', borderRadius: 'var(--radius-md)', marginBottom: 14 }}
          />
          <h1 style={{ fontWeight: 800, fontSize: 20, color: 'var(--text)', marginBottom: 4 }}>
            Little Scribblers
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Centre Management Portal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Username
            </label>
            <input
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Enter your username"
              autoComplete="username"
              autoFocus
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                }}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--urgent-bg)', border: '1px solid var(--urgent-border)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px',
              fontSize: 13, color: 'var(--urgent)', marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 'var(--radius-md)', border: 'none',
              background: loading ? 'var(--text-light)' : 'var(--primary)',
              fontSize: 14, fontWeight: 700, color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background .15s',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(134,93,54,.28)',
              letterSpacing: '.01em',
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--primary-dark)')}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = 'var(--primary)')}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-light)' }}>
          Contact your administrator if you can't sign in
        </p>
      </div>
    </div>
  );
}
