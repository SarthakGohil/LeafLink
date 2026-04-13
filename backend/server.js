require('dotenv').config();
const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const authRoutes    = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const jobRoutes     = require('./routes/jobs');
const profileRoutes = require('./routes/profile');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Render Proxy Trust ──────────────────────────────────────────────────── */
// Render uses a reverse proxy. Trusting the first proxy allows rate limiters 
// to see the real client IP instead of the proxy's IP.
app.set('trust proxy', 1);

/* ── Security: HTTP headers (helmet) ─────────────────────────────────────── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

/* ── CORS — allow localhost (dev) + CLIENT_URL (production) ──────────────── */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow Postman / curl (no origin header) + configured origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

/* ── Security: Request body limits ───────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));           // Prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ── Security: NoSQL injection prevention ────────────────────────────────── */
app.use(mongoSanitize());

/* ── Security: Global rate limiter ───────────────────────────────────────── */
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

/* ── Routes ──────────────────────────────────────────────────────────────── */
app.use('/api/auth',    authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/jobs',    jobRoutes);
app.use('/api/profile', profileRoutes);

/* ── Health check ────────────────────────────────────────────────────────── */
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'LeafLink API is running' }));

/* ── 404 handler ─────────────────────────────────────────────────────────── */
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

/* ── Global error handler ────────────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

/* ── MongoDB Connection ──────────────────────────────────────────────────── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    const HOST = '0.0.0.0';
    app.listen(PORT, HOST, () => {
      console.log(`🌿  LeafLink API running on http://${HOST}:${PORT}`);
      console.log(`🔒  Security: helmet ✓ | cors ✓ | rate-limit ✓ | mongo-sanitize ✓`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
