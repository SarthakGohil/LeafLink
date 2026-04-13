const express    = require('express');
const { body, validationResult } = require('express-validator');
const jwt        = require('jsonwebtoken');
const rateLimit  = require('express-rate-limit');
const User       = require('../models/User');
const OTP        = require('../models/Otp');
const { sendOTPEmail } = require('../services/email');

const router = express.Router();

/* ── Rate limiters ───────────────────────────────────────────────────────── */
// Auth routes (login / register): 10 per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests from this IP. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP send / resend: strict — 5 per 15 min (prevent OTP spam)
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP verify: relaxed — 20 per 15 min
// (OTP model already handles brute-force: 3 wrong attempts = OTP invalidated)
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many verification attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── Helper: sign JWT ────────────────────────────────────────────────────── */
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/* ── Validation rules ────────────────────────────────────────────────────── */
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain a number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character.'),
];

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/auth/register
   Step 1: Validate input, create unverified user, send OTP email.
 ──────────────────────────────────────────────────────────────────────────*/
router.post('/register', authLimiter, registerRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password } = req.body;

    // Check if verified user already exists
    const existing = await User.findOne({ email });
    if (existing && existing.isEmailVerified) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    // Remove unverified duplicate if exists
    if (existing && !existing.isEmailVerified) await existing.deleteOne();

    // Create unverified user
    await User.create({ name, email, password, isEmailVerified: false });

    // Generate OTP
    const otp = await OTP.createOTP(email, 'registration');

    // DEV LOG: Print OTP to logs for easy testing on Render
    console.log(`[AUTH] 🌿 OTP for ${email}: ${otp}`);

    // Attempt to send OTP email
    console.log(`[AUTH] Attempting to send email to ${email}...`);
    const emailResult = await sendOTPEmail(email, otp, 'registration');

    if (!emailResult.success) {
      console.warn(`[AUTH] Email failed for ${email} but continuing registration: ${emailResult.message}`);
      // Proceed even if email fails, as we've already logged the OTP for dev/testing.
    }

    res.status(200).json({
      message: emailResult.success 
        ? `OTP sent to ${email}. Please verify to complete registration.`
        : `Registration initiated. (Email service unavailable, check server logs for OTP).`,
      requiresOtp: true,
      email
    });
  } catch (err) {
    console.error('[AUTH] Register error:', err);
    res.status(500).json({ error: `Server Error: ${err.message}` });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/auth/verify-otp
   Step 2: Verify OTP, activate account, return JWT.
 ──────────────────────────────────────────────────────────────────────────*/
router.post('/verify-otp', otpVerifyLimiter, async (req, res) => {
  try {
    const { email, otp, type = 'registration' } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

    const result = await OTP.verifyOTP(email, otp.toString(), type);
    if (!result.valid) return res.status(400).json({ error: result.reason });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Mark email as verified
    user.isEmailVerified = true;
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    res.json({
      message: 'Email verified! Welcome to LeafLink.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: true },
    });
  } catch (err) {
    console.error('OTP verify error:', err.message);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/auth/resend-otp
   Resend OTP (rate-limited).
 ──────────────────────────────────────────────────────────────────────────*/
router.post('/resend-otp', otpSendLimiter, async (req, res) => {
  try {
    const { email, type = 'registration' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account with this email.' });

    const otp = await OTP.createOTP(email, type);
    
    // DEV LOG: Print OTP to logs for easy testing on Render
    console.log(`[AUTH] 🌿 Resending OTP for ${email}: ${otp}`);

    // Attempt to send OTP email
    console.log(`[AUTH] Resending email to ${email}...`);
    const emailResult = await sendOTPEmail(email, otp, type);

    if (emailResult.success) {
      res.json({ message: 'New OTP sent to your email.' });
    } else {
      console.warn(`[AUTH] Resend failed for ${email} but continuing for testing: ${emailResult.message}`);
      return res.status(200).json({ 
        message: 'Resend initiated. (Email service unavailable, check server logs for OTP).' 
      });
    }
  } catch (err) {
    console.error('[AUTH] Resend OTP error:', err);
    res.status(500).json({ error: `Server Error: ${err.message}` });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/auth/login
   Login with email + password. Account lockout after 5 failed attempts.
 ──────────────────────────────────────────────────────────────────────────*/
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid email or password.' });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    // Check lockout
    if (user.isLocked) {
      const unlockAt = new Date(user.lockUntil).toLocaleTimeString();
      return res.status(423).json({ error: `Account locked due to multiple failed attempts. Try again after ${unlockAt}.` });
    }

    // Check email verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Email not verified. Please check your inbox.', requiresOtp: true, email });
    }

    const isCorrect = await user.comparePassword(password);
    if (!isCorrect) {
      await user.incLoginAttempts();
      const remaining = Math.max(0, 5 - (user.loginAttempts + 1));
      return res.status(401).json({
        error: `Invalid password. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Account will be locked.'}`,
      });
    }

    await user.resetLoginAttempts();
    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed.' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/auth/forgot-password
   Step 1: User submits email → send OTP for password reset.
 ──────────────────────────────────────────────────────────────────────────*/
router.post('/forgot-password', otpSendLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Valid email required.' });

  try {
    const { email } = req.body;
    console.log(`[AUTH] Forgot-password request: ${email}`);

    if (!email) {
      console.log(`[AUTH] Error: Email is missing in request body.`);
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    console.log(`[AUTH] User lookup for ${email}: ${user ? 'Found' : 'Not Found'}`);

    // No account at all → return generic message (anti-enumeration)
    if (!user) {
      console.log(`[AUTH] Info: User ${email} not found. Returning generic success.`);
      return res.json({ message: 'If this email is registered, an OTP has been sent.' });
    }

    // User exists (verified OR unverified) → send OTP
    console.log(`[AUTH] Generating OTP for ${email}...`);
    const otp = await OTP.createOTP(email, 'reset');
    
    // DEV LOG: Print OTP to logs for easy testing on Render
    console.log(`[AUTH] 🌿 Reset OTP for ${email}: ${otp}`);

    // Attempt to send OTP email
    console.log(`[AUTH] Sending reset email to ${email}...`);
    const emailResult = await sendOTPEmail(email, otp, 'reset');

    if (!emailResult.success) {
      console.warn(`[AUTH] Reset email failed for ${email} but continuing: ${emailResult.message}`);
      // Proceed so user can still use the OTP from logs if email fails
    }

    console.log(`[AUTH] Request completed successfully for ${email}`);
    res.json({
      message: emailResult.success 
        ? 'If this email is registered, an OTP has been sent.'
        : 'Reset initiated. (Email service unavailable, check server logs for OTP).'
    });
  } catch (err) {
    console.error('[AUTH] CRITICAL ERROR in forgot-password:', err);
    res.status(500).json({ 
      error: `Server Error: ${err.message}` 
    });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/auth/reset-password
   Step 2: Verify OTP + set new password.
 ──────────────────────────────────────────────────────────────────────────*/
router.post('/reset-password', otpVerifyLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('otp').notEmpty().withMessage('OTP is required.'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain a number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, otp, newPassword } = req.body;

    // Verify the reset OTP
    const result = await OTP.verifyOTP(email, otp.toString(), 'reset');
    if (!result.valid) return res.status(400).json({ error: result.reason });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Update password — pre-save hook in User model will hash it
    user.password = newPassword;
    user.isEmailVerified = true;  // Proof of email ownership via OTP → verify them
    user.loginAttempts = 0;       // Reset lockout if any
    user.lockUntil = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ error: 'Password reset failed. Try again.' });
  }
});

module.exports = router;