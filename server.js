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
  catch { return { users: [], positions: [], requests: [] }; }
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
    totalUsers: db.users.length,
    backpackers: db.users.filter(u => u.role === 'backpacker').length,
    managers: db.users.filter(u => u.role === 'manager').length,
    positions: db.positions.length,
    requests: db.requests.length,
  });
});

// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀  Pairgo API  →  http://localhost:${PORT}`);
  if (!IS_PROD) console.log(`⚠️   JWT_SECRET: using dev default — set JWT_SECRET env var in production\n`);
});
