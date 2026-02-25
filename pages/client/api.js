import { useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

const API_BASE = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') : '';

export default function APIPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || !['client', 'reseller'].includes(user.role))) router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/login') : '/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">API</h1>
      <p className="text-slate-500 text-sm mb-6">Use the API to send messages programmatically. Authenticate with your JWT (from login).</p>
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">API Base URL</label>
          <code className="block bg-slate-100 px-3 py-2 rounded text-sm text-slate-800">{API_BASE}</code>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Authentication</label>
          <p className="text-slate-600 text-sm">Send <code className="bg-slate-100 px-1 rounded">Authorization: Bearer &lt;token&gt;</code> with each request. Get the token from login: <code className="bg-slate-100 px-1 rounded">POST /api/auth/login</code>.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Endpoints</label>
          <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
            <li><code>GET /campaigns</code> — List campaigns</li>
            <li><code>POST /campaigns</code> — Create campaign</li>
            <li><code>GET /campaigns/:id</code> — Get campaign</li>
            <li><code>POST /campaigns/:id/recipients</code> — Add recipients</li>
            <li><code>POST /campaigns/:id/start</code> — Start campaign</li>
            <li><code>GET /campaigns/:id/export?format=csv</code> — Export recipients CSV</li>
            <li><code>POST /campaigns/validate-numbers</code> — Validate phone numbers</li>
            <li><code>GET /credits/history</code> — Credit history</li>
            <li><code>GET /demo-requests/limits</code> — Demo limits</li>
            <li><code>POST /demo-requests</code> — Submit demo request</li>
            <li><code>POST /ai/generate-message</code> — Generate message with AI (once/day free)</li>
          </ul>
        </div>
      </div>
    </ClientLayout>
  );
}
