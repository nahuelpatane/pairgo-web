import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const DB = path.join(__dirname, 'db.json');

app.use(express.json());

// --- DB helpers ---
const read = () => {
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
  catch { return { users: [], positions: [], requests: [] }; }
};
const write = (db) => fs.writeFileSync(DB, JSON.stringify(db, null, 2));

// --- Avatar helpers (mirrored from frontend) ---
const COLORS = ['#e8654a','#60a5fa','#a78bfa','#34d399','#f472b6','#fbbf24','#6ee7b7','#c084fc'];
const avatarColor = (id = '') => COLORS[id.charCodeAt(id.length - 1) % COLORS.length] || '#e8654a';
const initials = (name = '') => name.trim().split(' ').slice(0, 2).map(w => (w[0] || '').toUpperCase()).join('') || '?';

// ── AUTH ──────────────────────────────────────────────────────

app.post('/api/auth/signup', (req, res) => {
  const db = read();
  const { email, password, ...profile } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos.' });
  if (password.length < 4)  return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres.' });

  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return res.status(400).json({ error: 'Ya existe una cuenta con ese email.' });

  const id = `u_${Date.now()}`;
  const user = {
    id,
    email: email.toLowerCase(),
    password,
    initials: initials(profile.name),
    avatarColor: avatarColor(id),
    ...profile,
  };
  db.users.push(user);
  write(db);

  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = read();

  const user = db.users.find(
    u => u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password
  );
  if (!user) return res.status(401).json({ error: 'Email o contraseña incorrectos.' });

  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

// ── POSITIONS ─────────────────────────────────────────────────

app.get('/api/positions', (_, res) => res.json(read().positions));

app.post('/api/positions', (req, res) => {
  const db = read();
  const pos = { id: `pos_${Date.now()}`, createdAt: Date.now(), status: 'open', ...req.body };
  db.positions.unshift(pos);
  write(db);
  res.json(pos);
});

app.patch('/api/positions/:id', (req, res) => {
  const db = read();
  const i = db.positions.findIndex(p => p.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Not found' });
  db.positions[i] = { ...db.positions[i], ...req.body };
  write(db);
  res.json(db.positions[i]);
});

// ── REQUESTS ──────────────────────────────────────────────────

app.get('/api/requests', (_, res) => res.json(read().requests));

app.post('/api/requests', (req, res) => {
  const db = read();
  const r = { id: `req_${Date.now()}`, createdAt: Date.now(), status: 'pending', rating: null, ...req.body };
  db.requests.unshift(r);
  write(db);
  res.json(r);
});

app.patch('/api/requests/:id', (req, res) => {
  const db = read();
  const i = db.requests.findIndex(r => r.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Not found' });
  db.requests[i] = { ...db.requests[i], ...req.body };
  write(db);
  res.json(db.requests[i]);
});

// ── BACKPACKERS (para el browse del manager) ──────────────────

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

app.patch('/api/users/:id', (req, res) => {
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

// ─────────────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀  Pairgo API  →  http://localhost:${PORT}\n`);
});
