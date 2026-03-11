import { useState } from 'react';
import { api } from '../api';
import { TICKET_TYPES, PRIORITIES } from '../constants';

export default function NewTicketModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);  // 1=type, 2=details
  const [form, setForm] = useState({ type: '', priority: 'medium', title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.type || !form.title.trim()) return;
    setLoading(true);
    setError('');
    try {
      const ticket = await api.createTicket(form);
      onCreated(ticket);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedType = TICKET_TYPES.find(t => t.value === form.type);
  const selectedPriority = PRIORITIES.find(p => p.value === form.priority);

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(45,37,80,.45)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-slide" style={{
        background:'var(--surface)', borderRadius:'var(--radius-xl)',
        width:'100%', maxWidth:580, boxShadow:'var(--shadow-lg)',
        overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontWeight:700, fontSize:18, color:'var(--text)' }}>Raise a Ticket</h2>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
              Step {step} of 2 — {step === 1 ? 'Choose request type' : 'Add details'}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, color:'var(--text-muted)', lineHeight:1 }}>×</button>
        </div>

        {step === 1 ? (
          /* Step 1: Type Selection */
          <div style={{ padding:'20px 24px 24px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {TICKET_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => { set('type', t.value); setStep(2); }}
                  style={{
                    background: form.type === t.value ? 'var(--primary-light)' : 'var(--bg)',
                    border: `1.5px solid ${form.type === t.value ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius:'var(--radius-md)', padding:'14px 14px 12px',
                    textAlign:'left', transition:'all .15s', cursor:'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--primary-light)'; }}
                  onMouseLeave={e => { if(form.type !== t.value) { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg)'; }}}
                >
                  <div style={{ fontSize:24, marginBottom:6 }}>{t.icon}</div>
                  <div style={{ fontWeight:600, fontSize:13, color:'var(--text)', marginBottom:3 }}>{t.label}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.4 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Step 2: Details */
          <form onSubmit={handleSubmit} style={{ padding:'20px 24px 24px' }}>
            {/* Type pill + back */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--primary-light)', borderRadius:99, padding:'6px 14px' }}>
                <span style={{ fontSize:18 }}>{selectedType?.icon}</span>
                <span style={{ fontWeight:600, fontSize:13, color:'var(--primary)' }}>{selectedType?.label}</span>
              </div>
              <button type="button" onClick={() => setStep(1)} style={{ background:'none', border:'none', fontSize:12, color:'var(--text-muted)', textDecoration:'underline', cursor:'pointer' }}>
                Change type
              </button>
            </div>

            {/* Title */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:13, color:'var(--text)', marginBottom:6 }}>
                Subject <span style={{ color:'var(--urgent)' }}>*</span>
              </label>
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder={`Brief description of your ${selectedType?.label.toLowerCase()} request`}
                maxLength={120}
                required
                style={{
                  width:'100%', padding:'10px 12px', borderRadius:'var(--radius-sm)',
                  border:'1.5px solid var(--border)', outline:'none', fontSize:14,
                  background:'var(--bg)', color:'var(--text)', transition:'border .15s',
                }}
                onFocus={e => e.target.style.borderColor='var(--border-focus)'}
                onBlur={e => e.target.style.borderColor='var(--border)'}
              />
            </div>

            {/* Priority */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:13, color:'var(--text)', marginBottom:8 }}>
                Priority
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8 }}>
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => set('priority', p.value)}
                    style={{
                      background: form.priority === p.value ? p.bg : 'var(--bg)',
                      border: `1.5px solid ${form.priority === p.value ? p.border : 'var(--border)'}`,
                      borderRadius:'var(--radius-sm)', padding:'10px 6px', textAlign:'center',
                      cursor:'pointer', transition:'all .15s',
                    }}
                  >
                    <div style={{ fontSize:18, marginBottom:4 }}>{p.icon}</div>
                    <div style={{ fontSize:11, fontWeight:600, color: form.priority === p.value ? p.color : 'var(--text-muted)' }}>
                      {p.label}
                    </div>
                  </button>
                ))}
              </div>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>
                {selectedPriority?.desc}
              </p>
            </div>

            {/* Description */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:13, color:'var(--text)', marginBottom:6 }}>
                Details
              </label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Provide any additional details that will help Shady action this request…"
                rows={4}
                style={{
                  width:'100%', padding:'10px 12px', borderRadius:'var(--radius-sm)',
                  border:'1.5px solid var(--border)', outline:'none', fontSize:14,
                  background:'var(--bg)', color:'var(--text)', resize:'vertical',
                  minHeight:100, lineHeight:1.5, transition:'border .15s',
                }}
                onFocus={e => e.target.style.borderColor='var(--border-focus)'}
                onBlur={e => e.target.style.borderColor='var(--border)'}
              />
            </div>

            {error && (
              <div style={{ background:'var(--urgent-bg)', border:'1px solid var(--urgent-border)', borderRadius:'var(--radius-sm)', padding:'10px 14px', fontSize:13, color:'var(--urgent)', marginBottom:16 }}>
                {error}
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button type="button" onClick={onClose} style={{
                flex:1, padding:'12px', borderRadius:'var(--radius-md)', border:'1.5px solid var(--border)',
                background:'none', fontSize:14, fontWeight:500, color:'var(--text-muted)', cursor:'pointer',
              }}>
                Cancel
              </button>
              <button type="submit" disabled={loading || !form.title.trim()} style={{
                flex:2, padding:'12px', borderRadius:'var(--radius-md)', border:'none',
                background: loading ? 'var(--text-light)' : 'var(--primary)',
                fontSize:14, fontWeight:600, color:'#fff', cursor: loading ? 'not-allowed' : 'pointer',
                transition:'background .15s',
              }}>
                {loading ? 'Submitting…' : '✓ Submit Ticket'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
