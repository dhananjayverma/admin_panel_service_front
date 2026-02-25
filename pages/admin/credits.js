import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useToast } from '../../contexts/ToastContext';

export default function AdminCredits() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [granting, setGranting] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const load = () => api.users.list().then((r) => setUsers(r.users || []));

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace(user ? (user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard') : '/login');
      return;
    }
    if (!user) return;
    load().catch(() => setUsers([])).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !amount || parseInt(amount, 10) <= 0) {
      toast.error('Select a user and enter a positive amount.');
      return;
    }
    setGranting(true);
    try {
      await api.credits.purchase(selectedUserId, parseInt(amount, 10));
      toast.success('Credits granted');
      setAmount('');
      setSelectedUserId('');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGranting(false);
    }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  const resellersAndClients = users.filter((u) => u.role === 'reseller' || u.role === 'client');

  return (
    <AdminLayout>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Credit Manage</h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Whatsapp Bulk / Management / Credit Manage</p>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>Grant credits</h2>
        <form onSubmit={handleGrant} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>User</label>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, minWidth: 200 }}>
              <option value="">Select user</option>
              {resellersAndClients.map((u) => (
                <option key={u._id} value={u._id}>{u.email} ({u.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Amount</label>
            <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Credits" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, width: 120 }} />
          </div>
          <button type="submit" disabled={granting} style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{granting ? 'Granting…' : 'Grant'}</button>
        </form>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' }}>Users & balance</h2>
      {loading ? <LoadingSpinner /> : resellersAndClients.length === 0 ? <EmptyState message="No users yet." /> : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Credit balance</th>
              </tr>
            </thead>
            <tbody>
              {resellersAndClients.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#0f172a' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#475569' }}>{u.role}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#475569' }}>{u.creditBalance ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
