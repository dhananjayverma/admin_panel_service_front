import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  if (user) {
    const dash = user.role === 'admin' ? '/admin/dashboard' : user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard';
    router.replace(dash);
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      const dash = u.role === 'admin' ? '/admin/dashboard' : u.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard';
      router.push(dash);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-200"
        style={{ maxWidth: 448, width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>WhatsApp Bulk</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Enterprise messaging platform</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div style={{ fontSize: 14, color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px 16px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
