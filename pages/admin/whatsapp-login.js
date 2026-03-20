import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useRouter } from 'next/router';

const STATUS_COLOR = { ready: '#10b981', loading: '#f59e0b', qr: '#3b82f6', disconnected: '#ef4444' };
const STATUS_LABEL = { ready: 'Connected', loading: 'Starting…', qr: 'Scan QR', disconnected: 'Disconnected' };

export default function WhatsAppLogin() {
  const [accounts, setAccounts] = useState([]);
  const [adding, setAdding] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await api.whatsapp.accounts();
      setAccounts(data?.accounts || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/login');
      return;
    }
    if (!user) return;
    fetchAccounts();
    const t = setInterval(fetchAccounts, 3000);
    return () => clearInterval(t);
  }, [user, authLoading, router, fetchAccounts]);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await api.whatsapp.addAccount(`Account ${accounts.length + 1}`);
      await fetchAccounts();
      toast.success('New WhatsApp account added — scan the QR below');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleReconnect = async (clientId) => {
    try {
      await api.whatsapp.reconnect(clientId);
      toast.success('Reconnecting — new QR will appear in a few seconds');
      await fetchAccounts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemove = async (clientId) => {
    try {
      await api.whatsapp.removeAccount(clientId);
      setAccounts((a) => a.filter((x) => x.clientId !== clientId));
      toast.success('Account removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (authLoading || !user) return null;

  const readyCount = accounts.filter((a) => a.status === 'ready').length;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">WhatsApp Accounts</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage linked WhatsApp accounts for bulk messaging
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition disabled:opacity-50"
        >
          {adding ? 'Adding…' : '+ Add Account'}
        </button>
      </div>

      {readyCount > 0 && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 text-sm text-emerald-800 font-medium">
          {readyCount} account{readyCount > 1 ? 's' : ''} connected — round-robin sending active across all accounts
        </div>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {accounts.map((a) => (
          <div key={a.clientId} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Account header */}
            <div className="px-5 py-4 flex items-center gap-3">
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: STATUS_COLOR[a.status] || '#94a3b8', flexShrink: 0, display: 'inline-block' }} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 text-sm truncate">{a.label || a.clientId}</div>
                <div className="text-xs mt-0.5" style={{ color: STATUS_COLOR[a.status] || '#94a3b8' }}>
                  {STATUS_LABEL[a.status] || a.status}
                  {a.phone ? ` · ${a.phone}` : ''}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {a.status !== 'ready' && (
                  <button
                    type="button"
                    onClick={() => handleReconnect(a.clientId)}
                    className="text-xs px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md font-semibold hover:bg-blue-100"
                  >
                    Reconnect
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(a.clientId)}
                  className="text-xs px-3 py-1 bg-red-50 text-red-500 border border-red-200 rounded-md font-semibold hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* QR code */}
            {a.status === 'qr' && a.qr && (
              <div className="px-5 pb-5 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500 py-3">
                  Open WhatsApp → <strong>Linked Devices</strong> → <strong>Link a Device</strong> → Scan
                </p>
                <img src={a.qr} alt="QR Code" style={{ width: 200, height: 200, margin: '0 auto', display: 'block', borderRadius: 10, border: '1px solid #e2e8f0' }} />
                <p className="text-xs text-slate-400 mt-3">QR refreshes automatically every ~20s</p>
              </div>
            )}

            {a.status === 'ready' && (
              <div className="px-5 pb-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 pt-3">Session saved — auto-connects on restart. No QR needed again.</p>
              </div>
            )}

            {a.status === 'loading' && (
              <div className="px-5 pb-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 pt-3">Browser starting, QR will appear in ~10 seconds…</p>
              </div>
            )}
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">📱</div>
            <div className="font-medium">No accounts yet</div>
            <div className="text-sm mt-1">Click &quot;+ Add Account&quot; to link your first WhatsApp number</div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800 max-w-2xl">
        <strong>How it works:</strong> Each account uses its own WhatsApp session (saved in <code>.wwebjs_auth/</code>).
        Scan QR once → session saved → auto-login on every restart. Add multiple accounts to distribute
        messages via round-robin sending, increasing safe daily volume.
      </div>
    </AdminLayout>
  );
}
