const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const memoriesRoutes = require('./routes/memories');
const plannerRoutes = require('./routes/planner');
const watchlistRoutes = require('./routes/watchlist');
const profileRoutes = require('./routes/profile');
const uploadRoutes = require('./routes/upload');

const app = express();

// Security headers
app.use(helmet());

// CORS
const PRODUCTION_ALLOWED_ORIGINS = [
  'https://cine-trip-sigma.vercel.app',
  'https://cinetrip-dj5w.onrender.com',
];

const DEV_ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:8081',
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:3000',
  'http://127.0.0.1:8081',
];

const isProduction = process.env.NODE_ENV === 'production';

app.use(
  cors({
    origin: (origin, callback) => {
      // Always allow requests with no origin (native mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }

      if (isProduction) {
        // In production: only explicit allowlist is permitted
        const allowed = PRODUCTION_ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
        if (allowed) {
          return callback(null, true);
        }
        return callback(new Error(`CORS: Origin "${origin}" is not allowed.`), false);
      } else {
        // In development: allow localhost, LAN IPs (for Expo Go on device), and allowlist
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
        const isLAN = /^http:\/\/192\.168\.\d+\.\d+/.test(origin) || /^http:\/\/10\.\d+\.\d+\.\d+/.test(origin);
        const isAllowed = DEV_ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
        if (isLocalhost || isLAN || isAllowed) {
          return callback(null, true);
        }
        return callback(new Error(`CORS: Origin "${origin}" is not allowed in development.`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // More permissive in development
  message: { message: 'Too many requests from this IP. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500,
  message: { message: 'Rate limit exceeded. Please slow down.' },
});

app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/memories', memoriesRoutes);
app.use('/api/plans', plannerRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// Centralized error handler — must be last
app.use(errorHandler);

module.exports = app;
