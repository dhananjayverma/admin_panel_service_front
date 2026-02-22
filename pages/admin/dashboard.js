import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

const cardStyle = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace(user ? (user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard') : '/login');
      return;
    }
    if (!user) return;
    api.analytics.overview()
      .then(setData)
      .catch(() => setData({ overview: {}, creditBalance: 0 }))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Platform overview</p>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          <div style={cardStyle}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Campaigns</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>{data?.overview?.totalCampaigns ?? 0}</p>
          </div>
          <div style={cardStyle}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sent</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#059669', marginTop: 8 }}>{data?.overview?.totalSent ?? 0}</p>
          </div>
          <div style={cardStyle}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Users (Resellers + Clients)</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>{data?.overview?.userCount ?? 0}</p>
          </div>
          <div style={cardStyle}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Numbers</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>{data?.overview?.activeNumbers ?? 0}</p>
          </div>
        </div>
      )}
      <div style={{ marginTop: 32, ...cardStyle }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' }}>Flow</h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
          <strong>Admin</strong> creates <strong>Resellers</strong> and <strong>Clients</strong> in Access Management, then grants credits to resellers. Resellers grant credits to their clients. Clients and resellers use their own panels to run campaigns.
        </p>
      </div>
    </AdminLayout>
  );
}
