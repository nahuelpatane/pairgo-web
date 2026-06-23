import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { User, Position, SwapRequest, JobPost, AvailabilityPost } from './models.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const JWT_SECRET   = process.env.JWT_SECRET   || 'pairgo_dev_secret_CHANGE_IN_PRODUCTION';
const MONGODB_URI  = process.env.MONGODB_URI  || 'mongodb://localhost:27017/pairgo';
const COOKIE       = 'pairgo_token';
const IS_PROD      = process.env.NODE_ENV === 'production';

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

function requireBackpacker(req, res, next) {
  if (req.authUser?.role !== 'backpacker') return res.status(403).json({ error: 'Backpacker access only.' });
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

app.post('/api/positions', requireAuth, async (req, res) => {
  const pos = await Position.create({ status: 'open', ...req.body });
  res.json(pos);
});

app.patch('/api/positions/:id', requireAuth, async (req, res) => {
  const pos = await Position.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
  if (!pos) return res.status(404).json({ error: 'Not found' });
  res.json(pos);
});

// ── REQUESTS ──────────────────────────────────────────────────

app.get('/api/requests', requireAuth, async (_, res) => {
  res.json(await SwapRequest.find().sort({ createdAt: -1 }));
});

app.post('/api/requests', requireAuth, async (req, res) => {
  const r = await SwapRequest.create({ status: 'pending', rating: null, ...req.body });
  res.json(r);
});

app.patch('/api/requests/:id', requireAuth, async (req, res) => {
  const r = await SwapRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r);
});

// ── BACKPACKERS ───────────────────────────────────────────────

app.get('/api/backpackers', async (_, res) => {
  const users = await User.find({ role: 'backpacker' }).select('-password');
  const bps = users.map(u => {
    const obj = u.toJSON();
    return {
      ...obj,
      roles:         [obj.currentRole].filter(Boolean),
      verified:      false,
      rating:        0,
      reviewCount:   0,
      swapsCompleted:0,
      bio:           obj.bio || 'Backpacker looking for work swaps across Australia.',
      availableFrom: obj.availableFrom || '',
      isRealUser:    true,
    };
  });
  res.json(bps);
});

// ── USERS (profile update) ────────────────────────────────────

app.patch('/api/users/:id', requireAuth, async (req, res) => {
  if (req.authUser.id !== req.params.id) return res.status(403).json({ error: 'Forbidden.' });

  const { password, email, role, id: _id, ...updates } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: false });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const safe = user.toJSON();
  delete safe.password;
  res.json({ user: safe });
});

// ── JOB POSTS ─────────────────────────────────────────────────

const VALID_CONTRACTS = ['Casual', 'Part-time', 'Full-time'];

async function enrichJobs(jobs) {
  const mgrs = await User.find({ _id: { $in: [...new Set(jobs.map(j => j.managerId))] } })
    .select('name initials avatarColor venueType');
  const mgrMap = Object.fromEntries(mgrs.map(m => [m._id.toString(), m.toJSON()]));
  return jobs.map(job => {
    const j = job.toJSON ? job.toJSON() : job;
    const mgr = mgrMap[j.managerId] || {};
    return {
      ...j,
      managerName:        mgr.name        || '',
      managerInitials:    mgr.initials    || '',
      managerAvatarColor: mgr.avatarColor || '#e8654a',
      managerVenueType:   mgr.venueType   || '',
    };
  });
}

app.get('/api/jobs', async (req, res) => {
  const { city, position, status = 'active', managerId } = req.query;
  const filter = {};
  if (status !== 'all') filter.status = status;
  if (managerId) filter.managerId = managerId;

  let jobs = await JobPost.find(filter).sort({ createdAt: -1 });

  if (city) {
    const q = city.toLowerCase();
    jobs = jobs.filter(j => j.location.toLowerCase().includes(q));
  }
  if (position) {
    const q = position.toLowerCase();
    jobs = jobs.filter(j => j.position.toLowerCase().includes(q));
  }

  res.json(await enrichJobs(jobs));
});

app.post('/api/jobs', requireAuth, requireManager, async (req, res) => {
  const { venueName, position, location, salaryRate, contractType, scheduleNeeded, description } = req.body;

  if (!venueName?.trim())  return res.status(400).json({ error: 'venueName is required.' });
  if (!position?.trim())   return res.status(400).json({ error: 'position is required.' });
  if (!location?.trim())   return res.status(400).json({ error: 'location is required.' });
  if (!contractType)       return res.status(400).json({ error: 'contractType is required.' });
  if (!VALID_CONTRACTS.includes(contractType)) {
    return res.status(400).json({ error: `contractType must be one of: ${VALID_CONTRACTS.join(', ')}` });
  }

  const job = await JobPost.create({
    managerId:      req.authUser.id,
    venueName:      venueName.trim(),
    position:       position.trim(),
    location:       location.trim(),
    salaryRate:     salaryRate     || '',
    contractType,
    scheduleNeeded: scheduleNeeded || {},
    description:    description    || '',
  });

  res.status(201).json(job);
});

// must come before /api/jobs/:id
app.get('/api/jobs/mine', requireAuth, requireManager, async (req, res) => {
  const jobs = await JobPost.find({ managerId: req.authUser.id }).sort({ createdAt: -1 });
  res.json(jobs);
});

app.get('/api/jobs/:id', async (req, res) => {
  const job = await JobPost.findById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  const [enriched] = await enrichJobs([job]);
  res.json(enriched);
});

