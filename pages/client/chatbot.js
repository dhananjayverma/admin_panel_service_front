import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ClientLayout from '../../components/ClientLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatbotPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || !['client', 'reseller'].includes(user.role))) router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/login') : '/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Chatbot</h1>
      <p className="text-slate-500 text-sm mb-6">Configure automated replies and chatbot flows for incoming messages.</p>
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm max-w-lg">
        <p className="text-slate-600 mb-4">Set up auto-replies, menus, and conversation flows. Chatbot rules can be added here (e.g. keyword triggers, welcome message).</p>
        <p className="text-slate-500 text-sm">Chatbot configuration will be available in a future update.</p>
      </div>
    </ClientLayout>
  );
}
