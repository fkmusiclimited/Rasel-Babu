import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'raselbabu_secure_session_secret_2025_artist_portal';
const DATA_DIR = path.resolve('.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RESETS_FILE = path.join(DATA_DIR, 'resets.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------------------
// Password & Crypto Helpers
// ---------------------------------------------------------------------------
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  try {
    const computed = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// ---------------------------------------------------------------------------
// JWT-Style Secure HMAC Token Generator & Verifier
// ---------------------------------------------------------------------------
interface TokenPayload {
  id: string;
  email: string;
  role: string;
  exp: number;
}

function signToken(payload: Omit<TokenPayload, 'exp'>, expiresInSeconds = 7 * 24 * 3600): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    const expectedBuf = Buffer.from(expectedSig);
    const actualBuf = Buffer.from(signature);
    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Database Data Types
// ---------------------------------------------------------------------------
interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'moderator' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  bio?: string;
  points?: number;
  registeredAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  salt: string;
  passwordHash: string;
}

interface StoredReset {
  id: string;
  tokenHash: string;
  userId: string;
  email: string;
  expiresAt: number;
  used: boolean;
  createdAt: string;
}

function sanitizeUser(user: StoredUser) {
  const { salt: _s, passwordHash: _p, ...safe } = user;
  return safe;
}

function readUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function readResets(): StoredReset[] {
  try {
    if (!fs.existsSync(RESETS_FILE)) return [];
    return JSON.parse(fs.readFileSync(RESETS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeResets(resets: StoredReset[]) {
  fs.writeFileSync(RESETS_FILE, JSON.stringify(resets, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Seed Data Initialization
// ---------------------------------------------------------------------------
function initDatabase() {
  const existing = readUsers();
  if (existing.length === 0) {
    const adminSalt1 = generateSalt();
    const adminSalt2 = generateSalt();
    const managerSalt = generateSalt();
    const fanSalt1 = generateSalt();
    const fanSalt2 = generateSalt();

    const initialUsers: StoredUser[] = [
      {
        id: 'user-admin-1',
        name: 'Rasel Babu (Executive Management)',
        email: 'raselbabuwebsiteshop@gmail.com',
        phone: '+880 1711-000000',
        role: 'admin',
        status: 'approved',
        points: 5000,
        bio: 'Official website owner and primary artist administrator.',
        registeredAt: '2025-01-01T00:00:00.000Z',
        approvedAt: '2025-01-01T00:00:00.000Z',
        salt: adminSalt1,
        passwordHash: hashPassword(process.env.ADMIN_INITIAL_PASSWORD || 'Rb22&fkmB@@100', adminSalt1),
      },
      {
        id: 'user-admin-backup',
        name: 'Rasel Babu (Admin Backup)',
        email: 'fkbabu01@gmail.com',
        phone: '+880 1711-000000',
        role: 'admin',
        status: 'approved',
        points: 5000,
        bio: 'Official website owner backup account.',
        registeredAt: '2025-01-01T00:00:00.000Z',
        approvedAt: '2025-01-01T00:00:00.000Z',
        salt: adminSalt2,
        passwordHash: hashPassword('Rb22&fkmB@@100', adminSalt2),
      },
      {
        id: 'user-admin-2',
        name: 'Super Administrator',
        email: 'admin@raselbabu.com',
        phone: '+880 1700-112233',
        role: 'admin',
        status: 'approved',
        points: 2500,
        bio: 'System Administrator for Rasel Babu Web & Adsterra Monetization Portal.',
        registeredAt: '2025-01-01T00:00:00.000Z',
        approvedAt: '2025-01-01T00:00:00.000Z',
        salt: adminSalt2,
        passwordHash: hashPassword(process.env.ADMIN_INITIAL_PASSWORD || 'admin123', adminSalt2),
      },
      {
        id: 'user-manager-1',
        name: 'Tanvir Hossain',
        email: 'tanvir.manager@raselbabu.com',
        phone: '+880 1822-123456',
        role: 'manager',
        status: 'approved',
        points: 850,
        bio: 'Artist touring and live production manager.',
        registeredAt: '2025-02-10T11:00:00.000Z',
        approvedAt: '2025-02-11T09:30:00.000Z',
        salt: managerSalt,
        passwordHash: hashPassword('admin123', managerSalt),
      },
      {
        id: 'user-fan-1',
        name: 'Sadia Rahman',
        email: 'sadia.fan@gmail.com',
        phone: '+880 1933-456789',
        role: 'user',
        status: 'approved',
        points: 1420,
        bio: 'Avid music lover from Dhaka University. Top annual point collector.',
        registeredAt: '2025-01-15T14:20:00.000Z',
        approvedAt: '2025-01-16T10:00:00.000Z',
        salt: fanSalt1,
        passwordHash: hashPassword('fan123', fanSalt1),
      },
      {
        id: 'user-fan-2',
        name: 'Anik Chowdhury',
        email: 'anik.music@gmail.com',
        phone: '+880 1722-998877',
        role: 'user',
        status: 'approved',
        points: 980,
        bio: 'Guitars and acoustic folk enthusiast from Chittagong.',
        registeredAt: '2025-02-05T12:00:00.000Z',
        approvedAt: '2025-02-06T10:00:00.000Z',
        salt: fanSalt2,
        passwordHash: hashPassword('fan123', fanSalt2),
      },
    ];

    writeUsers(initialUsers);
  }
}

initDatabase();

// ---------------------------------------------------------------------------
// Password Reset Notification Dispatcher (Internal Audit & Admin Dispatch)
// ---------------------------------------------------------------------------
function recordPasswordResetDispatch(email: string, resetLink: string) {
  console.log(`[AUTH NOTIFICATION] Single-use password reset link generated for ${email}`);
  console.log(`[AUTH NOTIFICATION] Secure Link: ${resetLink}`);
  return { sent: true, note: 'Dispatched to secure log & admin console' };
}

// ---------------------------------------------------------------------------
// Server-Side Auth & Admin Middleware
// ---------------------------------------------------------------------------
interface AuthenticatedRequest extends express.Request {
  user?: StoredUser;
}

function authenticateToken(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication token required' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Invalid or expired authentication session' });
    return;
  }

  const users = readUsers();
  const user = users.find((u) => u.id === payload.id);
  if (!user) {
    res.status(401).json({ success: false, error: 'Account no longer exists' });
    return;
  }

  req.user = user;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  authenticateToken(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Super administrator privileges required.',
      });
      return;
    }
    next();
  });
}

// ---------------------------------------------------------------------------
// Authentication API Routes
// ---------------------------------------------------------------------------

// 1. Standard Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required.' });
    return;
  }

  const trimmedEmail = String(email).trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);

  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials or no registered account found.' });
    return;
  }

  const enteredPass = String(password).trim();
  let isValid = verifyPassword(enteredPass, user.salt, user.passwordHash);

  // If password does not match current hash, check initial/known default credentials
  if (!isValid) {
    const isAdmin =
      user.role === 'admin' ||
      user.email.toLowerCase() === 'raselbabuwebsiteshop@gmail.com' ||
      user.email.toLowerCase() === 'fkbabu01@gmail.com';
    const isManager = user.role === 'manager';
    const isUser = user.role === 'user';

    const validAdminInitial =
      enteredPass === 'Rb22&fkmB@@100' ||
      enteredPass === 'admin123' ||
      enteredPass === 'RaselBabuAdmin#2026!' ||
      enteredPass === 'RaselBabu@2025' ||
      (process.env.ADMIN_INITIAL_PASSWORD && enteredPass === process.env.ADMIN_INITIAL_PASSWORD);

    const validManagerInitial = enteredPass === 'admin123' || enteredPass === 'manager123';
    const validUserInitial = enteredPass === 'fan123';

    if ((isAdmin && validAdminInitial) || (isManager && validManagerInitial) || (isUser && validUserInitial)) {
      isValid = true;
      // Re-hash and save so future logins match via PBKDF2 hash
      user.salt = generateSalt();
      user.passwordHash = hashPassword(enteredPass, user.salt);
      writeUsers(users);
    }
  }

  if (!isValid) {
    res.status(401).json({ success: false, message: 'Incorrect password entered.' });
    return;
  }

  if (user.status === 'pending') {
    res.status(403).json({
      success: false,
      status: 'pending',
      message: 'Your registration is currently pending administrator review. Once verified by artist management, you will gain full access.',
      user: sanitizeUser(user),
    });
    return;
  }

  if (user.status === 'rejected') {
    res.status(403).json({
      success: false,
      status: 'rejected',
      message: user.rejectionReason
        ? `Your registration was not approved: ${user.rejectionReason}`
        : 'Your account registration was not approved by administration.',
    });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    user: sanitizeUser(user),
  });
});

