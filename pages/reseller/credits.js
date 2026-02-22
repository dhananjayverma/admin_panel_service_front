import { useEffect, useState } from 'react';
import ResellerLayout from '../../components/ResellerLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useRouter } from 'next/router';

export default function ResellerCredits() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetUserId, setTargetUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, loading: authLoading, refresh } = useAuth();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'reseller')) {
      router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard') : '/login');
      return;
    }
    if (!user) return;
    api.users.list({ role: 'client' })
      .then((r) => setUsers(r.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const onGrant = async (e) => {
    e.preventDefault();
    if (!targetUserId || !amount || parseInt(amount, 10) <= 0) return;
    setSubmitting(true);
    try {
      await api.credits.purchase(targetUserId, parseInt(amount, 10));
      setTargetUserId('');
      setAmount('');
      await refresh();
      const r = await api.users.list({ role: 'client' });
      setUsers(r.users || []);
      toast.success('Credits granted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <ResellerLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Assign Credits</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your balance: <strong className="text-emerald-600">{user.creditBalance ?? 0}</strong> credits</p>
      </div>
      <form onSubmit={onGrant} className="bg-white border border-slate-200 rounded-xl p-6 mb-6 max-w-lg flex flex-wrap gap-4 items-end shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
          <select
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 min-w-[220px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          >
            <option value="">Select client</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.email} ({u.creditBalance ?? 0} credits)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-emerald-500" required />
        </div>
        <button type="submit" disabled={submitting} className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-900/20">Grant</button>
      </form>
      {loading ? <LoadingSpinner /> : users.length === 0 ? <EmptyState message="No clients. Register a client first." /> : null}
    </ResellerLayout>
  );
}
