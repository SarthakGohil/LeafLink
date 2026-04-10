const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');
const crypto    = require('crypto');  // built-in — cryptographically secure

/**
 * OTP Schema — stores email OTPs with expiry for registration / login 2FA.
 * OTP is hashed before storage (bcrypt) — never stored in plaintext.
 * Auto-expires via MongoDB TTL index on expiresAt field.
 */
const otpSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true, trim: true },
  otp:       { type: String, required: true },   // bcrypt-hashed
  type:      { type: String, enum: ['registration', 'login', 'reset'], default: 'registration' },
  expiresAt: { type: Date,   required: true },
  attempts:  { type: Number, default: 0 },       // max 3 verify attempts
}, { timestamps: true });

// MongoDB TTL index — auto-deletes documents after expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Index on email for fast lookups
otpSchema.index({ email: 1, type: 1 });

/* ── Static: create and store a new OTP ──────────────────────────────────── */
otpSchema.statics.createOTP = async function (email, type = 'registration') {
  // Delete any existing OTP for this email+type
  await this.deleteMany({ email: email.toLowerCase(), type });

  const rawOtp   = crypto.randomInt(100000, 999999).toString(); // CSPRNG 6-digit OTP
  const hashed   = await bcrypt.hash(rawOtp, 10);
  const expMins  = parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10);
  const expiresAt = new Date(Date.now() + expMins * 60 * 1000);

  await this.create({ email: email.toLowerCase(), otp: hashed, type, expiresAt });
  return rawOtp; // Return plaintext for sending via email
};

/* ── Static: verify an OTP ───────────────────────────────────────────────── */
otpSchema.statics.verifyOTP = async function (email, rawOtp, type = 'registration') {
  const record = await this.findOne({
    email: email.toLowerCase(), type, expiresAt: { $gt: new Date() },
  });

  if (!record) return { valid: false, reason: 'OTP expired or not found.' };
  if (record.attempts >= 3) {
    await record.deleteOne();
    return { valid: false, reason: 'Too many failed attempts. Request a new OTP.' };
  }

  const isMatch = await bcrypt.compare(rawOtp, record.otp);
  if (!isMatch) {
    await record.updateOne({ $inc: { attempts: 1 } });
    return { valid: false, reason: 'Incorrect OTP.' };
  }

  await record.deleteOne(); // Consume OTP after successful verification
  return { valid: true };
};

module.exports = mongoose.model('OTP', otpSchema);
