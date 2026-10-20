import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { protect, signToken } from '../middleware/auth.js';
import { httpError } from '../middleware/errorHandler.js';

const router = Router();

// At most 20 login/sign-up attempts per IP every 15 minutes (stops password guessing)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register  { name, email, password }
router.post('/register', limiter, async (req, res) => {
  const { name = '', email = '', password = '' } = req.body ?? {};
  if (!name.trim()) throw httpError(400, 'Please enter your name.');
  if (!EMAIL.test(email)) throw httpError(400, 'Please enter a valid email.');
  if (password.length < 8) throw httpError(400, 'Password must be at least 8 characters.');

  const exists = await User.exists({ email: email.toLowerCase() });
  if (exists) throw httpError(409, 'An account with this email already exists. Log in instead.');

  const passwordHash = await bcrypt.hash(password, 10); // 10 = salt rounds (cost)
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json({ token: signToken(user.id), user: user.toPublic() });
});

// POST /api/auth/login  { email, password }
router.post('/login', limiter, async (req, res) => {
  const { email = '', password = '' } = req.body ?? {};
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  // Same message for "no such email" and "wrong password", so attackers can't tell which emails exist
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw httpError(401, 'Email or password is wrong.');
  res.json({ token: signToken(user.id), user: user.toPublic() });
});

// GET /api/auth/me  -> who is logged in (used when the page reloads)
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw httpError(401, 'Account not found.');
  res.json({ user: user.toPublic() });
});

export default router;
