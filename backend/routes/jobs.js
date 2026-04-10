const express        = require('express');
const { body, validationResult } = require('express-validator');
const JobApplication = require('../models/JobApplication');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/* ── Validation rules ────────────────────────────────────────────────────── */
const jobRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2–100 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('phone').trim().notEmpty().withMessage('Phone is required.')
    .matches(/^[\d\s\+\-\(\)]{7,20}$/).withMessage('Enter a valid phone number.'),
  body('coverLetter').trim().notEmpty().withMessage('Cover letter is required.')
    .isLength({ min: 50, max: 5000 }).withMessage('Cover letter must be 50–5000 characters.'),
];

// ─── POST /api/jobs/apply ─────────────────────────────────────────────────────
// Submit a job application (public — no JWT required to apply)
router.post('/apply', jobRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { fullName, email, phone, coverLetter, resumeFileName } = req.body;
    const application = await JobApplication.create({
      fullName,
      email,
      phone,
      coverLetter,
      resumeFileName: resumeFileName || null,
    });

    res.status(201).json({
      message: 'Application submitted successfully! We will review it shortly.',
      applicationId: application._id,
    });
  } catch (err) {
    console.error('Job apply error:', err.message);
    res.status(500).json({ error: 'Could not submit application. Please try again.' });
  }
});

// ─── GET /api/jobs/applications ───────────────────────────────────────────────
// List all applications — admin only (JWT + role=admin required)
router.get('/applications', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    res.json({ count: applications.length, applications });
  } catch (err) {
    console.error('List applications error:', err.message);
    res.status(500).json({ error: 'Could not retrieve applications.' });
  }
});

module.exports = router;
