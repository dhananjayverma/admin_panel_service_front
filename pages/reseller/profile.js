import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ResellerLayout from '../../components/ResellerLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export default function ResellerProfile() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'reseller')) {
      router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard') : '/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <ResellerLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Profile</h1>
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-md">
        <p className="text-slate-600"><span className="font-medium text-slate-700">Email:</span> {user.email}</p>
        <p className="text-slate-600 mt-2"><span className="font-medium text-slate-700">Role:</span> {user.role}</p>
        <p className="text-slate-600 mt-2"><span className="font-medium text-slate-700">Credits:</span> {user.creditBalance ?? 0}</p>
      </div>
    </ResellerLayout>
  );
}
