import { useEffect, useState } from 'react';
import Link from 'next/link';
import ResellerLayout from '../../components/ResellerLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { Users, CreditCard, BarChart3, ClipboardList, ArrowRight } from 'lucide-react';

export default function ResellerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'reseller')) {
      router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard') : '/login');
      return;
    }
    if (!user) return;
    api.analytics.overview()
      .then(setData)
      .catch(() => setData({ overview: {}, creditBalance: 0 }))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ResellerLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Manage your clients and credits.</p>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
          {/* Stats */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 0 }}>
              {[
                { label: 'Your Credits', value: data?.creditBalance ?? 0, color: '#2563eb', bg: '#eff6ff' },
                { label: 'Total Campaigns', value: data?.overview?.totalCampaigns ?? 0, color: '#059669', bg: '#dcfce7' },
                { label: 'Total Sent', value: data?.overview?.totalSent ?? 0, color: '#d97706', bg: '#fef3c7' },
                { label: 'Clients', value: data?.overview?.userCount ?? 0, color: '#7c3aed', bg: '#f5f3ff' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                  <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{(value ?? 0).toLocaleString()}</p>
                  <div style={{ marginTop: 8, height: 3, borderRadius: 99, background: bg }}>
                    <div style={{ width: '60%', height: '100%', borderRadius: 99, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'My Clients', href: '/reseller/clients', icon: Users, color: '#2563eb' },
                { label: 'Assign Credits', href: '/reseller/credits', icon: CreditCard, color: '#059669' },
                { label: 'Client Campaigns', href: '/reseller/campaigns', icon: BarChart3, color: '#d97706' },
                { label: 'Request Demo', href: '/reseller/demo-requests', icon: ClipboardList, color: '#7c3aed' },
              ].map(({ label, href, icon: Icon, color }) => (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color={color} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{label}</span>
                    <ArrowRight size={13} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ marginTop: 14, background: '#0f172a', borderRadius: 12, padding: '14px 16px', color: '#fff' }}>
              <p style={{ margin: '0 0 2px', fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged in as</p>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, wordBreak: 'break-all' }}>{user.email}</p>
              <span style={{ padding: '3px 10px', borderRadius: 99, background: '#1e40af', color: '#bfdbfe', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </ResellerLayout>
  );
}
