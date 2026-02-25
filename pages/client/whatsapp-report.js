import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ClientLayout from '../../components/ClientLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function WhatsAppReportPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!authLoading && (!user || !['client', 'reseller'].includes(user.role))) {
      router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/login') : '/login');
      return;
    }
    if (!user) return;
    api.campaigns.list()
      .then((r) => setCampaigns(r.campaigns || []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  const completed = campaigns.filter((c) => c.status === 'completed');
  const totalSent = campaigns.reduce((s, c) => s + (c.sentCount || 0), 0);
  const totalFailed = campaigns.reduce((s, c) => s + (c.failedCount || 0), 0);

  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">WhatsApp Report</h1>
      <p className="text-slate-500 text-sm mb-6">Overview of campaign delivery and performance.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Campaigns completed</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{completed.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Total sent</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{totalSent}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Total failed</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{totalFailed}</p>
        </div>
      </div>
      {loading ? <LoadingSpinner /> : campaigns.length === 0 ? <EmptyState message="No campaigns yet. Run a campaign to see reports." /> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase">Campaign</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase">Sent</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase">Failed</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase">Export</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.status}</td>
                  <td className="px-5 py-3.5 text-emerald-600">{c.sentCount ?? 0}</td>
                  <td className="px-5 py-3.5 text-red-600">{c.failedCount ?? 0}</td>
                  <td className="px-5 py-3.5">
                    <button type="button" disabled={exporting === c._id} onClick={async () => { setExporting(c._id); try { await api.campaigns.exportCsv(c._id); toast.success('CSV downloaded'); } catch (e) { toast.error(e.message); } finally { setExporting(null); } }} className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50">
                      {exporting === c._id ? '…' : 'Export CSV'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ClientLayout>
  );
}
