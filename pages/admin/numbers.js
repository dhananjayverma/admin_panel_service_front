import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useRouter } from 'next/router';

export default function AdminNumbers() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ number: '', provider: '', vpnHost: '', vpnPort: '', vpnUser: '', vpnPassword: '' });
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace(user ? (user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard') : '/login');
      return;
    }
    if (!user) return;
    api.numbers.list()
      .then((r) => setNumbers(r.numbers || []))
      .catch(() => setNumbers([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.numbers.create(form);
      setForm({ number: '', provider: '', vpnHost: '', vpnPort: '', vpnUser: '', vpnPassword: '' });
      setShowForm(false);
      const r = await api.numbers.list();
      setNumbers(r.numbers || []);
      toast.success('Virtual number added');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Virtual Numbers</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage numbers and VPN config</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition"
        >
          {showForm ? 'Cancel' : 'Add Number'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-xl p-6 mb-6 space-y-4 max-w-md shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Number (e.g. +91...)</label>
            <input placeholder="+91..." value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
            <input placeholder="Provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">VPN Host</label>
              <input value={form.vpnHost} onChange={(e) => setForm({ ...form, vpnHost: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">VPN Port</label>
              <input type="number" placeholder="8080" value={form.vpnPort} onChange={(e) => setForm({ ...form, vpnPort: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">VPN User / Password</label>
            <div className="flex gap-2">
              <input placeholder="User" value={form.vpnUser} onChange={(e) => setForm({ ...form, vpnUser: e.target.value })} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" />
              <input type="password" placeholder="Password" value={form.vpnPassword} onChange={(e) => setForm({ ...form, vpnPassword: e.target.value })} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Save</button>
        </form>
      )}
      {loading ? <LoadingSpinner /> : numbers.length === 0 ? <EmptyState message="No virtual numbers yet." /> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Number</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Provider</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">VPN Host</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {numbers.map((n) => (
                <tr key={n._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{n.number}</td>
                  <td className="px-5 py-3.5 text-slate-600">{n.provider || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-600">{n.vpnHost || '—'}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={n.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
