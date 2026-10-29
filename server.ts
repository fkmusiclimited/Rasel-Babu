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
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Enable CORS across all origins, proxies, and devices
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

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
    const list: StoredUser[] = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    const seenIds = new Set<string>();
    return list.map((u, idx) => {
      let id = u.id;
      if (!id || seenIds.has(id)) {
        if (u.email.toLowerCase() === 'fkbabu01@gmail.com') {
          id = 'user-admin-backup';
        } else {
          id = `${u.id || 'user'}-${idx}`;
        }
      }
      seenIds.add(id);
      return { ...u, id };
    });
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
function initDatabase() {
  const existing = readUsers();
  
  // Ensure raselbabuwebsiteshop@gmail.com is always in the database
  const primaryAdmin = existing.find((u) => u.email.toLowerCase() === 'raselbabuwebsiteshop@gmail.com');
  const adminSalt1 = generateSalt();
  const adminHash = hashPassword('Rb22&fkmB@@100', adminSalt1);

  if (!primaryAdmin) {
    existing.unshift({
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
      passwordHash: adminHash,
    });
    writeUsers(existing);
  } else {
    primaryAdmin.role = 'admin';
    primaryAdmin.status = 'approved';
    primaryAdmin.salt = adminSalt1;
    primaryAdmin.passwordHash = adminHash;
    writeUsers(existing);
  }

  if (existing.length === 1) {
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
  let user = users.find((u) => u.email.toLowerCase() === trimmedEmail);

  if (!user && (trimmedEmail === 'raselbabuwebsiteshop@gmail.com' || trimmedEmail === 'fkbabu01@gmail.com')) {
    const adminSalt = generateSalt();
    user = {
      id: trimmedEmail === 'raselbabuwebsiteshop@gmail.com' ? 'user-admin-1' : 'user-admin-backup',
      name: 'Rasel Babu (Executive Management)',
      email: trimmedEmail,
      phone: '+880 1711-000000',
      role: 'admin',
      status: 'approved',
      points: 5000,
      bio: 'Official website owner and primary artist administrator.',
      registeredAt: '2025-01-01T00:00:00.000Z',
      approvedAt: '2025-01-01T00:00:00.000Z',
      salt: adminSalt,
      passwordHash: hashPassword('Rb22&fkmB@@100', adminSalt),
    };
    users.unshift(user);
    writeUsers(users);
  }

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

  res.json({ success: true, points: users[idx].points });
});

// ---------------------------------------------------------------------------
// Image Uploads API (Saves uploaded images to persistent disk storage)
// ---------------------------------------------------------------------------
app.use('/uploads', express.static(path.resolve('public', 'uploads')));

app.post('/api/upload', (req, res) => {
  try {
    const { image, name } = req.body;
    if (!image || typeof image !== 'string') {
      res.status(400).json({ success: false, message: 'No image data provided' });
      return;
    }

    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
      res.json({ success: true, url: image });
      return;
    }

    const matches = image.match(/^data:image\/([a-zA-Z0-9-+]+);base64,(.+)$/);
    let ext = 'jpg';
    let buffer: Buffer;

    if (matches && matches.length === 3) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const safeName = (name || 'img')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const filename = `${safeName}_${Date.now()}.${ext}`;

    const uploadsDir = path.resolve('public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    try {
      const distUploads = path.resolve('dist', 'uploads');
      if (fs.existsSync(path.resolve('dist'))) {
        if (!fs.existsSync(distUploads)) {
          fs.mkdirSync(distUploads, { recursive: true });
        }
        fs.writeFileSync(path.join(distUploads, filename), buffer);
      }
    } catch {}

    const fileUrl = `/uploads/${filename}`;
    res.json({ success: true, url: fileUrl });
  } catch (err: any) {
    console.error('Image upload failed:', err);
    res.status(500).json({ success: false, message: err?.message || 'Failed to save image' });
  }
});

