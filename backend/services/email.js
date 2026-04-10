const nodemailer = require('nodemailer');

/**
 * Email service — sends OTP emails via nodemailer (Gmail/SMTP).
 * Configure EMAIL_USER and EMAIL_PASS in .env
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * sendOTPEmail — sends a formatted OTP email to the user.
 * @param {string} to - recipient email
 * @param {string} otp - plaintext 6-digit OTP
 * @param {string} type - 'registration' | 'login' | 'reset'
 */
async function sendOTPEmail(to, otp, type = 'registration') {
  const subjects = {
    registration: '🌿 LeafLink — Verify Your Email',
    login:        '🌿 LeafLink — Your Login OTP',
    reset:        '🌿 LeafLink — Password Reset OTP',
  };

  const actions = {
    registration: 'complete your registration',
    login:        'log in securely',
    reset:        'reset your password',
  };

  const html = `
    <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f5f1ce; border-radius: 12px; overflow: hidden;">
      <div style="background: #1a4144; padding: 32px; text-align: center;">
        <h1 style="color: #5cba7d; margin: 0; font-size: 2rem; letter-spacing: 1px;">LEAF<span style="color:#f5f1ce;">LINK</span></h1>
        <p style="color: #f5f1ce; margin: 8px 0 0; font-size: 0.9rem;">Forestry Platform Security</p>
      </div>
      <div style="padding: 36px 32px;">
        <h2 style="color: #1a4144; margin-bottom: 12px;">Verify Your Identity</h2>
        <p style="color: #444; line-height: 1.6;">
          Use the OTP below to ${actions[type] || 'continue'}. This code expires in <strong>${process.env.OTP_EXPIRES_MINUTES || 10} minutes</strong>.
        </p>
        <div style="text-align:center; margin: 32px 0;">
          <span style="
            display: inline-block;
            font-size: 2.8rem; font-weight: 800; letter-spacing: 14px;
            color: #1a4144; background: #e8f5e9;
            padding: 18px 32px; border-radius: 10px;
            border: 2px dashed #5cba7d;
          ">${otp}</span>
        </div>
        <p style="color: #888; font-size: 0.8rem; margin-top: 24px;">
          ⚠️ Never share this OTP. LeafLink will never ask for it. If you didn't request this, please ignore this email.
        </p>
      </div>
      <div style="background: #1a4144; padding: 16px; text-align: center;">
        <p style="color: #f5f1ce80; font-size: 0.75rem; margin: 0;">© ${new Date().getFullYear()} LeafLink. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || 'LeafLink <noreply@leaflink.in>',
    to,
    subject: subjects[type] || '🌿 LeafLink — OTP Code',
    html,
  });
}

module.exports = { sendOTPEmail };
