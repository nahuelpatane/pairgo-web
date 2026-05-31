// All requests go through Vite's proxy → Express on :3001
const BASE = '/api';

async function call(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error del servidor.');
  return data;
}

export const api = {
  // Auth
  signup: (data)            => call('POST', '/auth/signup', data),
  login:  (email, password) => call('POST', '/auth/login', { email, password }),

  // Positions
  getPositions:    ()        => call('GET',   '/positions'),
  createPosition:  (data)    => call('POST',  '/positions', data),
  patchPosition:   (id, data)=> call('PATCH', `/positions/${id}`, data),

  // Requests
  getRequests:    ()         => call('GET',   '/requests'),
  createRequest:  (data)     => call('POST',  '/requests', data),
  patchRequest:   (id, data) => call('PATCH', `/requests/${id}`, data),

  // Backpackers (para el Browse del manager)
  getBackpackers: ()         => call('GET',   '/backpackers'),
};
