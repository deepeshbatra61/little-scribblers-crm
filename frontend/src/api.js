const BASE = '/api';

const getToken = () => localStorage.getItem('ls_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handle = async res => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
};

export const api = {
  // Auth
  login: (username, password) =>
    fetch(`${BASE}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify({ username, password }) }).then(handle),

  me: () =>
    fetch(`${BASE}/auth/me`, { headers: headers() }).then(handle),

  changePassword: (current_password, new_password) =>
    fetch(`${BASE}/auth/change-password`, { method: 'POST', headers: headers(), body: JSON.stringify({ current_password, new_password }) }).then(handle),

  // Tickets
  getTickets: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return fetch(`${BASE}/tickets${qs ? '?' + qs : ''}`, { headers: headers() }).then(handle);
  },

  getTicket: id =>
    fetch(`${BASE}/tickets/${id}`, { headers: headers() }).then(handle),

  createTicket: data =>
    fetch(`${BASE}/tickets`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handle),

  updateTicket: (id, data) =>
    fetch(`${BASE}/tickets/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(data) }).then(handle),

  addComment: (id, content) =>
    fetch(`${BASE}/tickets/${id}/comments`, { method: 'POST', headers: headers(), body: JSON.stringify({ content }) }).then(handle),

  // Stats
  getStats: () =>
    fetch(`${BASE}/stats`, { headers: headers() }).then(handle),

  // Users
  getUsers: () =>
    fetch(`${BASE}/users`, { headers: headers() }).then(handle),

  // Notifications
  getNotifications: () =>
    fetch(`${BASE}/notifications`, { headers: headers() }).then(handle),

  markAllRead: () =>
    fetch(`${BASE}/notifications/read-all`, { method: 'PATCH', headers: headers() }).then(handle),

  clearNotifications: () =>
    fetch(`${BASE}/notifications`, { method: 'DELETE', headers: headers() }).then(handle),
};
