import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function AdminAnalytics() {
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
      .catch(() => setData({ overview: {} }))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Analytics</h1>
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">Total Sent</p>
            <p className="text-2xl font-semibold">{data?.overview?.totalSent ?? 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">Total Failed</p>
            <p className="text-2xl font-semibold">{data?.overview?.totalFailed ?? 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">Completed Campaigns</p>
            <p className="text-2xl font-semibold">{data?.overview?.completed ?? 0}</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
