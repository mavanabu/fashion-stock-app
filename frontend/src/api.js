const BASE = process.env.REACT_APP_API_URL || '';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('fashion_token') || ''}`,
});

export const authApi = {
  login: (email, password) =>
    fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  register: (email, password) =>
    fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),
};

export const ordersApi = {
  list: () =>
    fetch(`${BASE}/api/orders`, { headers: headers() }).then(r => r.json()),

  create: (body) =>
    fetch(`${BASE}/api/orders`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then(r => r.json()),

  update: (id, body) =>
    fetch(`${BASE}/api/orders/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    }).then(r => r.json()),

  delete: (id) =>
    fetch(`${BASE}/api/orders/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then(r => r.json()),
};

export const optionsApi = {
  list: (type) =>
    fetch(`${BASE}/api/options/${type}`, { headers: headers() }).then(r => r.json()),

  create: (type, name) =>
    fetch(`${BASE}/api/options/${type}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ name }),
    }).then(r => r.json()),

  delete: (type, id) =>
    fetch(`${BASE}/api/options/${type}/${id}`, {
      method: 'DELETE',
      headers: headers(),
    }).then(r => r.json()),

  bulk: (type, names) =>
    fetch(`${BASE}/api/options/${type}/bulk`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ names }),
    }).then(r => r.json()),
};
