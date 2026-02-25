import { useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function AdminActionButton() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace(user ? (user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard') : '/login');
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  return (
    <AdminLayout>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Action Button</h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Whatsapp Bulk / Campaigns / Action Button</p>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <p style={{ color: '#64748b', fontSize: 14 }}>Action button campaigns and templates.</p>
      </div>
    </AdminLayout>
  );
}
