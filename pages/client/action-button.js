import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ClientLayout from '../../components/ClientLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function ActionButtonPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || !['client', 'reseller'].includes(user.role))) router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/login') : '/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Action Button</h1>
      <p className="text-slate-500 text-sm mb-6">Configure quick-reply and call-to-action buttons for your messages.</p>
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm max-w-lg">
        <p className="text-slate-600 mb-4">Action buttons appear on your WhatsApp messages (e.g. Call, Visit website). Create a <strong>Button Campaign</strong> to add interactive options.</p>
        <Link href="/client/campaigns?type=button" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Create Button Campaign</Link>
      </div>
    </ClientLayout>
  );
}
