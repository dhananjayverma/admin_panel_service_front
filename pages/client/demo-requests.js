import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ClientLayout from '../../components/ClientLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function DemoRequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const [limits, setLimits] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !['client', 'reseller'].includes(user.role))) router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/login') : '/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.demoRequests.limits().then(setLimits).catch(() => setLimits(null));
  }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.demoRequests.submit(message);
      toast.success('Demo request submitted.');
      setMessage('');
      const l = await api.demoRequests.limits();
      setLimits(l);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <ClientLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Demo Requests</h1>
      <p className="text-slate-500 text-sm mb-6">Session: 9:30 AM to 6:00 PM (Sunday until 12 PM). Limit: 2 demos per day.</p>
      {limits && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <p className="text-slate-700 text-sm font-medium">Today: {limits.demosToday} / {limits.demosLimit} demo requests used</p>
          <p className="text-slate-600 text-sm mt-1">{limits.withinWindow ? 'Within demo window.' : 'Outside demo hours.'} {limits.canSubmit ? 'You can submit.' : 'You cannot submit (limit or time).'}</p>
          <p className="text-slate-600 text-sm mt-1">Generate With AI: {limits.aiGenerateUsedToday ? 'Used today' : 'Available'}</p>
        </div>
      )}
      <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Message (optional)</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your demo need..." className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" rows={3} />
        <button type="submit" disabled={submitting || (limits && !limits.canSubmit)} className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? 'Submitting…' : 'Submit Demo Request'}
        </button>
      </form>
    </ClientLayout>
  );
}