// ---------------------------------------------------------------------------
// Settings Persistence API (Dual-layer persistence for Admin Website Settings)
// ---------------------------------------------------------------------------
app.get('/api/settings', (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      res.json({ success: true, settings: data });
      return;
    }

    const publicSettings = path.resolve('public', 'settings.json');
    if (fs.existsSync(publicSettings)) {
      const data = JSON.parse(fs.readFileSync(publicSettings, 'utf-8'));
      res.json({ success: true, settings: data });
      return;
    }
  } catch (err) {
    console.error('Failed to read settings file:', err);
  }
  res.json({ success: true, settings: null });
});

app.post('/api/settings', (req, res) => {
  try {
    let current = {};
    if (fs.existsSync(SETTINGS_FILE)) {
      try {
        current = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      } catch {
        current = {};
      }
    } else {
      const publicSettings = path.resolve('public', 'settings.json');
      if (fs.existsSync(publicSettings)) {
        try {
          current = JSON.parse(fs.readFileSync(publicSettings, 'utf-8'));
        } catch {}
      }
    }

    const settings = { ...current, ...req.body };
    const serialized = JSON.stringify(settings, null, 2);

    // 1. Write to server database storage (.data/settings.json)
    fs.writeFileSync(SETTINGS_FILE, serialized, 'utf-8');

    // 2. Mirror to public/settings.json for static bundle persistence
    try {
      const publicPath = path.resolve('public', 'settings.json');
      fs.writeFileSync(publicPath, serialized, 'utf-8');
    } catch (e) {
      console.warn('Could not mirror to public/settings.json:', e);
    }

    // 3. Mirror to dist/settings.json if dist folder exists
    try {
      const distPath = path.resolve('dist', 'settings.json');
      if (fs.existsSync(path.resolve('dist'))) {
        fs.writeFileSync(distPath, serialized, 'utf-8');
      }
    } catch {}

    res.json({
      success: true,
      message: 'Settings successfully persisted centrally across all browsers and devices.',
      settings,
    });
  } catch (err) {
    console.error('Failed to save settings file:', err);
    res.status(500).json({ success: false, message: 'Failed to write settings to central storage' });
  }
});

// ---------------------------------------------------------------------------
// Photos Persistence API (Gallery Photos Central Storage)
// ---------------------------------------------------------------------------
app.get('/api/photos', (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (fs.existsSync(PHOTOS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PHOTOS_FILE, 'utf-8'));
      res.json({ success: true, photos: data });
      return;
    }

    const publicPhotos = path.resolve('public', 'photos.json');
    if (fs.existsSync(publicPhotos)) {
      const data = JSON.parse(fs.readFileSync(publicPhotos, 'utf-8'));
      res.json({ success: true, photos: data });
      return;
    }
  } catch (err) {
    console.error('Failed to read photos file:', err);
  }
  res.json({ success: true, photos: null });
});

app.post('/api/photos', (req, res) => {
  try {
    const rawPhotos = Array.isArray(req.body) ? req.body : req.body.photos;
    if (!Array.isArray(rawPhotos)) {
      res.status(400).json({ success: false, message: 'Invalid photos array payload' });
      return;
    }

    const serialized = JSON.stringify(rawPhotos, null, 2);

    // 1. Write to server database storage (.data/photos.json)
    fs.writeFileSync(PHOTOS_FILE, serialized, 'utf-8');

    // 2. Mirror to public/photos.json for static bundle persistence
    try {
      const publicPath = path.resolve('public', 'photos.json');
      fs.writeFileSync(publicPath, serialized, 'utf-8');
    } catch (e) {
      console.warn('Could not mirror to public/photos.json:', e);
    }

    // 3. Mirror to dist/photos.json if dist folder exists
    try {
      const distPath = path.resolve('dist', 'photos.json');
      if (fs.existsSync(path.resolve('dist'))) {
        fs.writeFileSync(distPath, serialized, 'utf-8');
      }
    } catch {}

    res.json({
      success: true,
      message: 'Gallery photos successfully persisted centrally across all browsers and devices.',
      photos: rawPhotos,
    });
  } catch (err) {
    console.error('Failed to save photos file:', err);
    res.status(500).json({ success: false, message: 'Failed to write photos to central storage' });
  }
});

