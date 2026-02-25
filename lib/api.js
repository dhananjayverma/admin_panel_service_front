const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(data.message || res.statusText || 'Request failed');
  }
  return data;
}

export const api = {
  auth: {
    getCaptcha: () => request('/auth/captcha'),
    login: (email, password, captchaId, captchaCode) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, captchaId, captchaCode }),
      }),
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/users/me'),
  },
  users: {
    me: () => request('/users/me'),
    list: (params) => request('/users?' + new URLSearchParams(params || {}).toString()),
  },
  credits: {
    purchase: (userId, amount) => request('/credits/purchase', { method: 'POST', body: JSON.stringify({ userId, amount }) }),
    history: (params) => request('/credits/history?' + new URLSearchParams(params || {}).toString()),
  },
  campaigns: {
    list: () => request('/campaigns'),
    get: (id) => request(`/campaigns/${id}`),
    create: (body) => request('/campaigns', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    addRecipients: (id, recipients) => request(`/campaigns/${id}/recipients`, { method: 'POST', body: JSON.stringify(Array.isArray(recipients) ? recipients : { recipients }) }),
    start: (id) => request(`/campaigns/${id}/start`, { method: 'POST' }),
    pause: (id) => request(`/campaigns/${id}/pause`, { method: 'POST' }),
    validateNumbers: (rows) => request('/campaigns/validate-numbers', { method: 'POST', body: JSON.stringify(Array.isArray(rows) ? rows : { numbers: rows }) }),
    exportUrl: (id, format = 'csv') => `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/campaigns/${id}/export?format=${format}`,
    exportCsv: async (id) => {
      const token = getToken();
      const url = `${API_URL}/campaigns/${id}/export?format=csv`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `campaign-${id}-recipients.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    },
  },
  numbers: {
    list: () => request('/numbers'),
    create: (body) => request('/numbers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/numbers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  },
  analytics: {
    overview: () => request('/analytics/overview'),
    adminDashboard: () => request('/analytics/admin-dashboard'),
  },
  settings: {
    get: () => request('/settings'),
    getChatbot: () => request('/settings/chatbot'),
    updateChatbot: (body) => request('/settings/chatbot', { method: 'PUT', body: JSON.stringify(body) }),
  },
  demoRequests: {
    limits: () => request('/demo-requests/limits'),
    submit: (message) => request('/demo-requests', { method: 'POST', body: JSON.stringify({ message }) }),
    list: () => request('/demo-requests'),
    update: (id, status) => request(`/demo-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  ai: {
    generateMessage: (prompt) => request('/ai/generate-message', { method: 'POST', body: JSON.stringify({ prompt }) }),
  },
};
