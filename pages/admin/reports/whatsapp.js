import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useToast } from '../../../contexts/ToastContext';

export default function AdminReportWhatsApp() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace(user ? (user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard') : '/login');
      return;
    }
    if (!user) return;
    api.campaigns.list().then((r) => setCampaigns(r.campaigns || [])).catch(() => setCampaigns([])).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  const completed = campaigns.filter((c) => c.status === 'completed');
  const totalSent = campaigns.reduce((s, c) => s + (c.sentCount || 0), 0);
  const totalFailed = campaigns.reduce((s, c) => s + (c.failedCount || 0), 0);

  return (
    <AdminLayout>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>WhatsApp Report</h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Whatsapp Bulk / Reports / WhatsApp Report</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Campaigns completed</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginTop: 8 }}>{completed.length}</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Total sent</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#059669', marginTop: 8 }}>{totalSent}</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Total failed</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginTop: 8 }}>{totalFailed}</p>
        </div>
      </div>
      {loading ? <LoadingSpinner /> : campaigns.length === 0 ? <EmptyState message="No campaigns." /> : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Sent</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Failed</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Export</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#0f172a' }}>{c.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#475569' }}>{c.status}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#475569' }}>{c.sentCount ?? 0}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#475569' }}>{c.failedCount ?? 0}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button type="button" disabled={exporting === c._id} onClick={async () => { setExporting(c._id); try { await api.campaigns.exportCsv(c._id); toast.success('CSV downloaded'); } catch (e) { toast.error(e.message); } finally { setExporting(null); } }} style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>{exporting === c._id ? '…' : 'Export CSV'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
