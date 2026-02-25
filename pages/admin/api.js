import { useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

const API_BASE = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api' : '';

export default function AdminApi() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace(user ? (user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard') : '/login');
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  return (
    <AdminLayout>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>API</h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Whatsapp Bulk / API</p>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', maxWidth: 720 }}>
        <p style={{ color: '#475569', fontSize: 14, marginBottom: 16 }}>API documentation for developers. Use JWT from login for authentication.</p>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Base URL</div>
          <code style={{ display: 'block', background: '#f1f5f9', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>{API_BASE}</code>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Authentication</div>
          <p style={{ fontSize: 14, color: '#475569' }}>Send <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>Authorization: Bearer &lt;token&gt;</code> with each request. Token from <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>POST /api/auth/login</code>.</p>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Endpoints</div>
          <ul style={{ fontSize: 14, color: '#475569', paddingLeft: 20, margin: 0 }}>
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
            <li><code>POST /ai/generate-message</code> — Generate message with AI</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
