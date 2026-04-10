const express        = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const User           = require('../models/User');

const router = express.Router();

/* All profile routes require JWT */
router.use(authMiddleware);

/* ─────────────────────────────────────────────────────────────────────────
   GET /api/profile/me
   Returns the logged-in user's full profile (no password).
 ──────────────────────────────────────────────────────────────────────────*/
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -loginAttempts -lockUntil');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   PUT /api/profile/me
   Update profile fields (everything except email/password/role).
 ──────────────────────────────────────────────────────────────────────────*/
const profileRules = [
  body('name').optional({ checkFalsy: true }).trim().notEmpty().isLength({ max: 100 }),
  body('phone').optional({ checkFalsy: true }).trim().matches(/^[\d\s\+\-\(\)]{0,20}$/),
  body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('website')
    .optional({ checkFalsy: true }).trim()
    .isURL({ require_protocol: false }).withMessage('Enter a valid URL.'),
  body('linkedIn').optional({ checkFalsy: true }).trim(),
  body('github').optional({ checkFalsy: true }).trim(),
  body('location').optional({ checkFalsy: true }).trim(),
  body('occupation').optional({ checkFalsy: true }).trim(),
  body('company').optional({ checkFalsy: true }).trim(),
];

router.put('/me', profileRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const allowed = ['name', 'phone', 'bio', 'avatar', 'location', 'dateOfBirth',
                     'gender', 'occupation', 'company', 'website', 'linkedIn', 'github'];

    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        // Convert empty string dates to null to prevent Mongoose CastError
        if (field === 'dateOfBirth' && req.body[field] === '') {
          updates[field] = null;
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true, select: '-password -loginAttempts -lockUntil' }
    );

    res.json({ message: 'Profile updated.', user });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/profile/favorites/toggle
   Add or remove a product from user's favorites list.
   Body: { product: "Reforestation Programs" }
 ──────────────────────────────────────────────────────────────────────────*/
router.post('/favorites/toggle', async (req, res) => {
  try {
    const { product } = req.body;
    if (!product || typeof product !== 'string') {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const idx = user.favorites.indexOf(product.trim());
    let action;
    if (idx === -1) {
      user.favorites.push(product.trim());  // Add to favorites
      action = 'added';
    } else {
      user.favorites.splice(idx, 1);        // Remove from favorites
      action = 'removed';
    }

    await user.save();
    res.json({ action, favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