app.patch('/api/jobs/:id', requireAuth, requireManager, async (req, res) => {
  const job = await JobPost.findById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  if (job.managerId !== req.authUser.id) return res.status(403).json({ error: 'Forbidden.' });

  const { managerId: _m, id: _id, createdAt: _c, ...updates } = req.body;
  if (updates.contractType && !VALID_CONTRACTS.includes(updates.contractType)) {
    return res.status(400).json({ error: `contractType must be one of: ${VALID_CONTRACTS.join(', ')}` });
  }

  Object.assign(job, updates);
  await job.save();
  res.json(job.toJSON());
});

app.delete('/api/jobs/:id', requireAuth, requireManager, async (req, res) => {
  const job = await JobPost.findById(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  if (job.managerId !== req.authUser.id) return res.status(403).json({ error: 'Forbidden.' });
  await job.deleteOne();
  res.json({ ok: true });
});

// ── AVAILABILITY POSTS ────────────────────────────────────────

app.get('/api/availability/me', requireAuth, requireBackpacker, async (req, res) => {
  const card = await AvailabilityPost.findOne({ backpackerId: req.authUser.id });
  if (!card) return res.status(404).json({ error: 'No availability card yet.' });
  res.json(card);
});

app.post('/api/availability', requireAuth, requireBackpacker, async (req, res) => {
  const u = req.authUser;
  const existing = await AvailabilityPost.findOne({ backpackerId: u.id });

  const verifiedExperienceCount = await SwapRequest.countDocuments({
    backpackerId: u.id,
    status: 'completed',
  });

  const {
    visaStatus, languages, currentCity, targetCity,
    arrivalDate, availabilityGrid, isActive, introVideoUrl,
  } = req.body;

  const cardData = {
    backpackerId:     u.id,
    visaStatus:       visaStatus    ?? existing?.visaStatus    ?? u.visaType    ?? '',
    languages:        languages     ?? existing?.languages     ?? u.languages   ?? [],
    currentCity:      currentCity   ?? existing?.currentCity   ?? u.currentCity ?? '',
    targetCity:       targetCity    ?? existing?.targetCity    ?? u.targetCity  ?? '',
    arrivalDate:      arrivalDate   ?? existing?.arrivalDate   ?? '',
    availabilityGrid: availabilityGrid ?? existing?.availabilityGrid ?? u.availability ?? {},
    isActive:         isActive !== undefined ? Boolean(isActive) : (existing?.isActive ?? true),
    introVideoUrl:    introVideoUrl ?? existing?.introVideoUrl ?? u.videoUrl    ?? '',
    verifiedExperienceCount,
  };

  if (existing) {
    Object.assign(existing, cardData);
    await existing.save();
    return res.status(200).json(existing.toJSON());
  }
  const card = await AvailabilityPost.create(cardData);
  res.status(201).json(card.toJSON());
});

// ── TALENTS ───────────────────────────────────────────────────

app.get('/api/talents', requireAuth, requireManager, async (req, res) => {
  const filterCity = ((req.query.city || req.authUser.city || '')).toLowerCase().trim();
  const sort  = req.query.sort  || 'arrival';
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);

  let talents = await AvailabilityPost.find({ isActive: true });

  if (filterCity) {
    talents = talents.filter(a =>
      (a.currentCity || '').toLowerCase().includes(filterCity) ||
      (a.targetCity  || '').toLowerCase().includes(filterCity)
    );
  }

  const bpIds = talents.map(a => a.backpackerId);
  const completedAgg = await SwapRequest.aggregate([
    { $match: { backpackerId: { $in: bpIds }, status: 'completed' } },
    { $group: { _id: '$backpackerId', count: { $sum: 1 } } },
  ]);
  const completedByBP = Object.fromEntries(completedAgg.map(r => [r._id, r.count]));

  if (sort === 'experience') {
    talents.sort((a, b) => (completedByBP[b.backpackerId] || 0) - (completedByBP[a.backpackerId] || 0));
  } else {
    talents.sort((a, b) => {
      const dA = a.arrivalDate ? new Date(a.arrivalDate).getTime() : Infinity;
      const dB = b.arrivalDate ? new Date(b.arrivalDate).getTime() : Infinity;
      if (dA !== dB) return dA - dB;
      return (completedByBP[b.backpackerId] || 0) - (completedByBP[a.backpackerId] || 0);
    });
  }

  const paged = talents.slice(0, limit);
  const users = await User.find({ _id: { $in: paged.map(a => a.backpackerId) } }).select('-password');
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.toJSON()]));

  const enriched = paged.map(card => {
    const c = card.toJSON();
    const backpacker = userMap[c.backpackerId];
    if (!backpacker) return null;
    return { ...c, verifiedExperienceCount: completedByBP[c.backpackerId] || 0, backpacker };
  }).filter(Boolean);

  res.json(enriched);
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
  const [
    totalUsers, backpackers, managers, positions, requests,
    jobPosts, activeJobPosts, availabilityCards, activeAvailability,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'backpacker' }),
    User.countDocuments({ role: 'manager' }),
    Position.countDocuments(),
    SwapRequest.countDocuments(),
    JobPost.countDocuments(),
    JobPost.countDocuments({ status: 'active' }),
    AvailabilityPost.countDocuments(),
    AvailabilityPost.countDocuments({ isActive: true }),
  ]);
  res.json({ totalUsers, backpackers, managers, positions, requests, jobPosts, activeJobPosts, availabilityCards, activeAvailability });
});

// ── STATIC FILES (production) ─────────────────────────────────
if (IS_PROD) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.use((req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀  Pairgo API  →  http://localhost:${PORT}`);
  if (!IS_PROD) console.log(`⚠️   JWT_SECRET: using dev default — set JWT_SECRET env var in production\n`);
});
