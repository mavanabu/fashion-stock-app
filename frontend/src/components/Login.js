import { useState } from 'react';
import { authApi } from '../api';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const switchMode = (m) => { setMode(m); setError(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const d = mode === 'login'
        ? await authApi.login(email, password)
        : await authApi.register(email, password);
      if (d.error) { setError(d.error); return; }
      localStorage.setItem('fashion_token', d.token);
      localStorage.setItem('fashion_user', JSON.stringify(d.user));
      onLogin(d.user);
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#13091f',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 48,
        background: 'linear-gradient(145deg, #1e0a35 0%, #13091f 60%, #0d1a3a 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 28px',
            boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
          }}>👗</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Fashion Stock
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Delivery Management Platform
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['Track deliveries in real time', 'Manage brands & collections', 'Analyse payment status'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#a78bfa', fontSize: 12 }}>✓</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: 460, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff', padding: 48,
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, color: '#1c1433' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ margin: '0 0 32px', fontSize: 14, color: '#6b5f82' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Get started today'}
          </p>

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: '#f0eef8', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {[['login', 'Sign In'], ['register', 'Register']].map(([m, lbl]) => (
              <button key={m} onClick={() => switchMode(m)} style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: 8,
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? '#7c3aed' : '#6b5f82',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>{lbl}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#4a3f5c', display: 'block', marginBottom: 6 }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com"
                style={{
                  width: '100%', padding: '11px 14px', border: '1.5px solid #e5e0f3',
                  borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s', background: '#faf9fe',
                }}
                onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                onBlur={e => e.target.style.borderColor = '#e5e0f3'}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#4a3f5c', display: 'block', marginBottom: 6 }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••" minLength={6}
                style={{
                  width: '100%', padding: '11px 14px', border: '1.5px solid #e5e0f3',
                  borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s', background: '#faf9fe',
                }}
                onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                onBlur={e => e.target.style.borderColor = '#e5e0f3'}
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(225,29,72,0.06)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, color: '#e11d48', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: '13px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              boxShadow: loading ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
              transition: 'all 0.15s',
            }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
