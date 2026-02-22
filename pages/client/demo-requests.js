import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ClientLayout from '../../components/ClientLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../contexts/AuthContext';

export default function DemoRequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || !['client', 'reseller'].includes(user.role))) router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/login') : '/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Demo Requests</h1>
      <p className="text-slate-500 text-sm mb-6">Demo submission time: 9:30 AM to 6:00 PM. Limit: 2 demos per day.</p>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-amber-800 text-sm font-medium">Demo limit</p>
        <p className="text-amber-700 text-sm mt-0.5">You can submit up to 2 demo campaigns per day. Generate With AI is free once per day.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <EmptyState message="No demo requests. Your demo usage is tracked when you start campaigns during demo hours." />
      </div>
    </ClientLayout>
  );
}
