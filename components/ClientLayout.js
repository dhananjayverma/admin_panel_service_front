import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const nav = [
  { href: '/client/dashboard', label: 'Dashboard' },
  { href: '/client/campaigns', label: 'Campaign', activeWhen: (path) => path.startsWith('/client/campaigns') && !path.includes('type=button') },
  { href: '/client/campaigns?type=button', label: 'Button Campaign', activeWhen: (path) => path.includes('type=button') },
  { href: '/client/dp-campaign', label: 'DP Campaign' },
  { href: '/client/action-button', label: 'Action Button' },
  { href: '/client/button-sms', label: 'Button SMS' },
  { href: '/client/api', label: 'API' },
  { href: '/client/chatbot', label: 'Chatbot' },
  { href: '/client/whatsapp-report', label: 'WhatsApp Report' },
  { href: '/client/campaigns', label: "My User's Campaigns" },
  { href: '/client/credits', label: 'Credit History' },
  { href: '/client/credits', label: 'Credit Manage' },
  { href: '/client/demo-requests', label: 'Demo Requests' },
  { href: '/client/profile', label: 'Profile' },
];

export default function ClientLayout({ children }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const asPath = router.asPath || '';
  const isActive = (href, pathMatch, activeWhen) => {
    if (activeWhen && activeWhen(asPath)) return true;
    if (pathMatch) return asPath.startsWith(pathMatch);
    return asPath.split('?')[0] === href;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>
      <header style={{ height: 56, background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>WhatsApp Bulk</span>
          <span style={{ background: '#059669', fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>CLIENT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/client/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Dashboard</Link>
          <Link href="/client/profile" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Profile</Link>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{user?.email}</span>
          <button type="button" onClick={() => { logout(); router.push('/login'); }} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13 }}>Logout</button>
        </div>
      </header>
      <div style={{ background: '#fbbf24', color: '#78350f', textAlign: 'center', padding: '6px 16px', fontSize: 13, fontWeight: 500 }}>
        Demo: 9:30 AM – 6:00 PM · 2 demos/day
      </div>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside style={{ width: 260, minWidth: 260, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflowY: 'auto', boxShadow: '1px 0 0 rgba(0,0,0,0.04)' }}>
          <nav style={{ padding: 16, flex: 1 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingLeft: 4 }}>Client Panel</div>
            {nav.map(({ href, label, pathMatch, activeWhen }, i) => {
              const active = isActive(href, pathMatch, activeWhen);
              return (
                <Link
                  key={`${href}-${label}-${i}`}
                  href={href}
                  style={{
                    display: 'block',
                    padding: '12px 14px',
                    borderRadius: 8,
                    marginBottom: 4,
                    color: active ? '#059669' : '#475569',
                    textDecoration: 'none',
                    fontWeight: active ? 600 : 500,
                    background: active ? '#ecfdf5' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}
