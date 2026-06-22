import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const DB = path.join(__dirname, 'db.json');

const JWT_SECRET = process.env.JWT_SECRET || 'pairgo_dev_secret_CHANGE_IN_PRODUCTION';
const COOKIE = 'pairgo_token';
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rate limiter for auth endpoints: max 15 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again in 15 minutes.' },
});

// --- DB helpers ---
const read = () => {
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
  catch { return { users: [], positions: [], requests: [], job_posts: [], availability_posts: [] }; }
};
const write = (db) => fs.writeFileSync(DB, JSON.stringify(db, null, 2));

// --- Avatar helpers ---
const COLORS = ['#e8654a','#60a5fa','#a78bfa','#34d399','#f472b6','#fbbf24','#6ee7b7','#c084fc'];
const avatarColor = (id = '') => COLORS[id.charCodeAt(id.length - 1) % COLORS.length] || '#e8654a';
const initials = (name = '') => name.trim().split(' ').slice(0, 2).map(w => (w[0] || '').toUpperCase()).join('') || '?';

// --- JWT helpers ---
function issueToken(res, userId) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: IS_PROD,
  });
}

function getUserFromRequest(req) {
  const token = req.cookies[COOKIE];
  if (!token) return null;
  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    const db = read();
    return db.users.find(u => u.id === userId) ?? null;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });
  req.authUser = user;
  next();
}

function requireManager(req, res, next) {
  if (req.authUser?.role !== 'manager') {
    return res.status(403).json({ error: 'Manager access only.' });
  }
  next();
}

function requireBackpacker(req, res, next) {
  if (req.authUser?.role !== 'backpacker') {
    return res.status(403).json({ error: 'Backpacker access only.' });
  }
  next();
}

// ── AUTH ──────────────────────────────────────────────────────

app.post('/api/auth/signup', authLimiter, async (req, res) => {
  const { email, password, name, ...profile } = req.body;

  if (!name?.trim())     return res.status(400).json({ error: 'Full name is required.' });
  if (!email?.trim())    return res.status(400).json({ error: 'Email is required.' });
  if (!password)         return res.status(400).json({ error: 'Password is required.' });
  if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Invalid email address.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const db = read();
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'An account with that email already exists.' });
  }

  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const hash = await bcrypt.hash(password, 12);
  const user = {
    id,
    email: email.toLowerCase().trim(),
    password: hash,
    name: name.trim(),
    initials: initials(name),
    avatarColor: avatarColor(id),
    ...profile,
  };
  db.users.push(user);
  write(db);

  issueToken(res, id);
  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const db = read();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  // Always compare (even if user not found) to prevent timing attacks
  const dummyHash = '$2b$12$invalidhashfortimingprotectiononly00000000000000000000';
  const match = user ? await bcrypt.compare(password, user.password) : await bcrypt.compare(password, dummyHash);

  if (!user || !match) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  issueToken(res, user.id);
  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

app.get('/api/auth/me', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });
  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE, { httpOnly: true, sameSite: IS_PROD ? 'strict' : 'lax', secure: IS_PROD });
  res.json({ ok: true });
});

// ── POSITIONS ─────────────────────────────────────────────────

app.get('/api/positions', (_, res) => res.json(read().positions));

app.post('/api/positions', requireAuth, (req, res) => {
  const db = read();
  const pos = { id: `pos_${Date.now()}`, createdAt: Date.now(), status: 'open', ...req.body };
  db.positions.unshift(pos);
  write(db);
  res.json(pos);
});