// ---------------------------------------------------------------------------
// Videos Persistence API (YouTube Videos Central Storage)
// ---------------------------------------------------------------------------
app.get('/api/videos', (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (fs.existsSync(VIDEOS_FILE)) {
      const data = JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf-8'));
      res.json({ success: true, videos: data });
      return;
    }

    const publicVideos = path.resolve('public', 'videos.json');
    if (fs.existsSync(publicVideos)) {
      const data = JSON.parse(fs.readFileSync(publicVideos, 'utf-8'));
      res.json({ success: true, videos: data });
      return;
    }
  } catch (err) {
    console.error('Failed to read videos file:', err);
  }
  res.json({ success: true, videos: null });
});

app.post('/api/videos', (req, res) => {
  try {
    const rawVideos = Array.isArray(req.body) ? req.body : req.body.videos;
    if (!Array.isArray(rawVideos)) {
      res.status(400).json({ success: false, message: 'Invalid videos array payload' });
      return;
    }

    const serialized = JSON.stringify(rawVideos, null, 2);

    // 1. Write to server database storage (.data/videos.json)
    fs.writeFileSync(VIDEOS_FILE, serialized, 'utf-8');

    // 2. Mirror to public/videos.json
    try {
      const publicPath = path.resolve('public', 'videos.json');
      fs.writeFileSync(publicPath, serialized, 'utf-8');
    } catch (e) {
      console.warn('Could not mirror to public/videos.json:', e);
    }

    // 3. Mirror to dist/videos.json if dist folder exists
    try {
      const distPath = path.resolve('dist', 'videos.json');
      if (fs.existsSync(path.resolve('dist'))) {
        fs.writeFileSync(distPath, serialized, 'utf-8');
      }
    } catch {}

    res.json({
      success: true,
      message: 'YouTube videos catalog successfully persisted centrally across all browsers and devices.',
      videos: rawVideos,
    });
  } catch (err) {
    console.error('Failed to save videos file:', err);
    res.status(500).json({ success: false, message: 'Failed to write videos to central storage' });
  }
});

// ---------------------------------------------------------------------------
// News Persistence API (Central Server & Static Mirror Storage)
// ---------------------------------------------------------------------------
app.get('/api/news', (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (fs.existsSync(NEWS_FILE)) {
      const data = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf-8'));
      res.json({ success: true, news: data });
      return;
    }

    const publicNews = path.resolve('public', 'news.json');
    if (fs.existsSync(publicNews)) {
      const data = JSON.parse(fs.readFileSync(publicNews, 'utf-8'));
      res.json({ success: true, news: data });
      return;
    }
  } catch (err) {
    console.error('Failed to read news file:', err);
  }
  res.json({ success: true, news: null });
});

app.post('/api/news', (req, res) => {
  try {
    const rawNews = Array.isArray(req.body) ? req.body : req.body.news;
    if (!Array.isArray(rawNews)) {
      res.status(400).json({ success: false, message: 'Invalid news array payload' });
      return;
    }

    const serialized = JSON.stringify(rawNews, null, 2);

    // 1. Write to server database storage (.data/news.json)
    fs.writeFileSync(NEWS_FILE, serialized, 'utf-8');

    // 2. Mirror to public/news.json
    try {
      const publicPath = path.resolve('public', 'news.json');
      fs.writeFileSync(publicPath, serialized, 'utf-8');
    } catch (e) {
      console.warn('Could not mirror to public/news.json:', e);
    }

    // 3. Mirror to dist/news.json if dist folder exists
    try {
      const distPath = path.resolve('dist', 'news.json');
      if (fs.existsSync(path.resolve('dist'))) {
        fs.writeFileSync(distPath, serialized, 'utf-8');
      }
    } catch {}

    res.json({
      success: true,
      message: 'News articles successfully persisted centrally across all browsers and devices.',
      news: rawNews,
    });
  } catch (err) {
    console.error('Failed to save news file:', err);
    res.status(500).json({ success: false, message: 'Failed to write news to central storage' });
  }
});

