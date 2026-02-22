import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminProfile() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace(user ? (user.role === 'client' ? '/client/dashboard' : '/reseller/dashboard') : '/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Profile</h1>
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-md">
        <p className="text-slate-600"><span className="font-medium text-slate-700">Email:</span> {user.email}</p>
        <p className="text-slate-600 mt-2"><span className="font-medium text-slate-700">Role:</span> {user.role}</p>
      </div>
    </AdminLayout>
  );
}