app.patch('/api/positions/:id', requireAuth, (req, res) => {
  const db = read();
  const i = db.positions.findIndex(p => p.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Not found' });
  db.positions[i] = { ...db.positions[i], ...req.body };
  write(db);
  res.json(db.positions[i]);
});

// ── REQUESTS ──────────────────────────────────────────────────

app.get('/api/requests', requireAuth, (_, res) => res.json(read().requests));

app.post('/api/requests', requireAuth, (req, res) => {
  const db = read();
  const r = { id: `req_${Date.now()}`, createdAt: Date.now(), status: 'pending', rating: null, ...req.body };
  db.requests.unshift(r);
  write(db);
  res.json(r);
});

app.patch('/api/requests/:id', requireAuth, (req, res) => {
  const db = read();
  const i = db.requests.findIndex(r => r.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Not found' });
  db.requests[i] = { ...db.requests[i], ...req.body };
  write(db);
  res.json(db.requests[i]);
});

// ── BACKPACKERS ───────────────────────────────────────────────

app.get('/api/backpackers', (_, res) => {
  const db = read();
  const bps = db.users
    .filter(u => u.role === 'backpacker')
    .map(({ password, ...u }) => ({
      ...u,
      initials: u.initials || initials(u.name),
      avatarColor: u.avatarColor || avatarColor(u.id),
      roles: [u.currentRole].filter(Boolean),
      verified: false,
      rating: 0,
      reviewCount: 0,
      swapsCompleted: 0,
      bio: u.bio || 'Backpacker looking for work swaps across Australia.',
      availableFrom: u.availableFrom || '',
      isRealUser: true,
    }));
  res.json(bps);
});

// ── USERS (profile update) ────────────────────────────────────

app.patch('/api/users/:id', requireAuth, (req, res) => {
  if (req.authUser.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  const db = read();
  const i = db.users.findIndex(u => u.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'User not found' });

  // Never allow overwriting identity/auth fields via this endpoint
  const { password, email, role, id: _id, ...updates } = req.body;
  db.users[i] = { ...db.users[i], ...updates };
  write(db);
  const { password: _, ...safe } = db.users[i];
  res.json({ user: safe });
});

// ── JOB POSTS ─────────────────────────────────────────────────
// Public collection. Managers create/own them; backpackers browse & filter them.

const VALID_CONTRACTS = ['Casual', 'Part-time', 'Full-time'];

// GET /api/jobs  ─ public
// Query: city, position, status (default "active"), managerId
app.get('/api/jobs', (req, res) => {
  const db = read();
  const { city, position, status = 'active', managerId } = req.query;

  let jobs = db.job_posts || [];
  if (status !== 'all')  jobs = jobs.filter(j => j.status === status);
  if (managerId)         jobs = jobs.filter(j => j.managerId === managerId);
  if (city) {
    const q = city.toLowerCase();
    jobs = jobs.filter(j => j.location.toLowerCase().includes(q));
  }
  if (position) {
    const q = position.toLowerCase();
    jobs = jobs.filter(j => j.position.toLowerCase().includes(q));
  }

  const enriched = jobs.map(job => {
    const mgr = db.users.find(u => u.id === job.managerId);
    return {
      ...job,
      managerName:      mgr?.name      || '',
      managerInitials:  mgr?.initials  || '',
      managerAvatarColor: mgr?.avatarColor || '#e8654a',
      managerVenueType: mgr?.venueType || '',
    };
  });

  res.json(enriched);
});

// POST /api/jobs  ─ manager only
app.post('/api/jobs', requireAuth, requireManager, (req, res) => {
  const { venueName, position, location, salaryRate, contractType, scheduleNeeded, description } = req.body;

  if (!venueName?.trim())  return res.status(400).json({ error: 'venueName is required.' });
  if (!position?.trim())   return res.status(400).json({ error: 'position is required.' });
  if (!location?.trim())   return res.status(400).json({ error: 'location is required.' });
  if (!contractType)       return res.status(400).json({ error: 'contractType is required.' });
  if (!VALID_CONTRACTS.includes(contractType)) {
    return res.status(400).json({ error: `contractType must be one of: ${VALID_CONTRACTS.join(', ')}` });
  }

  const db = read();
  if (!db.job_posts) db.job_posts = [];

  const job = {
    id:             `job_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    managerId:      req.authUser.id,
    venueName:      venueName.trim(),
    position:       position.trim(),
    location:       location.trim(),
    salaryRate:     salaryRate     || '',
    contractType,
    scheduleNeeded: scheduleNeeded || {},
    description:    description    || '',
    status:         'active',
    createdAt:      Date.now(),
  };

  db.job_posts.unshift(job);
  write(db);
  res.status(201).json(job);
});

// GET /api/jobs/mine  ─ manager's own jobs (must come before /:id)
app.get('/api/jobs/mine', requireAuth, requireManager, (req, res) => {
  const db = read();
  const jobs = (db.job_posts || []).filter(j => j.managerId === req.authUser.id);
  res.json(jobs);
});

// GET /api/jobs/:id  ─ public
app.get('/api/jobs/:id', (req, res) => {
  const db = read();
  const job = (db.job_posts || []).find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });

  const mgr = db.users.find(u => u.id === job.managerId);
  res.json({
    ...job,
    managerName:      mgr?.name      || '',
    managerInitials:  mgr?.initials  || '',
    managerAvatarColor: mgr?.avatarColor || '#e8654a',
    managerVenueType: mgr?.venueType || '',
  });
});

// PATCH /api/jobs/:id  ─ owner manager only
app.patch('/api/jobs/:id', requireAuth, requireManager, (req, res) => {
  const db = read();
  const jobs = db.job_posts || [];
  const i = jobs.findIndex(j => j.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Job not found.' });
  if (jobs[i].managerId !== req.authUser.id) return res.status(403).json({ error: 'Forbidden.' });

  const { managerId: _m, id: _id, createdAt: _c, ...updates } = req.body;
  if (updates.contractType && !VALID_CONTRACTS.includes(updates.contractType)) {
    return res.status(400).json({ error: `contractType must be one of: ${VALID_CONTRACTS.join(', ')}` });
  }

  db.job_posts[i] = { ...db.job_posts[i], ...updates };
  write(db);
  res.json(db.job_posts[i]);
});

// DELETE /api/jobs/:id  ─ owner manager only
app.delete('/api/jobs/:id', requireAuth, requireManager, (req, res) => {
  const db = read();
  const jobs = db.job_posts || [];
  const i = jobs.findIndex(j => j.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Job not found.' });
  if (jobs[i].managerId !== req.authUser.id) return res.status(403).json({ error: 'Forbidden.' });

  db.job_posts.splice(i, 1);
  write(db);
  res.json({ ok: true });
});

// ── AVAILABILITY POSTS ────────────────────────────────────────
// One card per backpacker (upsert). Controls visibility in the talent feed.

// GET /api/availability/me  ─ backpacker's own card
app.get('/api/availability/me', requireAuth, requireBackpacker, (req, res) => {
  const db = read();
  const card = (db.availability_posts || []).find(a => a.backpackerId === req.authUser.id);
  if (!card) return res.status(404).json({ error: 'No availability card yet.' });
  res.json(card);
});

// POST /api/availability  ─ create or update own card (upsert)
// All body fields are optional; each call merges with the existing card.
// Fields: visaStatus, languages, currentCity, targetCity, arrivalDate,
//         availabilityGrid, isActive, introVideoUrl
app.post('/api/availability', requireAuth, requireBackpacker, (req, res) => {
  const db = read();
  if (!db.availability_posts) db.availability_posts = [];

  const u = req.authUser;
  const existingIdx = db.availability_posts.findIndex(a => a.backpackerId === u.id);
  const existing    = existingIdx >= 0 ? db.availability_posts[existingIdx] : null;

  // verifiedExperienceCount is always recomputed from completed swaps (never stale)
  const verifiedExperienceCount = (db.requests || []).filter(
    r => r.backpackerId === u.id && r.status === 'completed'
  ).length;

  const {
    visaStatus, languages, currentCity, targetCity,
    arrivalDate, availabilityGrid, isActive, introVideoUrl,
  } = req.body;

  const card = {
    id:             existing?.id ?? `avail_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    backpackerId:   u.id,
    // Preference order: request body → existing card → user profile fallback
    visaStatus:     visaStatus       ?? existing?.visaStatus       ?? u.visaType    ?? '',
    languages:      languages        ?? existing?.languages        ?? u.languages   ?? [],
    currentCity:    currentCity      ?? existing?.currentCity      ?? u.currentCity ?? '',
    targetCity:     targetCity       ?? existing?.targetCity       ?? u.targetCity  ?? '',
    arrivalDate:    arrivalDate      ?? existing?.arrivalDate      ?? '',
    availabilityGrid: availabilityGrid ?? existing?.availabilityGrid ?? u.availability ?? {},
    isActive:       isActive !== undefined ? Boolean(isActive)    : (existing?.isActive ?? true),
    introVideoUrl:  introVideoUrl    ?? existing?.introVideoUrl    ?? u.videoUrl    ?? '',
    verifiedExperienceCount,
    createdAt:      existing?.createdAt ?? Date.now(),
    updatedAt:      Date.now(),
  };

  if (existingIdx >= 0) {
    db.availability_posts[existingIdx] = card;
  } else {
    db.availability_posts.unshift(card);
  }

  write(db);
  res.status(existingIdx >= 0 ? 200 : 201).json(card);
});

// ── TALENTS ───────────────────────────────────────────────────
// Manager-only feed: active backpackers whose current or target city matches.

// GET /api/talents
// Query: city (defaults to manager's venue city), sort ("arrival"|"experience"), limit (max 200)
app.get('/api/talents', requireAuth, requireManager, (req, res) => {
  const db = read();

  const filterCity = ((req.query.city || req.authUser.city || '')).toLowerCase().trim();
  const sort  = req.query.sort  || 'arrival';
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);

  // Recompute verified counts from source of truth (never trust stored value for ranking)
  const completedByBP = {};
  for (const r of (db.requests || [])) {
    if (r.status === 'completed') {
      completedByBP[r.backpackerId] = (completedByBP[r.backpackerId] || 0) + 1;
    }
  }

  let talents = (db.availability_posts || []).filter(a => a.isActive);

  if (filterCity) {
    talents = talents.filter(a =>
      a.currentCity.toLowerCase().includes(filterCity) ||
      a.targetCity.toLowerCase().includes(filterCity)
    );
  }

  if (sort === 'experience') {
    talents.sort((a, b) =>
      (completedByBP[b.backpackerId] || 0) - (completedByBP[a.backpackerId] || 0)
    );
  } else {
    // Soonest arrival first; tiebreak by verified experience
    talents.sort((a, b) => {
      const dA = a.arrivalDate ? new Date(a.arrivalDate).getTime() : Infinity;
      const dB = b.arrivalDate ? new Date(b.arrivalDate).getTime() : Infinity;
      if (dA !== dB) return dA - dB;
      return (completedByBP[b.backpackerId] || 0) - (completedByBP[a.backpackerId] || 0);
    });
  }

  const enriched = talents.slice(0, limit).map(card => {
    const user = db.users.find(u => u.id === card.backpackerId);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return {
      ...card,
      verifiedExperienceCount: completedByBP[card.backpackerId] || 0,
      backpacker: safeUser,
    };
  }).filter(Boolean);

  res.json(enriched);
});

// ── ADMIN ─────────────────────────────────────────────────────

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pairgo2026';
const ADMIN_COOKIE = 'pairgo_admin';

const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, legacyHeaders: false });

