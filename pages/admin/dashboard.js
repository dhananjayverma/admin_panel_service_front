import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace(user ? (user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard') : '/login');
      return;
    }
    if (!user) return;
    api.analytics.adminDashboard()
      .then(setData)
      .catch(() => setData({
        normalCredit: 0, rBtnCredit: 0, actionBtnCredit: 0, btnSmsCredit: 0, apiDaysCredit: 0,
        totalCampaign: 0, inProcessCampaigns: 0, pendingCampaigns: 0,
      }))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <LoadingSpinner />
      </div>
    );
  }

  const creditCards = [
    { label: 'NORMAL CREDIT', value: data?.normalCredit ?? 0, bg: '#2563eb' },
    { label: 'R-BTN CREDIT', value: data?.rBtnCredit ?? 0, bg: '#2563eb' },
    { label: 'ACTION BTN CREDIT', value: data?.actionBtnCredit ?? 0, bg: '#1e293b' },
    { label: 'BTN-SMS CREDIT', value: data?.btnSmsCredit ?? 0, bg: '#1e293b' },
  ];

  return (
    <AdminLayout>
      <h1 className="admin-dash-title">Dashboard - Whatsapp Bulk</h1>
      <p className="admin-dash-breadcrumb">Whatsapp Bulk / Dashboard</p>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="admin-dash-grid admin-dash-grid-4">
            {creditCards.map(({ label, value, bg }) => (
              <div
                key={label}
                className="admin-dash-card"
                style={{ background: bg, color: '#fff' }}
              >
                <span className="admin-dash-card-icon" aria-hidden>◇◇</span>
                <div>
                  <div className="admin-dash-card-label">{label}</div>
                  <div className="admin-dash-card-value">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                </div>
                <Link href="/admin/demo-requests" className="admin-dash-card-btn">
                  Request Demo
                </Link>
              </div>
            ))}
          </div>

          <div className="admin-dash-grid admin-dash-grid-4">
            <div
              className="admin-dash-card"
              style={{ background: '#1e293b', color: '#fff' }}
            >
              <span className="admin-dash-card-icon" aria-hidden>◇◇</span>
              <div>
                <div className="admin-dash-card-label">API DAYS CREDIT</div>
                <div className="admin-dash-card-value">{data?.apiDaysCredit ?? 0}</div>
              </div>
              <Link href="/admin/demo-requests" className="admin-dash-card-btn">
                Request Demo
              </Link>
            </div>
            <div
              className="admin-dash-card"
              style={{ background: '#059669', color: '#fff' }}
            >
              <span className="admin-dash-card-icon" aria-hidden>◇◇</span>
              <div>
                <div className="admin-dash-card-label">TOTAL CAMPAIGN</div>
                <div className="admin-dash-card-value">{data?.totalCampaign ?? 0}</div>
              </div>
            </div>
            <div
              className="admin-dash-card"
              style={{ background: '#ea580c', color: '#fff' }}
            >
              <span className="admin-dash-card-icon" aria-hidden>◇◇</span>
              <div>
                <div className="admin-dash-card-label">IN PROCESS CAMPAIGNS</div>
                <div className="admin-dash-card-value">{data?.inProcessCampaigns ?? 0}</div>
              </div>
            </div>
            <div
              className="admin-dash-card"
              style={{ background: '#dc2626', color: '#fff' }}
            >
              <span className="admin-dash-card-icon" aria-hidden>◇◇</span>
              <div>
                <div className="admin-dash-card-label">PENDING CAMPAIGNS</div>
                <div className="admin-dash-card-value">{data?.pendingCampaigns ?? 0}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
