import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { User, Position, SwapRequest, Employment } from './models.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const JWT_SECRET   = process.env.JWT_SECRET   || 'pairgo_dev_secret_CHANGE_IN_PRODUCTION';
const MONGODB_URI  = process.env.MONGODB_URI  || 'mongodb://localhost:27017/pairgo';
const COOKIE       = 'pairgo_token';
const IS_PROD      = process.env.NODE_ENV === 'production';

// Never run production with the hardcoded fallback secrets
if (IS_PROD && (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD)) {
  console.error('❌  JWT_SECRET and ADMIN_PASSWORD must be set in production.');
  process.exit(1);
}

// ── Database ──────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => {
    console.error('❌  MongoDB error:', err.message);
    if (IS_PROD) process.exit(1);
    console.warn('⚠️   Running without MongoDB — set MONGODB_URI to enable DB features\n');
  });

// ── Middleware ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again in 15 minutes.' },
});

// ── Helpers ───────────────────────────────────────────────────
const initials = (name = '') =>
  name.trim().split(' ').slice(0, 2).map(w => (w[0] || '').toUpperCase()).join('') || '?';

function issueToken(res, userId) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: IS_PROD,
  });
}

async function getUserFromRequest(req) {
  const token = req.cookies[COOKIE];
  if (!token) return null;
  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(userId).select('-password');
    return user ? user.toJSON() : null;
  } catch {
    return null;
  }
}

async function requireAuth(req, res, next) {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });
  req.authUser = user;
  next();
}

function requireManager(req, res, next) {
  if (req.authUser?.role !== 'manager') return res.status(403).json({ error: 'Manager access only.' });
  next();
}

// ── AUTH ──────────────────────────────────────────────────────

app.post('/api/auth/signup', authLimiter, async (req, res) => {
  const { email, password, name, role, ...profile } = req.body;

  if (!name?.trim())    return res.status(400).json({ error: 'Full name is required.' });
  if (!email?.trim())   return res.status(400).json({ error: 'Email is required.' });
  if (!password)        return res.status(400).json({ error: 'Password is required.' });
  if (!['backpacker', 'manager'].includes(role)) return res.status(400).json({ error: 'Role must be backpacker or manager.' });
  if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Invalid email address.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) return res.status(400).json({ error: 'An account with that email already exists.' });

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email: email.toLowerCase().trim(),
    password: hash,
    name: name.trim(),
    initials: initials(name),
    role,
    ...profile,
  });

  issueToken(res, user._id.toString());
  const safe = user.toJSON();
  delete safe.password;
  res.json({ user: safe });
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  const dummyHash = '$2b$12$invalidhashfortimingprotectiononly00000000000000000000';
  const match = user
    ? await bcrypt.compare(password, user.password)
    : await bcrypt.compare(password, dummyHash);

  if (!user || !match) return res.status(401).json({ error: 'Incorrect email or password.' });

  issueToken(res, user._id.toString());
  const safe = user.toJSON();
  delete safe.password;
  res.json({ user: safe });
});

app.get('/api/auth/me', async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE, { httpOnly: true, sameSite: IS_PROD ? 'strict' : 'lax', secure: IS_PROD });
  res.json({ ok: true });
});

// ── POSITIONS ─────────────────────────────────────────────────

app.get('/api/positions', async (_, res) => {
  res.json(await Position.find().sort({ createdAt: -1 }));
});

app.post('/api/positions', requireAuth, requireManager, async (req, res) => {
  const pos = await Position.create({ ...req.body, status: 'open', managerId: req.authUser.id });
  res.json(pos);
});

app.patch('/api/positions/:id', requireAuth, requireManager, async (req, res) => {
  const pos = await Position.findById(req.params.id);
  if (!pos) return res.status(404).json({ error: 'Not found' });
  if (pos.get('managerId') !== req.authUser.id) return res.status(403).json({ error: 'Forbidden.' });

  const { managerId: _m, _id, id: _i, ...updates } = req.body;
  pos.set(updates);
  await pos.save();
  res.json(pos);
});

