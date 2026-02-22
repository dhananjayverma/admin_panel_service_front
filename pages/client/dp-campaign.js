import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ClientLayout from '../../components/ClientLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function DPCampaignPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || !['client', 'reseller'].includes(user.role))) router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/login') : '/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">DP Campaign</h1>
      <p className="text-slate-500 text-sm mb-6">Create campaigns with display picture / profile photo updates.</p>
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm max-w-lg">
        <p className="text-slate-600 mb-4">DP (Display Picture) campaigns let you update profile photos in bulk. Use the standard campaign flow and choose type <strong>DP</strong> when creating.</p>
        <Link href="/client/campaigns" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Go to Campaigns</Link>
      </div>
    </ClientLayout>
  );
}