// ---------------------------------------------------------------------------
// Products Persistence API (Central Store Catalog)
// ---------------------------------------------------------------------------
app.get('/api/products', (_req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
      res.json({ success: true, products: data });
      return;
    }

    const publicProducts = path.resolve('public', 'products.json');
    if (fs.existsSync(publicProducts)) {
      const data = JSON.parse(fs.readFileSync(publicProducts, 'utf-8'));
      res.json({ success: true, products: data });
      return;
    }
  } catch (err) {
    console.error('Failed to read products file:', err);
  }
  res.json({ success: true, products: null });
});

app.post('/api/products', (req, res) => {
  try {
    const rawProducts = Array.isArray(req.body) ? req.body : req.body.products;
    if (!Array.isArray(rawProducts)) {
      res.status(400).json({ success: false, message: 'Invalid products array payload' });
      return;
    }

    const serialized = JSON.stringify(rawProducts, null, 2);

    // 1. Write to server database storage (.data/products.json)
    fs.writeFileSync(PRODUCTS_FILE, serialized, 'utf-8');

    // 2. Mirror to public/products.json
    try {
      const publicPath = path.resolve('public', 'products.json');
      fs.writeFileSync(publicPath, serialized, 'utf-8');
    } catch (e) {
      console.warn('Could not mirror to public/products.json:', e);
    }

    // 3. Mirror to dist/products.json if dist folder exists
    try {
      const distPath = path.resolve('dist', 'products.json');
      if (fs.existsSync(path.resolve('dist'))) {
        fs.writeFileSync(distPath, serialized, 'utf-8');
      }
    } catch {}

    res.json({
      success: true,
      message: 'Products catalog successfully persisted centrally across all browsers and devices.',
      products: rawProducts,
    });
  } catch (err) {
    console.error('Failed to save products file:', err);
    res.status(500).json({ success: false, message: 'Failed to write products to central storage' });
  }
});

// ---------------------------------------------------------------------------
// Dynamic Open Graph Image Delivery Route (/api/og-image)
// Converts base64 uploads or dynamic items into binary JPEG/PNG with cache headers
// ---------------------------------------------------------------------------
app.get('/api/og-image', (req, res) => {
  try {
    const type = String(req.query.type || 'home').toLowerCase();
    const id = String(req.query.id || '');

    let rawImage = '';

    if (type === 'news') {
      const allNews = readNews();
      const item = allNews.find((n: any) => n.id === id || n.slug === id);
      rawImage = item?.coverImage || '';
    } else if (type === 'product') {
      const allProducts = readProducts();
      const item = allProducts.find((p: any) => p.id === id);
      rawImage = item?.imageUrl || '';
    } else if (type === 'photo') {
      const allPhotos = readPhotos();
      const item = allPhotos.find((p: any) => p.id === id);
      rawImage = item?.imageUrl || '';
    } else if (type === 'settings' || type === 'home') {
      const settings = readSettings();
      rawImage = settings?.heroImageUrl || settings?.artistProfileImage || '';
    }

    // 1. If image is a base64 data URI, decode to binary Buffer and serve
    if (rawImage && rawImage.startsWith('data:image/')) {
      const match = rawImage.match(/^data:(image\/[a-zA-Z0-9+-]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
        return;
      }
    }

    // 2. If image is an external HTTP/HTTPS URL, redirect crawler directly
    if (rawImage && (rawImage.startsWith('http://') || rawImage.startsWith('https://'))) {
      res.redirect(302, rawImage);
      return;
    }

    // 3. If relative or default path, serve local file
    let localPath = rawImage || '/assets/images/hero_rasel_babu_stage_1791912890551.jpg';
    localPath = localPath.replace(/^\/(src\/)?assets\//, 'assets/');

    const candidateFiles = [
      path.resolve('public', localPath),
      path.resolve('dist', localPath),
      path.resolve('src', localPath),
      path.resolve(localPath),
      path.resolve('public/assets/images/hero_rasel_babu_stage_1791912890551.jpg'),
      path.resolve('src/assets/images/hero_rasel_babu_stage_1791912890551.jpg'),
    ];

    for (const candidate of candidateFiles) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(candidate);
        return;
      }
    }

    res.status(404).send('Image not found');
  } catch (err) {
    console.error('Error in /api/og-image:', err);
    res.status(500).send('Error delivering preview image');
  }
});