// ── REQUESTS ──────────────────────────────────────────────────

// Users only see requests they are part of
app.get('/api/requests', requireAuth, async (req, res) => {
  const me = req.authUser.id;
  res.json(await SwapRequest.find({ $or: [{ managerId: me }, { backpackerId: me }] }).sort({ createdAt: -1 }));
});

app.post('/api/requests', requireAuth, async (req, res) => {
  const me = req.authUser;
  // The caller is always one side of the request — never let them create it on someone else's behalf
  const sides = me.role === 'manager'
    ? { managerId: me.id, initiator: 'manager' }
    : { backpackerId: me.id, initiator: 'backpacker' };
  const r = await SwapRequest.create({ ...req.body, ...sides, status: 'pending', rating: null });
  res.json(r);
});

const REQUEST_STATUSES = ['pending', 'active', 'declined', 'completed'];

app.patch('/api/requests/:id', requireAuth, async (req, res) => {
  const r = await SwapRequest.findById(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const me = req.authUser.id;
  if (r.managerId !== me && r.backpackerId !== me) return res.status(403).json({ error: 'Forbidden.' });

  const { status, rating } = req.body;
  if (status !== undefined) {
    if (!REQUEST_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    r.status = status;
  }
  if (rating !== undefined) {
    if (r.managerId !== me) return res.status(403).json({ error: 'Only the manager can rate.' });
    r.rating = rating;
  }
  await r.save();
  res.json(r);
});

// ── VENUES ────────────────────────────────────────────────────

// Public list of venues (managers) so workers can pick where they currently work
app.get('/api/venues', async (_, res) => {
  const managers = await User.find({ role: 'manager', venueName: { $nin: [null, ''] } })
    .select('name venueName city venueType').sort({ venueName: 1 });
  res.json(managers.map(m => ({
    managerId: m._id.toString(), managerName: m.name,
    venueName: m.venueName, city: m.city || '', venueType: m.venueType || '',
  })));
});

// ── EMPLOYMENT ────────────────────────────────────────────────

const OPEN_EMPLOYMENT = ['pending', 'active'];
const WORKER_FIELDS = 'name email initials avatarColor profilePhoto currentRole nationality visaType';

// Worker: their own links. Manager: their team (with worker info attached).
app.get('/api/employment', requireAuth, async (req, res) => {
  const me = req.authUser;
  if (me.role === 'backpacker') {
    return res.json(await Employment.find({ workerId: me.id }).sort({ createdAt: -1 }));
  }
  const links = await Employment.find({ managerId: me.id }).sort({ createdAt: -1 });
  const workers = await User.find({ _id: { $in: links.map(l => l.workerId) } }).select(WORKER_FIELDS);
  const byId = Object.fromEntries(workers.map(w => [w._id.toString(), w.toJSON()]));
  res.json(links.map(l => ({ ...l.toJSON(), worker: byId[l.workerId] || null })));
});

app.post('/api/employment', requireAuth, async (req, res) => {
  const me = req.authUser;
  if (me.role !== 'backpacker') return res.status(403).json({ error: 'Only workers can link to a venue.' });

  const { managerId, role, startDate } = req.body;
  if (!managerId || !role?.trim()) return res.status(400).json({ error: 'Venue and role are required.' });
  if (!mongoose.isValidObjectId(managerId)) return res.status(400).json({ error: 'Invalid venue.' });

  const manager = await User.findOne({ _id: managerId, role: 'manager' });
  if (!manager) return res.status(404).json({ error: 'Venue not found.' });

  // One current job at a time
  const open = await Employment.findOne({ workerId: me.id, status: { $in: OPEN_EMPLOYMENT } });
  if (open) return res.status(409).json({ error: 'You already have a current job. End it or cancel the pending request first.' });

  const link = await Employment.create({
    workerId: me.id, managerId, role: role.trim(), startDate: startDate || '',
    venueName: manager.venueName || manager.name, city: manager.city || '',
  });
  res.json(link);
});

// action → { who may do it, from which status, to which status }
const EMPLOYMENT_ACTIONS = {
  confirm: { by: 'manager', from: ['pending'],         to: 'active' },
  reject:  { by: 'manager', from: ['pending'],         to: 'rejected' },
  cancel:  { by: 'worker',  from: ['pending'],         to: 'cancelled' },
  end:     { by: 'either',  from: ['active'],          to: 'ended' },
};

app.patch('/api/employment/:id', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const link = await Employment.findById(req.params.id);
  if (!link) return res.status(404).json({ error: 'Not found' });

  const me = req.authUser.id;
  const side = link.managerId === me ? 'manager' : link.workerId === me ? 'worker' : null;
  if (!side) return res.status(403).json({ error: 'Forbidden.' });

  const rule = EMPLOYMENT_ACTIONS[req.body.action];
  if (!rule) return res.status(400).json({ error: 'Invalid action.' });
  if (rule.by !== 'either' && rule.by !== side) return res.status(403).json({ error: 'You cannot do that.' });
  if (!rule.from.includes(link.status)) return res.status(409).json({ error: `Cannot ${req.body.action}: this job is ${link.status}.` });

  link.status = rule.to;
  if (rule.to === 'active') link.confirmedAt = new Date();
  if (rule.to === 'ended')  link.endedAt = new Date();
  await link.save();
  res.json(link);
});

// ── BACKPACKERS ───────────────────────────────────────────────

app.get('/api/backpackers', async (_, res) => {
  const users = await User.find({ role: 'backpacker' }).select('-password');
  const verifiedIds = new Set(
    (await Employment.find({ status: 'active', workerId: { $in: users.map(u => u._id.toString()) } }).select('workerId'))
      .map(e => e.workerId)
  );
  const bps = users.map(u => {
    const obj = u.toJSON();
    return {
      ...obj,
      roles:         [obj.currentRole].filter(Boolean),
      verified:      verifiedIds.has(obj.id),
      rating:        0,
      reviewCount:   0,
      swapsCompleted:0,
      bio:           obj.bio || 'Backpacker looking for work swaps across Australia.',
      availableFrom: obj.availableFrom || '',
    };
  });
  res.json(bps);
});

// ── USERS (profile update) ────────────────────────────────────

app.patch('/api/users/:id', requireAuth, async (req, res) => {
  if (req.authUser.id !== req.params.id) return res.status(403).json({ error: 'Forbidden.' });

  const { password: _p, email: _e, role: _r, id: _id, ...updates } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: false });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const safe = user.toJSON();
  delete safe.password;
  res.json({ user: safe });
});

