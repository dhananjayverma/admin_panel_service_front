import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useRouter } from 'next/router';

export default function ClientCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [campaignType, setCampaignType] = useState('text');
  const [buttonQuestion, setButtonQuestion] = useState('');
  const [buttonOptions, setButtonOptions] = useState(['']);
  const [creating, setCreating] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const load = () => api.campaigns.list().then((r) => setCampaigns(r.campaigns || []));

  useEffect(() => {
    if (!authLoading && (!user || !['client', 'reseller'].includes(user.role))) {
      router.replace(user ? (user.role === 'admin' ? '/admin/dashboard' : '/login') : '/login');
      return;
    }
    if (!user) return;
    load().catch(() => setCampaigns([])).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  useEffect(() => {
    const t = router.query.type;
    if (t === 'button') {
      setCampaignType('button');
      setShowCreate(true);
    }
  }, [router.query.type]);

  const addOption = () => setButtonOptions((o) => [...o, '']);
  const setOption = (index, value) => setButtonOptions((o) => {
    const next = [...o];
    next[index] = value;
    return next;
  });
  const removeOption = (index) => setButtonOptions((o) => o.length > 1 ? o.filter((_, i) => i !== index) : ['']);

  const createCampaign = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const body = {
        name: name || 'Untitled',
        messageBody,
        type: campaignType,
      };
      if (campaignType === 'button') {
        body.buttonQuestion = buttonQuestion;
        body.buttonOptions = buttonOptions.filter(Boolean);
      }
      await api.campaigns.create(body);
      setName('');
      setMessageBody('');
      setCampaignType('text');
      setButtonQuestion('');
      setButtonOptions(['']);
      setShowCreate(false);
      await load();
      toast.success('Campaign created');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const startCampaign = async (id) => {
    setConfirmAction(null);
    try {
      await api.campaigns.start(id);
      await load();
      toast.success('Campaign started');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pauseCampaign = async (id) => {
    setConfirmAction(null);
    try {
      await api.campaigns.pause(id);
      await load();
      toast.success('Campaign paused');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <ClientLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Campaigns</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create and run WhatsApp campaigns</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition"
        >
          {showCreate ? 'Cancel' : 'Create Campaign'}
        </button>
      </div>
      {showCreate && (
        <form onSubmit={createCampaign} className="bg-white border border-slate-200 rounded-xl p-6 mb-6 max-w-lg space-y-4 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign name</label>
            <input placeholder="e.g. Product launch" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign type</label>
            <select value={campaignType} onChange={(e) => setCampaignType(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <option value="text">Text</option>
              <option value="button">Button Campaign</option>
              <option value="dp">DP Campaign</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message body</label>
            <textarea placeholder="Message to send to recipients" value={messageBody} onChange={(e) => setMessageBody(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" rows={3} />
          </div>
          {campaignType === 'button' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                <input placeholder="Ex. Are You Interested?" value={buttonQuestion} onChange={(e) => setButtonQuestion(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">Options</label>
                  <button type="button" onClick={addOption} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Option</button>
                </div>
                {buttonOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder={i === 0 ? 'Yes' : `Option ${i + 1}`} value={opt} onChange={(e) => setOption(i, e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    <button type="button" onClick={() => removeOption(i)} className="text-slate-500 hover:text-red-600 px-2">×</button>
                  </div>
                ))}
              </div>
            </>
          )}
          <button type="submit" disabled={creating} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">Create</button>
        </form>
      )}
      {loading ? <LoadingSpinner /> : campaigns.length === 0 ? <EmptyState message="No campaigns yet. Create one to get started." /> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Recipients</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Sent / Failed</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.type === 'dp' ? 'DP' : c.type === 'button' ? 'Button' : 'Text'}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5 text-slate-600">{c.recipientCount ?? 0}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.sentCount ?? 0} <span className="text-slate-400">/</span> {c.failedCount ?? 0}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-2">
                      {(c.status === 'draft' || c.status === 'paused') && (
                        <button type="button" onClick={() => setConfirmAction({ type: 'start', id: c._id, name: c.name })} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">Start</button>
                      )}
                      {(c.status === 'running' || c.status === 'queued') && (
                        <button type="button" onClick={() => setConfirmAction({ type: 'pause', id: c._id, name: c.name })} className="text-amber-600 hover:text-amber-700 font-medium text-sm">Pause</button>
                      )}
                      <a href={`/client/campaigns/${c._id}`} className="text-slate-600 hover:text-slate-800 font-medium text-sm">{c.status === 'draft' ? 'Edit / Add recipients' : 'View'}</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmModal
        open={confirmAction?.type === 'start'}
        title="Start campaign"
        message={`Start "${confirmAction?.name}"? Credits will be deducted.`}
        confirmLabel="Start"
        onConfirm={() => confirmAction && startCampaign(confirmAction.id)}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmModal
        open={confirmAction?.type === 'pause'}
        title="Pause campaign"
        message={`Pause "${confirmAction?.name}"?`}
        confirmLabel="Pause"
        onConfirm={() => confirmAction && pauseCampaign(confirmAction.id)}
        onCancel={() => setConfirmAction(null)}
      />
    </ClientLayout>
  );
}
