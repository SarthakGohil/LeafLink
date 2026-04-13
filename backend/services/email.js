const { Resend } = require('resend');
const nodemailer = require('nodemailer');

/**
 * Email service — supports Resend (API) or Nodemailer (SMTP).
 * For free sending without a domain (e.g. via Gmail):
 * 1. Use Nodemailer with a Gmail App Password.
 * 2. Set EMAIL_USER and EMAIL_PASS in .env
 */

// ─── Transport 1: Resend (API) ───────────────────────────────────────────────
let resend;
if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key') {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// ─── Transport 2: Nodemailer (SMTP) ──────────────────────────────────────────
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    family: 4, 
    localAddress: '0.0.0.0',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s+/g, ''),
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
}

const FROM = process.env.EMAIL_FROM || 'LeafLink <onboarding@resend.dev>';

/* ─────────────────────────────────────────────────────────────────────────────
   sendOTPEmail — sends a styled OTP email to the user.
──────────────────────────────────────────────────────────────────────────── */
async function sendOTPEmail(to, otp, type = 'registration') {
  // DEV LOG: Always print OTP to console for local development testing
  console.log('-----------------------------------------');
  console.log(`🌿 [DEV OTP] ${type.toUpperCase()} for ${to}: ${otp}`);
  console.log('-----------------------------------------');

  if (!resend && !transporter) {
    console.warn('⚠️ sendOTPEmail: No email service configured (Resend or SMTP).');
    return { success: false, message: 'Email service not configured.' };
  }

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

  try {
    // ─── Option A: SMTP (Nodemailer) ─────────────────────────────────────────
    if (transporter) {
      await transporter.sendMail({
        from: `LeafLink <${process.env.EMAIL_USER}>`, 
        to, // This is the dynamic 'to' parameter from the function call
        subject: subjects[type] || '🌿 LeafLink — OTP Code',
        html,
      });
      console.log(`✅ Email sent via SMTP to ${to}`);
      return { success: true, message: 'Email sent via SMTP.' };
    }

    // ─── Option B: Resend (API) ──────────────────────────────────────────────
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: subjects[type] || '🌿 LeafLink — OTP Code',
      html,
    });

    if (error) {
      console.error(`❌ Resend error for ${to}:`, error.message);
      return { success: false, message: `Resend Error: ${error.message}` };
    }

    console.log(`✅ Email sent via Resend to ${to}. ID: ${data?.id}`);
    return { success: true, id: data?.id, message: 'Email sent via Resend.' };
  } catch (err) {
    console.error(`❌ Unexpected error in sendOTPEmail for ${to}:`, err.message);
    return { success: false, message: `Unexpected Error: ${err.message}` };
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   sendNotificationEmail — notifies admin when contact/job form is submitted.
──────────────────────────────────────────────────────────────────────────── */
async function sendNotificationEmail(type, data) {
  if (!resend && !transporter) {
    console.warn('⚠️ sendNotificationEmail: No email service configured.');
    return { success: false };
  }

  const adminEmail = process.env.EMAIL_USER;
  const isContact  = type === 'contact';
  const subject    = isContact ? '📩 LeafLink — New Message' : '💼 LeafLink — New Application';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #ddd;">
      <div style="background: #1a4144; padding: 24px 32px;">
        <h1 style="color: #5cba7d; margin: 0; font-size: 1.6rem;">LEAF<span style="color:#f5f1ce;">LINK</span></h1>
      </div>
      <div style="padding: 28px 32px; background: #f9f9f9;">
        ${isContact ? `
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Message:</strong><br/>${data.message}</p>
        ` : `
          <p><strong>Name:</strong> ${data.fullName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Cover Letter:</strong><br/>${data.coverLetter}</p>
        `}
      </div>
    </div>
  `;

  try {
    if (transporter) {
      await transporter.sendMail({ from: process.env.EMAIL_USER, to: adminEmail, subject, html });
    } else {
      await resend.emails.send({ from: FROM, to: [adminEmail], subject, html });
    }
    return { success: true };
  } catch (err) {
    console.error(`❌ Notification failed:`, err.message);
    return { success: false };
  }
}

module.exports = { sendOTPEmail, sendNotificationEmail };
