import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ClientLayout from '../../components/ClientLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function ButtonSMSPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || !['client', 'reseller'].includes(user.role))) router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/login') : '/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Button SMS</h1>
      <p className="text-slate-500 text-sm mb-6">Send SMS with interactive button options.</p>
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm max-w-lg">
        <p className="text-slate-600 mb-4">Button SMS combines SMS delivery with reply buttons. Use <strong>Button Campaign</strong> for WhatsApp; SMS option can be enabled from settings.</p>
        <Link href="/client/campaigns?type=button" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Create Button Campaign</Link>
      </div>
    </ClientLayout>
  );
}