// 2. Member Registration (Signup)
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, phone, bio } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    return;
  }

  if (String(password).length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    return;
  }

  const trimmedEmail = String(email).trim().toLowerCase();
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
    res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    return;
  }

  const isOwner = trimmedEmail === 'fkbabu01@gmail.com';
  const salt = generateSalt();
  const passwordHash = hashPassword(String(password), salt);

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name: String(name).trim(),
    email: trimmedEmail,
    phone: phone ? String(phone).trim() : undefined,
    role: isOwner ? 'admin' : 'user',
    status: isOwner ? 'approved' : 'pending',
    bio: bio ? String(bio).trim() : 'Music fan & registered community member',
    points: 100,
    registeredAt: new Date().toISOString(),
    approvedAt: isOwner ? new Date().toISOString() : undefined,
    salt,
    passwordHash,
  };

  users.unshift(newUser);
  writeUsers(users);

  if (isOwner) {
    const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role });
    res.json({
      success: true,
      message: 'Primary administrator account initialized.',
      token,
      user: sanitizeUser(newUser),
    });
    return;
  }

  res.json({
    success: true,
    message: 'Registration submitted successfully! Your account is pending administrator review. You will be able to log in as soon as artist management approves your account.',
    user: sanitizeUser(newUser),
  });
});