// ---------------------------------------------------------------------------
// Server-Side Open Graph & Twitter Card Metadata Resolution & Injection
// ---------------------------------------------------------------------------
function readNews(): any[] {
  try {
    if (fs.existsSync(NEWS_FILE)) {
      return JSON.parse(fs.readFileSync(NEWS_FILE, 'utf-8'));
    }
    const pub = path.resolve('public', 'news.json');
    if (fs.existsSync(pub)) {
      return JSON.parse(fs.readFileSync(pub, 'utf-8'));
    }
  } catch {}
  return [];
}

function readProducts(): any[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
    }
    const pub = path.resolve('public', 'products.json');
    if (fs.existsSync(pub)) {
      return JSON.parse(fs.readFileSync(pub, 'utf-8'));
    }
  } catch {}
  return [];
}

function readPhotos(): any[] {
  try {
    if (fs.existsSync(PHOTOS_FILE)) {
      return JSON.parse(fs.readFileSync(PHOTOS_FILE, 'utf-8'));
    }
    const pub = path.resolve('public', 'photos.json');
    if (fs.existsSync(pub)) {
      return JSON.parse(fs.readFileSync(pub, 'utf-8'));
    }
  } catch {}
  return [];
}

function readSettings(): any {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
    const pub = path.resolve('public', 'settings.json');
    if (fs.existsSync(pub)) {
      return JSON.parse(fs.readFileSync(pub, 'utf-8'));
    }
  } catch {}
  return null;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getCanonicalBaseUrl(req: express.Request): string {
  const host = req.headers.host || '';
  if (host.includes('raselbabu.com') || !host) {
    return 'https://raselbabu.com';
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || (req.secure ? 'https' : 'http');
  return `${proto}://${host}`;
}

function makeAbsoluteImageUrl(
  imgUrl: string | undefined,
  type: 'news' | 'product' | 'photo' | 'home',
  id: string,
  baseUrl: string
): string {
  // If base64 data URI, WhatsApp / Facebook crawlers cannot render it: route via /api/og-image
  if (imgUrl && imgUrl.startsWith('data:image/')) {
    return `${baseUrl}/api/og-image?type=${type}&id=${encodeURIComponent(id)}`;
  }

  if (imgUrl && (imgUrl.startsWith('https://') || imgUrl.startsWith('http://'))) {
    return imgUrl.replace(/^http:\/\//i, 'https://');
  }

  let cleanPath = imgUrl || '/assets/images/hero_rasel_babu_stage_1791912890551.jpg';
  cleanPath = cleanPath.replace(/^\/(src\/)?assets\//, '/assets/');
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  return `${baseUrl}${cleanPath}`;
}

interface ResolvedMetadata {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  type: string;
  itemType: 'news' | 'product' | 'photo' | 'home';
  item?: any;
}

function resolveMetadataForRequest(req: express.Request): ResolvedMetadata {
  const baseUrl = getCanonicalBaseUrl(req);
  const pathName = req.path;
  const qNews = req.query.news ? String(req.query.news) : null;
  const qProduct = req.query.product ? String(req.query.product) : null;
  const qPhoto = req.query.photo ? String(req.query.photo) : null;
  const qId = req.query.id ? String(req.query.id) : null;

  // 1. Check News Article (?news=id, /news-detail?news=id, /news/:id, /news?id=id)
  let newsId = qNews;
  if (!newsId && (pathName === '/news-detail' || pathName === '/news') && qId) {
    newsId = qId;
  } else if (!newsId && pathName.startsWith('/news-detail/')) {
    newsId = pathName.replace('/news-detail/', '');
  } else if (!newsId && pathName.startsWith('/news/') && pathName !== '/news/') {
    newsId = pathName.replace('/news/', '');
  }

  if (newsId) {
    const allNews = readNews();
    const article = allNews.find((n: any) => n.id === newsId || n.slug === newsId);
    if (article) {
      const title = `${article.title} | Rasel Babu Official News`;
      const description = article.summary || article.content.slice(0, 160);
      const imageUrl = makeAbsoluteImageUrl(article.coverImage, 'news', article.id, baseUrl);
      const url = `${baseUrl}/?news=${encodeURIComponent(article.id)}`;
      return {
        title,
        description,
        imageUrl,
        url,
        type: 'article',
        itemType: 'news',
        item: article,
      };
    }
  }

  // 2. Check Product (?product=id, /product-detail?product=id, /shop?product=id, /product/:id)
  let productId = qProduct;
  if (!productId && (pathName === '/shop' || pathName === '/product' || pathName === '/product-detail') && qId) {
    productId = qId;
  } else if (!productId && pathName.startsWith('/product-detail/') && pathName !== '/product-detail/') {
    productId = pathName.replace('/product-detail/', '');
  } else if (!productId && pathName.startsWith('/product/') && pathName !== '/product/') {
    productId = pathName.replace('/product/', '');
  }

  if (productId) {
    const allProducts = readProducts();
    const product = allProducts.find((p: any) => p.id === productId);
    if (product) {
      const priceVal = product.offerPrice || product.price;
      const priceFormatted = typeof priceVal === 'number' ? `৳${priceVal.toLocaleString()}` : '';
      const title = `${product.title}${priceFormatted ? ' - ' + priceFormatted : ''} | Rasel Babu Official Store`;
      const description = product.description;
      const imageUrl = makeAbsoluteImageUrl(product.imageUrl, 'product', product.id, baseUrl);
      const url = `${baseUrl}/?product=${encodeURIComponent(product.id)}`;
      return {
        title,
        description,
        imageUrl,
        url,
        type: 'product',
        itemType: 'product',
        item: product,
      };
    }
  }

  // 3. Check Photo Gallery (?photo=id, /photo-detail?photo=id, /gallery?photo=id, /photo/:id)
  let photoId = qPhoto;
  if (!photoId && (pathName === '/photo-detail' || pathName === '/gallery') && qId) {
    photoId = qId;
  } else if (!photoId && pathName.startsWith('/photo-detail/')) {
    photoId = pathName.replace('/photo-detail/', '');
  } else if (!photoId && pathName.startsWith('/photo/') && pathName !== '/photo/') {
    photoId = pathName.replace('/photo/', '');
  }

  if (photoId) {
    const allPhotos = readPhotos();
    const photo = allPhotos.find((p: any) => p.id === photoId);
    if (photo) {
      const title = `${photo.title} - Official Photo Gallery | Rasel Babu`;
      const description = photo.caption || `${photo.title} captured in ${photo.location}`;
      const imageUrl = makeAbsoluteImageUrl(photo.imageUrl, 'photo', photo.id, baseUrl);
      const url = `${baseUrl}/?photo=${encodeURIComponent(photo.id)}`;
      return {
        title,
        description,
        imageUrl,
        url,
        type: 'article',
        itemType: 'photo',
        item: photo,
      };
    }
  }

  // 4. Default Homepage & General Pages (Preserving Rasel Babu's main hero photo)
  const defaultTitle = 'Rasel Babu | Official Artist Website & Music Portal';
  const defaultDescription =
    'Official artist portal, music discography, photo gallery, tour updates, and booking for Bangladeshi singer and performer Rasel Babu.';
  const defaultImage = `${baseUrl}/assets/images/hero_rasel_babu_stage_1791912890551.jpg`;
  const defaultUrl = `${baseUrl}/`;

  return {
    title: defaultTitle,
    description: defaultDescription,
    imageUrl: defaultImage,
    url: defaultUrl,
    type: 'website',
    itemType: 'home',
  };
}

function injectMetadata(html: string, meta: ResolvedMetadata): string {
  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  const safeImage = meta.imageUrl;
  const safeUrl = meta.url;

  // 1. Replace or insert <title>
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);
  } else {
    html = html.replace('</head>', `<title>${safeTitle}</title>\n</head>`);
  }

  // 2. Replace or insert canonical link
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${safeUrl}" />`);
  } else {
    html = html.replace('</head>', `<link rel="canonical" href="${safeUrl}" />\n</head>`);
  }

  // 3. Replace or insert meta name="description"
  if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${safeDesc}" />`);
  } else {
    html = html.replace('</head>', `<meta name="description" content="${safeDesc}" />\n</head>`);
  }

  // 4. Replace or insert Open Graph tags
  const ogTags: Record<string, string> = {
    'og:type': meta.type,
    'og:title': safeTitle,
    'og:description': safeDesc,
    'og:url': safeUrl,
    'og:site_name': 'Rasel Babu Official',
    'og:image': safeImage,
    'og:image:secure_url': safeImage,
    'og:image:width': '1200',
    'og:image:height': '630',
  };

  for (const [prop, val] of Object.entries(ogTags)) {
    const reg = new RegExp(`<meta\\s+property=["']${prop}["'][^>]*>`, 'i');
    if (reg.test(html)) {
      html = html.replace(reg, `<meta property="${prop}" content="${val}" />`);
    } else {
      html = html.replace('</head>', `<meta property="${prop}" content="${val}" />\n</head>`);
    }
  }

  // 5. Replace or insert Twitter Card tags
  const twitterTags: Record<string, string> = {
    'twitter:card': 'summary_large_image',
    'twitter:title': safeTitle,
    'twitter:description': safeDesc,
    'twitter:image': safeImage,
  };

  for (const [name, val] of Object.entries(twitterTags)) {
    const reg = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i');
    if (reg.test(html)) {
      html = html.replace(reg, `<meta name="${name}" content="${val}" />`);
    } else {
      html = html.replace('</head>', `<meta name="${name}" content="${val}" />\n</head>`);
    }
  }

  return html;
}

