import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useToast } from '../../contexts/ToastContext';

const cardStyle = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
const btnPrimary = { background: '#059669', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const btnSecondary = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' };

export default function AdminAccess() {
  const [resellers, setResellers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddReseller, setShowAddReseller] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('reseller');
  const [resellerId, setResellerId] = useState('');
  const [grantUserId, setGrantUserId] = useState('');
  const [grantAmount, setGrantAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [granting, setGranting] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.users.list({ role: 'reseller' }).then((r) => setResellers(r.users || [])).catch(() => setResellers([])),
      api.users.list({ role: 'client' }).then((r) => setClients(r.users || [])).catch(() => setClients([])),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace(user ? (user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard') : '/login');
      return;
    }
    if (!user) return;
    load();
  }, [user, authLoading, router]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.auth.register({ email, password, role, resellerId: role === 'client' && resellerId ? resellerId : undefined });
      setEmail('');
      setPassword('');
      setResellerId('');
      setShowAddReseller(false);
      setShowAddClient(false);
      load();
      toast.success(role === 'reseller' ? 'Reseller created' : 'Client created');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!grantUserId || !grantAmount || parseInt(grantAmount, 10) <= 0) {
      toast.error('Select user and enter amount');
      return;
    }
    setGranting(true);
    try {
      await api.credits.purchase(grantUserId, parseInt(grantAmount, 10));
      setGrantUserId('');
      setGrantAmount('');
      load();
      toast.success('Credits granted');
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setGranting(false);
    }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Access Management</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Create resellers and clients. Admin grants credits to resellers; resellers grant to their clients.</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {/* Resellers */}
          <div style={cardStyle}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>Resellers</h2>
              <button type="button" onClick={() => { setRole('reseller'); setShowAddReseller(true); setShowAddClient(false); }} style={btnPrimary}>+ Add Reseller</button>
            </div>
            <div style={{ padding: 20 }}>
              {showAddReseller && (
                <form onSubmit={handleCreateUser} style={{ marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} required />
                  <input type="hidden" value="reseller" />
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button type="submit" disabled={submitting} style={btnPrimary}>Create</button>
                    <button type="button" onClick={() => setShowAddReseller(false)} style={btnSecondary}>Cancel</button>
                  </div>
                </form>
              )}
              {resellers.length === 0 ? <EmptyState message="No resellers. Add one to give them access." /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '10px 0', color: '#64748b', fontWeight: 600 }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '10px 0', color: '#64748b', fontWeight: 600 }}>Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resellers.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 0', color: '#0f172a' }}>{u.email}</td>
                        <td style={{ padding: '12px 0', color: '#059669', fontWeight: 600 }}>{u.creditBalance ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Clients */}
          <div style={cardStyle}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>Clients</h2>
              <button type="button" onClick={() => { setRole('client'); setShowAddClient(true); setShowAddReseller(false); }} style={btnPrimary}>+ Add Client</button>
            </div>
            <div style={{ padding: 20 }}>
              {showAddClient && (
                <form onSubmit={handleCreateUser} style={{ marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} required />
                  <select value={resellerId} onChange={(e) => setResellerId(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} required>
                    <option value="">Select Reseller</option>
                    {resellers.map((r) => (
                      <option key={r._id} value={r._id}>{r.email}</option>
                    ))}
                  </select>
                  <input type="hidden" value="client" />
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button type="submit" disabled={submitting} style={btnPrimary}>Create</button>
                    <button type="button" onClick={() => setShowAddClient(false)} style={btnSecondary}>Cancel</button>
                  </div>
                </form>
              )}
              {clients.length === 0 ? <EmptyState message="No clients. Add one and assign a reseller." /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '10px 0', color: '#64748b', fontWeight: 600 }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '10px 0', color: '#64748b', fontWeight: 600 }}>Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 0', color: '#0f172a' }}>{u.email}</td>
                        <td style={{ padding: '12px 0', color: '#059669', fontWeight: 600 }}>{u.creditBalance ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grant credits */}
      <div style={{ ...cardStyle, marginTop: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>Grant Credits</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Grant credits to a reseller or client. They can then run campaigns.</p>
        </div>
        <form onSubmit={handleGrant} style={{ padding: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>User</label>
            <select value={grantUserId} onChange={(e) => setGrantUserId(e.target.value)} style={{ ...inputStyle, minWidth: 220 }} required>
              <option value="">Select user</option>
              {resellers.map((r) => (
                <option key={r._id} value={r._id}>{r.email} (Reseller)</option>
              ))}
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.email} (Client)</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 120 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Amount</label>
            <input type="number" min="1" placeholder="Credits" value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} style={{ ...inputStyle, minWidth: 100 }} required />
          </div>
          <button type="submit" disabled={granting} style={btnPrimary}>Grant Credits</button>
        </form>
      </div>
    </AdminLayout>
  );
}