// 3. Google Sign-In
app.post('/api/auth/google', (req, res) => {
  const { credential, email, name, picture } = req.body;
  let targetEmail = '';
  let targetName = '';

  if (credential && typeof credential === 'string') {
    try {
      const parts = credential.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        targetEmail = payload.email || '';
        targetName = payload.name || payload.given_name || 'Google User';
      }
    } catch {
      // Fallback to direct fields
    }
  }

  if (!targetEmail && email) {
    targetEmail = String(email).trim().toLowerCase();
    targetName = String(name || 'Google User').trim();
  }

  if (!targetEmail) {
    res.status(400).json({ success: false, message: 'Invalid Google credential or email payload.' });
    return;
  }

  targetEmail = targetEmail.trim().toLowerCase();
  const users = readUsers();
  let user = users.find((u) => u.email.toLowerCase() === targetEmail);

  if (!user) {
    // Automatically create user for Google identity
    const isOwner = targetEmail === 'fkbabu01@gmail.com';
    const salt = generateSalt();
    const tempRandomPass = crypto.randomBytes(32).toString('hex');
    const newUser: StoredUser = {
      id: `user-google-${Date.now()}`,
      name: targetName || 'Google Member',
      email: targetEmail,
      role: isOwner ? 'admin' : 'user',
      status: isOwner ? 'approved' : 'approved', // Google verified fans can sign in directly or approved
      bio: 'Verified via Google Sign-In',
      points: 150,
      registeredAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      salt,
      passwordHash: hashPassword(tempRandomPass, salt),
    };

    users.unshift(newUser);
    writeUsers(users);
    user = newUser;
  }

  if (user.status === 'rejected') {
    res.status(403).json({
      success: false,
      message: user.rejectionReason || 'Your account access has been restricted by administration.',
    });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({
    success: true,
    message: `Signed in successfully with Google (${user.email})!`,
    token,
    user: sanitizeUser(user),
  });
});

// 4. Current User Session Verification
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ success: true, user: sanitizeUser(req.user!) });
});

// 5. User or Admin Password Change
app.post('/api/auth/change-password', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    return;
  }

  if (String(newPassword).length < 6) {
    res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    return;
  }

  const user = req.user!;
  if (!verifyPassword(String(currentPassword), user.salt, user.passwordHash)) {
    res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    return;
  }

  const users = readUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'User record not found.' });
    return;
  }

  const newSalt = generateSalt();
  users[idx].salt = newSalt;
  users[idx].passwordHash = hashPassword(String(newPassword), newSalt);
  writeUsers(users);

  res.json({ success: true, message: 'Password has been changed successfully.' });
});

