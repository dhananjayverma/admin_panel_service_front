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
  if (!res.ok) throw new Error(data.message || res.statusText || 'Request failed');
  return data;
}

export const api = {
  auth: {
    login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
  },
  users: {
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
  },
  numbers: {
    list: () => request('/numbers'),
    create: (body) => request('/numbers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/numbers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  },
  analytics: {
    overview: () => request('/analytics/overview'),
  },
  settings: {
    get: () => request('/settings'),
  },
};
