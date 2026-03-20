import { useCallback, useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useRouter } from 'next/router';
import { CheckCircle, WifiOff, Loader, QrCode, RefreshCw, Trash2, Smartphone, Plus } from 'lucide-react';

export default function ClientWhatsAppLogin() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      const data = await api.whatsapp.mySession();
      setSession(data?.session || null);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (!user) return;
    fetchSession();
    const t = setInterval(fetchSession, 3000);
    return () => clearInterval(t);
  }, [user, authLoading, router, fetchSession]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await api.whatsapp.myConnect();
      toast.success('WhatsApp session starting — QR will appear in a few seconds');
      await fetchSession();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      await api.whatsapp.myReconnect();
      toast.success('Reconnecting — QR will appear shortly');
      await fetchSession();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReconnecting(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Disconnect and remove your WhatsApp session?')) return;
    setRemoving(true);
    try {
      await api.whatsapp.myRemove();
      setSession(null);
      toast.success('WhatsApp session removed');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoving(false);
    }
  };

  if (authLoading || !user) return null;

  const isReady = session?.status === 'ready';
  const isQr = session?.status === 'qr';
  const isLoading = session?.status === 'loading';
  const isDisconnected = session?.status === 'disconnected';

  return (
    <ClientLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Smartphone size={22} /> My WhatsApp
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
            Link your personal WhatsApp to send campaigns
          </p>
        </div>
        {session && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', border: '1px solid #fecaca', borderRadius: 8, background: '#fff5f5', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: removing ? 0.6 : 1 }}
          >
            <Trash2 size={13} /> {removing ? 'Removing…' : 'Remove Session'}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Loader size={32} color="#38bdf8" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      ) : !session ? (
        /* ── No session yet ── */
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Smartphone size={34} color="#2563eb" />
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Connect Your WhatsApp</h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
            Link your WhatsApp number to send campaigns directly from your own account.
            Your session is private — only you can see it.
          </p>
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: connecting ? 'not-allowed' : 'pointer', opacity: connecting ? 0.7 : 1 }}
          >
            <Plus size={16} /> {connecting ? 'Starting…' : 'Connect WhatsApp'}
          </button>
        </div>
      ) : (
        /* ── Session exists ── */
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <div style={{
            background: '#fff',
            borderRadius: 18,
            border: `2px solid ${isReady ? '#bbf7d0' : isQr ? '#bfdbfe' : isLoading ? '#fde68a' : '#fecaca'}`,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            {/* Card header */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10, background: isReady ? '#f0fdf4' : '#fafafa', borderBottom: `1px solid ${isReady ? '#bbf7d0' : '#f1f5f9'}` }}>
              <div style={{
                width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
                background: isReady ? '#059669' : isQr ? '#3b82f6' : isLoading ? '#f59e0b' : '#ef4444',
                boxShadow: isReady ? '0 0 0 3px #bbf7d0' : isQr ? '0 0 0 3px #bfdbfe' : 'none',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>My WhatsApp Session</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: isReady ? '#059669' : isQr ? '#2563eb' : isLoading ? '#d97706' : '#dc2626', marginTop: 1 }}>
                  {isReady ? `Connected${session.phone ? ` · ${session.phone}` : ''}` :
                   isQr ? 'Waiting for scan…' :
                   isLoading ? 'Starting browser…' : 'Disconnected'}
                </div>
              </div>
            </div>

            {/* CONNECTED */}
            {isReady && (
              <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle size={32} color="#059669" />
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#059669' }}>WhatsApp Connected!</p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>
                  Your campaigns will now send from your own WhatsApp number.
                </p>
                <button
                  type="button"
                  onClick={handleReconnect}
                  disabled={reconnecting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  <RefreshCw size={13} style={{ animation: reconnecting ? 'spin 1s linear infinite' : 'none' }} />
                  {reconnecting ? 'Reconnecting…' : 'Force Reconnect'}
                </button>
              </div>
            )}

            {/* QR CODE */}
            {isQr && session.qr && (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
                  <QrCode size={15} color="#2563eb" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>Scan with WhatsApp</span>
                </div>
                <img
                  src={session.qr}
                  alt="WhatsApp QR Code"
                  style={{ width: 220, height: 220, margin: '0 auto 12px', display: 'block', borderRadius: 14, border: '2px solid #bfdbfe' }}
                />
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  WhatsApp → <strong>Linked Devices</strong> → <strong>Link a Device</strong>
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>QR refreshes every ~20s</p>
              </div>
            )}

            {/* QR state — image not ready yet */}
            {isQr && !session.qr && (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <Loader size={28} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Generating QR code…</p>
              </div>
            )}

            {/* LOADING */}
            {isLoading && (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <Loader size={28} color="#f59e0b" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Browser starting, QR will appear in ~10s…</p>
              </div>
            )}

            {/* DISCONNECTED */}
            {isDisconnected && (
              <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <WifiOff size={30} color="#dc2626" />
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#dc2626' }}>Disconnected</p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b' }}>Session lost — reconnect to scan a new QR</p>
                <button
                  type="button"
                  onClick={handleReconnect}
                  disabled={reconnecting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: reconnecting ? 'not-allowed' : 'pointer', opacity: reconnecting ? 0.7 : 1 }}
                >
                  <RefreshCw size={14} style={{ animation: reconnecting ? 'spin 1s linear infinite' : 'none' }} />
                  {reconnecting ? 'Reconnecting…' : 'Reconnect & Scan QR'}
                </button>
              </div>
            )}
          </div>

          {/* Info tip */}
          <div style={{ marginTop: 20, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#92400e' }}>
            <strong>Note:</strong> Scan once — your session saves automatically and reconnects on server restart. Each client has their own private WhatsApp session.
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </ClientLayout>
  );
}