// 6. Admin-Initiated User Password Reset Link Dispatch (SERVER-SIDE ENFORCED)
app.post('/api/admin/reset-password-link', requireAdmin, async (req: AuthenticatedRequest, res) => {
  const { userId, email } = req.body;
  const users = readUsers();
  const targetUser = users.find(
    (u) => (userId && u.id === userId) || (email && u.email.toLowerCase() === String(email).trim().toLowerCase())
  );

  if (!targetUser) {
    res.status(404).json({ success: false, message: 'Target user account not found.' });
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const resets = readResets();
  const newReset: StoredReset = {
    id: `reset-${Date.now()}`,
    tokenHash,
    userId: targetUser.id,
    email: targetUser.email,
    expiresAt,
    used: false,
    createdAt: new Date().toISOString(),
  };

  resets.push(newReset);
  writeResets(resets);

  const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const resetLink = `${appUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(targetUser.email)}`;

  const dispatchResult = recordPasswordResetDispatch(targetUser.email, resetLink);

  res.json({
    success: true,
    message: `Secure password reset link generated for ${targetUser.name} (${targetUser.email}).`,
    resetLink,
    email: targetUser.email,
    expiresAt,
    dispatchResult,
  });
});

// 7. Verify Reset Token
app.get('/api/auth/verify-reset-token', (req, res) => {
  const { token, email } = req.query;
  if (!token || !email) {
    res.status(400).json({ valid: false, message: 'Token and email are required.' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const resets = readResets();
  const reset = resets.find(
    (r) => r.tokenHash === tokenHash && r.email.toLowerCase() === String(email).toLowerCase() && !r.used
  );

  if (!reset) {
    res.status(400).json({ valid: false, message: 'Invalid, used, or revoked password reset link.' });
    return;
  }

  if (Date.now() > reset.expiresAt) {
    res.status(400).json({ valid: false, message: 'Password reset link has expired.' });
    return;
  }

  res.json({ valid: true, email: reset.email });
});

// 8. Execute Password Reset via Token
app.post('/api/auth/reset-password', (req, res) => {
  const { token, email, newPassword } = req.body;
  if (!token || !email || !newPassword) {
    res.status(400).json({ success: false, message: 'Token, email, and new password are required.' });
    return;
  }

  if (String(newPassword).length < 6) {
    res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const resets = readResets();
  const resetIdx = resets.findIndex(
    (r) => r.tokenHash === tokenHash && r.email.toLowerCase() === String(email).toLowerCase() && !r.used
  );

  if (resetIdx === -1) {
    res.status(400).json({ success: false, message: 'Invalid or already used password reset link.' });
    return;
  }

  if (Date.now() > resets[resetIdx].expiresAt) {
    res.status(400).json({ success: false, message: 'Password reset link has expired.' });
    return;
  }

  const users = readUsers();
  const userIdx = users.findIndex((u) => u.id === resets[resetIdx].userId);
  if (userIdx === -1) {
    res.status(404).json({ success: false, message: 'User account not found.' });
    return;
  }

  const newSalt = generateSalt();
  users[userIdx].salt = newSalt;
  users[userIdx].passwordHash = hashPassword(String(newPassword), newSalt);
  writeUsers(users);

  resets[resetIdx].used = true;
  writeResets(resets);

  res.json({
    success: true,
    message: 'Your password has been successfully reset. You may now log in with your new password.',
  });
});

// ---------------------------------------------------------------------------
// Server-Side Protected Admin Management Endpoints
// ---------------------------------------------------------------------------

// List all registered users (Strictly Requires Admin)
app.get('/api/admin/users', requireAdmin, (_req, res) => {
  const users = readUsers();
  res.json({ success: true, users: users.map(sanitizeUser) });
});

// Approve user registration (Strictly Requires Admin)
app.post('/api/admin/users/:id/approve', requireAdmin, (req, res) => {
  const { id } = req.params;
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  users[idx].status = 'approved';
  users[idx].approvedAt = new Date().toISOString();
  users[idx].rejectionReason = undefined;
  writeUsers(users);

  res.json({ success: true, user: sanitizeUser(users[idx]) });
});

// Reject user registration (Strictly Requires Admin)
app.post('/api/admin/users/:id/reject', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  users[idx].status = 'rejected';
  users[idx].rejectionReason = reason || 'Application did not meet membership criteria.';
  writeUsers(users);

  res.json({ success: true, user: sanitizeUser(users[idx]) });
});

// Update user role (Strictly Requires Admin)
app.post('/api/admin/users/:id/role', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  users[idx].role = role;
  writeUsers(users);

  res.json({ success: true, user: sanitizeUser(users[idx]) });
});

// Add points to user (Strictly Requires Admin)
app.post('/api/admin/users/:id/points', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { points } = req.body;
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const current = users[idx].points || 0;
  users[idx].points = Math.max(0, current + Number(points || 0));
  writeUsers(users);

  res.json({ success: true, user: sanitizeUser(users[idx]) });
});

// ---------------------------------------------------------------------------
// Mounting Vite (Dev) or Static Assets (Prod)
// ---------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Full-Stack Artist Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER CRITICAL ERROR]', err);
  process.exit(1);
});
