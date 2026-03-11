import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #EEF0FF 0%, #F7F5FF 50%, #FFF5EA 100%)',
      padding: 16,
    }}>
      {/* Decorative blobs */}
      <div style={{ position:'fixed', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'rgba(124,107,174,.08)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'rgba(255,159,67,.08)', pointerEvents:'none' }} />

      <div className="animate-slide" style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
        padding: '40px 36px', width: '100%', maxWidth: 420,
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✏️</div>
          <h1 style={{ fontWeight:800, fontSize:22, color:'var(--text)', marginBottom:6 }}>
            Little Scribblers
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>
            Centre Management Portal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontWeight:600, fontSize:13, color:'var(--text)', marginBottom:6 }}>
              Username
            </label>
            <input
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Enter your username"
              autoComplete="username"
              required
              style={{
                width:'100%', padding:'12px 14px', borderRadius:'var(--radius-md)',
                border:'1.5px solid var(--border)', outline:'none', fontSize:14,
                background:'var(--bg)', color:'var(--text)', transition:'border .15s',
              }}
              onFocus={e => e.target.style.borderColor='var(--border-focus)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontWeight:600, fontSize:13, color:'var(--text)', marginBottom:6 }}>
              Password
            </label>
            <div style={{ position:'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                style={{
                  width:'100%', padding:'12px 44px 12px 14px', borderRadius:'var(--radius-md)',
                  border:'1.5px solid var(--border)', outline:'none', fontSize:14,
                  background:'var(--bg)', color:'var(--text)', transition:'border .15s',
                }}
                onFocus={e => e.target.style.borderColor='var(--border-focus)'}
                onBlur={e => e.target.style.borderColor='var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', fontSize:16, color:'var(--text-muted)',
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background:'var(--urgent-bg)', border:'1px solid var(--urgent-border)',
              borderRadius:'var(--radius-sm)', padding:'10px 14px',
              fontSize:13, color:'var(--urgent)', marginBottom:16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width:'100%', padding:'13px', borderRadius:'var(--radius-md)', border:'none',
              background: loading ? 'var(--text-light)' : 'var(--primary)',
              fontSize:15, fontWeight:700, color:'#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition:'background .15s, transform .1s',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(124,107,174,.3)',
            }}
            onMouseEnter={e => !loading && (e.target.style.background='var(--primary-dark)')}
            onMouseLeave={e => !loading && (e.target.style.background='var(--primary)')}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        {/* Help text */}
        <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:'var(--text-light)' }}>
          Contact your administrator if you can't sign in
        </p>
      </div>
    </div>
  );
}
