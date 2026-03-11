import { useState } from 'react';
import { api } from '../api';
import { TICKET_TYPES, PRIORITIES } from '../constants';

const inputStyle = {
  width: '100%', padding: '10px 13px', borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--border)', outline: 'none', fontSize: 14,
  background: 'var(--bg)', color: 'var(--text)', transition: 'border .15s',
};

export default function NewTicketModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
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

  const selectedType     = TICKET_TYPES.find(t => t.value === form.type);
  const selectedPriority = PRIORITIES.find(p => p.value === form.priority);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, padding: 16,
        background: 'rgba(28,17,8,.5)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-slide" style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 580, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>Raise a Request</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              Step {step} of 2 &mdash; {step === 1 ? 'Select request type' : 'Fill in details'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: 'var(--text-muted)', lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', height: 3 }}>
          <div style={{ flex: 1, background: 'var(--primary)' }} />
          <div style={{ flex: 1, background: step === 2 ? 'var(--primary)' : 'var(--border)' }} />
        </div>

        {step === 1 ? (
          /* ── Step 1: Type selection ── */
          <div style={{ padding: '22px 24px 26px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TICKET_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => { set('type', t.value); setStep(2); }}
                  style={{
                    background: 'var(--bg)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '14px 14px 12px',
                    textAlign: 'left', transition: 'all .15s', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.background   = 'var(--primary-light)';
                    e.currentTarget.style.boxShadow    = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background   = 'var(--bg)';
                    e.currentTarget.style.boxShadow    = 'none';
                  }}
                >
                  {/* Abbr badge */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                    background: 'var(--primary-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'var(--primary)',
                    marginBottom: 6, letterSpacing: '.04em',
                  }}>
                    {t.abbr}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Step 2: Details ── */
          <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
            {/* Selected type + back */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--primary-light)', borderRadius: 'var(--radius-md)',
                padding: '7px 14px',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 'var(--radius-xs)',
                  background: 'var(--primary)', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '.04em',
                }}>
                  {selectedType?.abbr}
                </span>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>
                  {selectedType?.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '5px 10px',
                  fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                Change
              </button>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Subject <span style={{ color: 'var(--urgent)' }}>*</span>
              </label>
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder={`Briefly describe your ${selectedType?.label.toLowerCase()} request`}
                maxLength={120}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.target.style.borderColor  = 'var(--border)'}
              />
            </div>

            {/* Priority */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Priority Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {PRIORITIES.map(p => {
                  const sel = form.priority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => set('priority', p.value)}
                      style={{
                        background: sel ? p.bg : 'var(--bg)',
                        border:     `1.5px solid ${sel ? p.color : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)', padding: '10px 6px',
                        textAlign: 'center', cursor: 'pointer', transition: 'all .15s',
                      }}
                    >
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: p.color, margin: '0 auto 6px',
                      }} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: sel ? p.color : 'var(--text-muted)' }}>
                        {p.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                {selectedPriority?.desc}
              </p>
            </div>

            {/* Details */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Additional Details
              </label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Provide any context that will help Shady action this request…"
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 96, lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={e => e.target.style.borderColor  = 'var(--border)'}
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--urgent-bg)', border: '1px solid var(--urgent-border)',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                fontSize: 13, color: 'var(--urgent)', marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, padding: '11px', borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border)', background: 'none',
                  fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !form.title.trim()}
                style={{
                  flex: 2, padding: '11px', borderRadius: 'var(--radius-md)', border: 'none',
                  background: loading || !form.title.trim() ? 'var(--text-light)' : 'var(--primary)',
                  fontSize: 14, fontWeight: 600, color: '#fff',
                  cursor: loading || !form.title.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background .15s',
                }}
              >
                {loading ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
