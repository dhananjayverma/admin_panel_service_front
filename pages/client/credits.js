import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function ClientCredits() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('credit');
  const { user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !['client', 'reseller'].includes(user.role))) {
      router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/login') : '/login');
      return;
    }
    if (!user) return;
    refresh();
    api.credits.history()
      .then((r) => setHistory(r.list || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router, refresh]);

  if (authLoading || !user) return <LoadingSpinner />;

  const balance = user.creditBalance ?? 0;
  const wappBtnBalance = user.rBtnCredit != null ? user.rBtnCredit : balance;

  return (
    <ClientLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Credits</h1>
        <p className="text-slate-500 text-sm mt-0.5">Balance and transaction history. Demo: 2 demos / day.</p>
      </div>
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        <button type="button" onClick={() => setTab('credit')} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === 'credit' ? 'bg-slate-100 text-slate-800 border border-slate-200 border-b-0' : 'text-slate-600 hover:bg-slate-50'}`}>Credit</button>
        <button type="button" onClick={() => setTab('wapp')} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === 'wapp' ? 'bg-slate-100 text-slate-800 border border-slate-200 border-b-0' : 'text-slate-600 hover:bg-slate-50'}`}>Wapp BTN : {wappBtnBalance.toFixed(2)}</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 inline-block shadow-sm">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{tab === 'credit' ? 'Credit balance' : 'Wapp BTN balance'}</p>
        <p className="text-3xl font-bold text-emerald-600 mt-1">{tab === 'credit' ? balance : wappBtnBalance}</p>
      </div>
      <h2 className="text-lg font-semibold text-slate-800 mb-3">History</h2>
      {loading ? <LoadingSpinner /> : history.length === 0 ? <EmptyState message="No transactions yet." /> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Balance after</th>
              </tr>
            </thead>
            <tbody>
              {history.map((t) => (
                <tr key={t._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 text-sm text-slate-600">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3.5 capitalize text-slate-800">{t.type}</td>
                  <td className="px-5 py-3.5 font-medium">{t.amount > 0 ? `+${t.amount}` : t.amount}</td>
                  <td className="px-5 py-3.5 text-slate-600">{t.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ClientLayout>
  );
}
