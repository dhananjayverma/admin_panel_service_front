import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { MessageCircle, LogIn, RefreshCw, Smartphone } from 'lucide-react';

function getCaptchaUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return base.replace(/\/api\/?$/, '') + '/api/auth/captcha';
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const router = useRouter();
  const { login, user } = useAuth();

  const loadCaptcha = () => {
    setCaptchaLoading(true);
    setCaptchaCode('');
    setError((e) => (e && e.includes('captcha') ? '' : e));
    fetch(getCaptchaUrl(), { method: 'GET', headers: { Accept: 'application/json' } })
      .then((res) => res.json().catch(() => ({})))
      .then((r) => {
        if (r.captchaId && r.svg) {
          setCaptchaId(r.captchaId);
          setCaptchaSvg(r.svg);
        } else {
          setError(r.message || 'Could not load captcha');
        }
      })
      .catch(() => setError('Could not load captcha. Check that the API is running and try again.'))
      .finally(() => setCaptchaLoading(false));
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  if (user) {
    const dash = user.role === 'admin' ? '/admin/dashboard' : user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard';
    router.replace(dash);
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!captchaId || !captchaCode.trim()) {
      setError('Please enter the captcha code');
      return;
    }
    setLoading(true);
    try {
      const u = await login(email, password, captchaId, captchaCode);
      const dash = u.role === 'admin' ? '/admin/dashboard' : u.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard';
      router.push(dash);
    } catch (err) {
      setError(err.message || 'Login failed');
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap' }}>
      {/* Left: Marketing / Branding */}
      <div
        style={{
          flex: '1 1 360px',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 48,
        }}
      >
        <div style={{ maxWidth: 420, width: '100%' }}>
          <div style={{ background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 6, display: 'inline-block', marginBottom: 20 }}>
            New Launch
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#2563eb', margin: '0 0 16px 0', lineHeight: 1.2 }}>
            Button SMS Marketing
          </h1>
          <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 40, lineHeight: 1.6 }}>
            The right decision for your marketing strategy to grow your Business.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 120, height: 200, background: 'linear-gradient(180deg, #475569 0%, #64748b 100%)', borderRadius: 24, position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
              <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, background: '#e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>1</div>
            </div>
            <Smartphone size={80} style={{ color: '#64748b', opacity: 0.9 }} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div
        style={{
          flex: '1 1 360px',
          minHeight: '100vh',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
              <MessageCircle size={28} strokeWidth={2} style={{ color: '#2563eb' }} />
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 }}>WhatsApp Bulk</h2>
            </div>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
            {error && (
              <div style={{ fontSize: 13, color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 15, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Captcha Code</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ background: '#e8e8e8', borderRadius: 8, overflow: 'hidden', border: '1px solid #cbd5e1', minWidth: 140, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {captchaLoading ? (
                    <span style={{ fontSize: 12, color: '#64748b' }}>Loading…</span>
                  ) : captchaSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: captchaSvg }} style={{ width: 140, height: 48, display: 'inline-block', lineHeight: 0 }} />
                  ) : (
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>No captcha</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={loadCaptcha}
                  disabled={captchaLoading}
                  style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#f8fafc', cursor: captchaLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  title="Refresh captcha"
                >
                  <RefreshCw size={16} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>Refresh</span>
                </button>
              </div>
              <input
                type="text"
                value={captchaCode}
                onChange={(e) => setCaptchaCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="Enter captcha code"
                required
                autoComplete="off"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 15, boxSizing: 'border-box', marginTop: 8 }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || captchaLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading || captchaLoading ? 'not-allowed' : 'pointer',
                opacity: loading || captchaLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <LogIn size={20} strokeWidth={2} />
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
