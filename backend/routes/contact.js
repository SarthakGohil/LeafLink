const express        = require('express');
const { body, validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/* ── Validation rules ────────────────────────────────────────────────────── */
const contactRules = [
  body('name').trim().notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('message').trim().notEmpty().withMessage('Message is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10–2000 characters.'),
];

// ─── POST /api/contact ────────────────────────────────────────────────────────
// Submit a contact message (public — no JWT required)
router.post('/', contactRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, message } = req.body;
    const contactMsg = await ContactMessage.create({ name, email, message });

    res.status(201).json({
      message: 'Your message has been received. We will get back to you soon!',
      id: contactMsg._id,
    });
  } catch (err) {
    console.error('Contact error:', err.message);
    res.status(500).json({ error: 'Could not save your message. Please try again.' });
  }
});

// ─── GET /api/contact ─────────────────────────────────────────────────────────
// List all contact messages — admin only (JWT + role=admin required)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ count: messages.length, messages });
  } catch (err) {
    console.error('List contacts error:', err.message);
    res.status(500).json({ error: 'Could not retrieve messages.' });
  }
});

module.exports = router;