function requireAdmin(req, res, next) {
  const token = req.cookies[ADMIN_COOKIE];
  if (!token) return res.status(401).json({ error: 'Admin access required.' });
  try {
    jwt.verify(token, JWT_SECRET + '_admin');
    next();
  } catch {
    res.clearCookie(ADMIN_COOKIE);
    return res.status(401).json({ error: 'Admin session expired.' });
  }
}

app.post('/api/admin/login', adminLimiter, (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  const token = jwt.sign({ admin: true }, JWT_SECRET + '_admin', { expiresIn: '24h' });
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    secure: IS_PROD,
  });
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie(ADMIN_COOKIE, { httpOnly: true, sameSite: IS_PROD ? 'strict' : 'lax', secure: IS_PROD });
  res.json({ ok: true });
});

app.get('/api/admin/check', requireAdmin, (_, res) => res.json({ ok: true }));

app.get('/api/admin/users', requireAdmin, (_, res) => {
  const db = read();
  res.json(db.users.map(({ password, ...u }) => u));
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  const db = read();
  const i = db.users.findIndex(u => u.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'User not found.' });
  db.users.splice(i, 1);
  write(db);
  res.json({ ok: true });
});

app.patch('/api/admin/users/:id', requireAdmin, (req, res) => {
  const db = read();
  const i = db.users.findIndex(u => u.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'User not found.' });
  const allowed = ['role', 'name', 'email'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  db.users[i] = { ...db.users[i], ...updates };
  write(db);
  const { password, ...safe } = db.users[i];
  res.json({ user: safe });
});

app.get('/api/admin/stats', requireAdmin, (_, res) => {
  const db = read();
  res.json({
    totalUsers:         db.users.length,
    backpackers:        db.users.filter(u => u.role === 'backpacker').length,
    managers:           db.users.filter(u => u.role === 'manager').length,
    positions:          db.positions.length,
    requests:           db.requests.length,
    jobPosts:           (db.job_posts || []).length,
    activeJobPosts:     (db.job_posts || []).filter(j => j.status === 'active').length,
    availabilityCards:  (db.availability_posts || []).length,
    activeAvailability: (db.availability_posts || []).filter(a => a.isActive).length,
  });
});

// ── STATIC FILES (production) ─────────────────────────────────
if (IS_PROD) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀  Pairgo API  →  http://localhost:${PORT}`);
  if (!IS_PROD) console.log(`⚠️   JWT_SECRET: using dev default — set JWT_SECRET env var in production\n`);
});