// ── ADMIN ─────────────────────────────────────────────────────

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pairgo2026';
const ADMIN_COOKIE   = 'pairgo_admin';
const adminLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, legacyHeaders: false, message: { error: 'Too many attempts, please try again in 15 minutes.' } });

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
  if (req.body.password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Incorrect password.' });
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

app.get('/api/admin/users', requireAdmin, async (_, res) => {
  res.json((await User.find().select('-password')).map(u => u.toJSON()));
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  await Employment.deleteMany({ $or: [{ workerId: req.params.id }, { managerId: req.params.id }] });
  res.json({ ok: true });
});

app.patch('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const allowed = ['role', 'name', 'email'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const safe = user.toJSON();
  delete safe.password;
  res.json({ user: safe });
});

app.get('/api/admin/stats', requireAdmin, async (_, res) => {
  const [totalUsers, backpackers, managers, positions, requests] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'backpacker' }),
    User.countDocuments({ role: 'manager' }),
    Position.countDocuments(),
    SwapRequest.countDocuments(),
  ]);
  res.json({ totalUsers, backpackers, managers, positions, requests });
});

// ── STATIC FILES (production) ─────────────────────────────────
if (IS_PROD) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.use((req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀  Pairgo API  →  http://localhost:${PORT}`);
  if (!process.env.JWT_SECRET) console.log(`⚠️   JWT_SECRET: using dev default — set JWT_SECRET env var in production\n`);
});
