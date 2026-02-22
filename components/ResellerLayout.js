import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const nav = [
  { href: '/reseller/dashboard', label: 'Dashboard' },
  { href: '/reseller/clients', label: 'Clients' },
  { href: '/reseller/credits', label: 'Assign Credits' },
  { href: '/reseller/campaigns', label: "My User's Campaigns" },
  { href: '/reseller/analytics', label: 'Analytics' },
  { href: '/reseller/profile', label: 'Profile' },
];

export default function ResellerLayout({ children }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const path = (router.asPath || router.pathname || '').split('?')[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>
      <header style={{ height: 56, background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>WhatsApp Bulk</span>
          <span style={{ background: '#059669', fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>RESELLER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/reseller/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Dashboard</Link>
          <Link href="/reseller/profile" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Profile</Link>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{user?.email}</span>
          <button type="button" onClick={() => { logout(); router.push('/login'); }} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13 }}>Logout</button>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside style={{ width: 260, minWidth: 260, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '1px 0 0 rgba(0,0,0,0.04)' }}>
          <nav style={{ padding: 16, flex: 1 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingLeft: 4 }}>Reseller Panel</div>
            {nav.map(({ href, label }) => (
              <Link key={href} href={href} style={{ display: 'block', padding: '12px 14px', borderRadius: 8, marginBottom: 4, color: path === href ? '#059669' : '#475569', textDecoration: 'none', fontWeight: path === href ? 600 : 500, background: path === href ? '#ecfdf5' : 'transparent' }}>
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}
