import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import EmptyState from '../../../components/EmptyState';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useToast } from '../../../contexts/ToastContext';

export default function AdminReportWhatsApp() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace(user ? (user.role === 'reseller' ? '/reseller/dashboard' : '/client/dashboard') : '/login');
      return;
    }
    if (!user) return;
    api.campaigns.list().then((r) => setCampaigns(r.campaigns || [])).catch(() => setCampaigns([])).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user) return <LoadingSpinner />;

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <AdminLayout>
      <div className="admin-report-shell">
        <div className="admin-report-head">
          <div>
            <p className="admin-report-kicker">WhatsApp Report</p>
            <h1 className="admin-report-title">Campaign Reports</h1>
            <p className="admin-report-subtitle">Filter by date range and download campaign reports.</p>
          </div>
          <div className="admin-report-note">
            Reports are available for the next 60 days. We will be informed within 12 hours.
          </div>
        </div>

        <form className="admin-report-filters" onSubmit={handleSubmit}>
          <label className="admin-report-field">
            <span>Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="admin-report-field">
            <span>End date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <button type="submit" className="admin-report-submit-btn">Apply Filters</button>
        </form>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="admin-report-card">
          <div className="admin-report-table-wrap">
            <table className="admin-report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User Name</th>
                  <th>Campaign Name</th>
                  <th>Number Count</th>
                  <th>Campaign List</th>
                  <th>Type</th>
                  <th>T&amp;C</th>
                  <th>Campaign Submit</th>
                  <th>Campaign Report</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="admin-report-empty">
                      <EmptyState message="No campaigns." />
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c, index) => (
                    <tr key={c._id}>
                      <td>{index + 1}</td>
                      <td>{c.userName || c.ownerName || '-'}</td>
                      <td>{c.name || '-'}</td>
                      <td>{c.numberCount ?? c.totalNumbers ?? '-'}</td>
                      <td>{c.listName || c.campaignList || '-'}</td>
                      <td>{c.type || '-'}</td>
                      <td>{c.termsAccepted ? 'Yes' : '-'}</td>
                      <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <button
                          type="button"
                          disabled={exporting === c._id}
                          onClick={async () => {
                            setExporting(c._id);
                            try {
                              await api.campaigns.exportCsv(c._id);
                              toast.success('CSV downloaded');
                            } catch (e) {
                              toast.error(e.message);
                            } finally {
                              setExporting(null);
                            }
                          }}
                          className="admin-report-link"
                        >
                          {exporting === c._id ? '...' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
