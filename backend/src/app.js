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
const ALLOWED_ORIGINS = [
  'https://cine-trip-sigma.vercel.app',
  'https://cinetrip-dj5w.onrender.com',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:19006',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:8082',
  'http://127.0.0.1:19006',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((o) => o.trim()) : []),
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
];

const isProduction = process.env.NODE_ENV === 'production';

const corsOptions = {
  origin: (origin, callback) => {
    // Always allow requests with no origin (native mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    const isExplicitlyAllowed = ALLOWED_ORIGINS.some((allowed) =>
      origin === allowed || origin.startsWith(allowed)
    );

    if (isExplicitlyAllowed) {
      return callback(null, true);
    }

    // In development or local testing: allow localhost, 127.0.0.1, and private LAN IPs (Expo Go)
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isLAN =
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) ||
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin) ||
      /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(:\d+)?$/.test(origin);

    if (isLocalhost || isLAN) {
      return callback(null, true);
    }

    // Reject without throwing a 500 error to prevent crashing the response without headers
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'apikey'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
app.use('/api/upload', uploadRoutes);

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
