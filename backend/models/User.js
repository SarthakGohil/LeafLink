const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');

/**
 * User Schema — Normalized MongoDB schema with full profile + security fields.
 * Security: password hashed (bcrypt 12), email verified via OTP,
 *           login attempts tracked, account lockout, lastLogin recorded.
 */
const userSchema = new mongoose.Schema(
  {
    /* ── Core ─────────────────────────────────────────────────────────── */
    name: {
      type: String, required: [true, 'Name is required'], trim: true, maxlength: [100, 'Name max 100 chars'],
    },
    email: {
      type: String, required: [true, 'Email is required'], unique: true,
      lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
    },
    password: {
      type: String, required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'], select: false,
    },

    /* ── Profile ──────────────────────────────────────────────────────── */
    phone:       { type: String, trim: true, default: '' },
    bio:         { type: String, maxlength: [500, 'Bio max 500 chars'], default: '' },
    avatar:      { type: String, default: '' },              // URL
    location:    { type: String, default: '' },
    dateOfBirth: { type: Date,   default: null },
    gender:      { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say', ''], default: '' },

    /* ── Professional ─────────────────────────────────────────────────── */
    occupation: { type: String, default: '' },
    company:    { type: String, default: '' },
    website:    { type: String, default: '' },
    linkedIn:   { type: String, default: '' },
    github:     { type: String, default: '' },

    /* ── Favorites (liked products/services) ──────────────────────────── */
    favorites:  [{ type: String, trim: true }],

    /* ── Security & Auth ──────────────────────────────────────────────── */
    role:             { type: String, enum: ['user', 'admin'], default: 'user' },
    isEmailVerified:  { type: Boolean, default: false },
    lastLogin:        { type: Date,    default: null },
    loginAttempts:    { type: Number,  default: 0 },
    lockUntil:        { type: Date,    default: null },
  },
  { timestamps: true }
);

/* ── Virtual: isLocked ───────────────────────────────────────────────────── */
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/* ── Pre-save: hash password ─────────────────────────────────────────────── */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* ── Method: compare password ────────────────────────────────────────────── */
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/* ── Method: increment failed login attempts (lockout after 5) ───────────── */
userSchema.methods.incLoginAttempts = async function () {
  // If lock expired, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // Lock 30 min
  }
  return this.updateOne(updates);
};

/* ── Method: reset attempts on success ───────────────────────────────────── */
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({ $set: { loginAttempts: 0, lastLogin: new Date() }, $unset: { lockUntil: 1 } });
};

module.exports = mongoose.model('User', userSchema);