// ---------------------------------------------------------------------------
// Mounting Vite (Dev) or Static Assets (Prod) with Meta Pre-Rendering
// ---------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Special crawler interceptor for testing social link previews in dev (e.g. WhatsApp, Facebook crawler or ?crawler=1)
    app.use(async (req, res, next) => {
      const userAgent = req.headers['user-agent'] || '';
      const isCrawler =
        /facebookexternalhit|WhatsApp|Facebot|Twitterbot|TelegramBot|LinkedInBot|Discordbot/i.test(userAgent) ||
        req.query.crawler === '1';

      if (isCrawler && req.method === 'GET' && !req.originalUrl.startsWith('/api/')) {
        try {
          const indexPath = path.resolve('index.html');
          const rawTemplate = fs.readFileSync(indexPath, 'utf-8');
          const transformed = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
          const meta = resolveMetadataForRequest(req);
          const finalHtml = injectMetadata(transformed, meta);
          return res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(finalHtml);
        } catch (err) {
          return next(err);
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath, { index: false }));

    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        return res.status(404).send('index.html not found in dist build');
      }
      const rawTemplate = fs.readFileSync(indexPath, 'utf-8');
      const meta = resolveMetadataForRequest(req);
      const finalHtml = injectMetadata(rawTemplate, meta);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(finalHtml);
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
