// All requests go through Vite's proxy → Express on :3001
const BASE = '/api';

async function call(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include', // send/receive httpOnly cookies
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Server error.');
  return data;
}

export const api = {
  // Auth
  signup: (data)            => call('POST', '/auth/signup', data),
  login:  (email, password) => call('POST', '/auth/login', { email, password }),
  me:     ()                => call('GET',  '/auth/me'),
  logout: ()                => call('POST', '/auth/logout'),

  // Positions
  getPositions:    ()         => call('GET',   '/positions'),
  createPosition:  (data)     => call('POST',  '/positions', data),
  patchPosition:   (id, data) => call('PATCH', `/positions/${id}`, data),

  // Requests
  getRequests:    ()          => call('GET',   '/requests'),
  createRequest:  (data)      => call('POST',  '/requests', data),
  patchRequest:   (id, data)  => call('PATCH', `/requests/${id}`, data),

  // Backpackers (legacy browse list)
  getBackpackers: ()          => call('GET',   '/backpackers'),

  // User profile update
  patchUser: (id, data)       => call('PATCH', `/users/${id}`, data),

  // ── Job Posts ────────────────────────────────────────────────
  // p: { city?, position?, status?, managerId? }
  getJobs:    (p = {}) => {
    const qs = new URLSearchParams(p).toString();
    return call('GET', `/jobs${qs ? '?' + qs : ''}`);
  },
  getMyJobs:  ()              => call('GET',    '/jobs/mine'),
  getJob:     (id)            => call('GET',    `/jobs/${id}`),
  createJob:  (data)          => call('POST',   '/jobs', data),
  updateJob:  (id, data)      => call('PATCH',  `/jobs/${id}`, data),
  deleteJob:  (id)            => call('DELETE', `/jobs/${id}`),

  // ── Availability Posts ───────────────────────────────────────
  // POST creates or updates (upsert) — one card per backpacker
  // Body: { visaStatus?, languages?, currentCity?, targetCity?,
  //         arrivalDate?, availabilityGrid?, isActive?, introVideoUrl? }
  getMyAvailability:   ()      => call('GET',  '/availability/me'),
  upsertAvailability:  (data)  => call('POST', '/availability', data),

  // ── Talents (manager feed) ───────────────────────────────────
  // p: { city?, sort?: "arrival"|"experience", limit? }
  getTalents: (p = {}) => {
    const qs = new URLSearchParams(p).toString();
    return call('GET', `/talents${qs ? '?' + qs : ''}`);
  },

  // Admin
  adminLogin:      (password) => call('POST',   '/admin/login',       { password }),
  adminLogout:     ()         => call('POST',   '/admin/logout'),
  adminCheck:      ()         => call('GET',    '/admin/check'),
  adminGetUsers:   ()         => call('GET',    '/admin/users'),
  adminGetStats:   ()         => call('GET',    '/admin/stats'),
  adminDeleteUser: (id)       => call('DELETE', `/admin/users/${id}`),
  adminPatchUser:  (id, data) => call('PATCH',  `/admin/users/${id}`, data),
};
