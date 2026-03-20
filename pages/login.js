import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, LogIn, ShieldCheck, Zap, BarChart3, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950">
      {/* Left: brand + value */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800" />
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute inset-0">
          <Image src="/images/b.png" alt="marketing" fill style={{ objectFit: 'cover', opacity: 0.18 }} priority />
        </div>

        <div className="relative z-10 max-w-lg p-10 text-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <MessageCircle size={26} strokeWidth={2} className="text-sky-300" />
            </div>
            <div>
              <div className="text-sm uppercase tracking-widest text-slate-300">WhatsApp Bulk</div>
              <div className="text-3xl font-bold">Campaigns that feel human</div>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Launch personalized broadcasts, manage clients, and track performance in one clean workspace.
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <Zap size={18} className="text-amber-300 mt-0.5" />
              <div>
                <div className="text-sm font-semibold">Faster send flows</div>
                <div className="text-xs text-slate-300">Templates, approvals, and scheduling in minutes.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <BarChart3 size={18} className="text-emerald-300 mt-0.5" />
              <div>
                <div className="text-sm font-semibold">Live analytics</div>
                <div className="text-xs text-slate-300">Track delivery, clicks, and ROI by campaign.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck size={18} className="text-sky-300 mt-0.5" />
              <div>
                <div className="text-sm font-semibold">Secure access</div>
                <div className="text-xs text-slate-300">Role-based logins and tokenized sessions.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="relative flex items-center justify-center bg-slate-50 p-6 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#e2e8f0,_#f8fafc_45%,_#ffffff_70%)]" />
        <div className="relative w-full max-w-md">
          <div className="text-center mb-7">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow">
                <MessageCircle size={20} strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 m-0">Welcome back</h2>
            </div>
            <p className="text-sm text-slate-500">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur rounded-2xl p-7 shadow-lg border border-slate-200">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3 mb-4">{error}</div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-sky-600" />
                Remember me
              </label>
              <span className="hover:text-slate-700">Forgot password?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-md font-semibold shadow hover:bg-slate-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <LogIn size={18} strokeWidth={2} />
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
