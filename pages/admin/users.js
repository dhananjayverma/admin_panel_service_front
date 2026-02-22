import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('client');
  const [regLoading, setRegLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const onRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      await api.auth.register({ email: regEmail, password: regPassword, role: regRole });
      setRegEmail('');
      setRegPassword('');
      setShowRegister(false);
      const r = await api.users.list();
      setUsers(r.users || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace(user ? (user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard') : '/login');
      return;
    }
    if (!user) return;
    api.users.list()
      .then((r) => setUsers(r.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-800">Users</h1>
        <button type="button" onClick={() => setShowRegister(!showRegister)} className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm">Register user</button>
      </div>
      {showRegister && (
        <form onSubmit={onRegister} className="bg-white border rounded-lg p-4 mb-6 max-w-md space-y-3">
          <input type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
          <select value={regRole} onChange={(e) => setRegRole(e.target.value)} className="border rounded px-3 py-2">
            <option value="reseller">Reseller</option>
            <option value="client">Client</option>
          </select>
          <button type="submit" disabled={regLoading} className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm">Register</button>
        </form>
      )}
      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState message="No users yet." />
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-zinc-600">Email</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-600">Role</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-600">Credits</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-zinc-100">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">{u.creditBalance ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
