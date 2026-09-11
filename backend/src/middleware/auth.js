const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory cache for validated Supabase tokens (token -> { sbUser, expiresAt })
const supabaseTokenCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

async function verifySupabaseToken(token) {
  if (!token || typeof token !== 'string') return null;

  const now = Date.now();
  const cached = supabaseTokenCache.get(token);
  if (cached && now < cached.expiresAt) {
    return cached.sbUser;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && (data.email || data.id)) {
        supabaseTokenCache.set(token, { sbUser: data, expiresAt: now + CACHE_TTL_MS });
        // Prune cache if it grows too large
        if (supabaseTokenCache.size > 2000) {
          for (const [k, v] of supabaseTokenCache.entries()) {
            if (now >= v.expiresAt) supabaseTokenCache.delete(k);
          }
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Supabase auth check error:', err.message);
  }

  return null;
}

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Please login.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing.' });
    }

    // 1. Authoritative Strategy: Verify Supabase Access Token
    const sbUser = await verifySupabaseToken(token);
    if (sbUser) {
      const email = (sbUser.email || '').toLowerCase();
      const googleId = sbUser.id;

      // Find user by Supabase ID or email in MongoDB
      let user = await User.findOne({
        $or: [{ googleId }, ...(email ? [{ email }] : [])],
      }).select('-passwordHash');

      if (!user && email) {
        // Auto-provision user in MongoDB from authoritative Supabase identity
        const metadata = sbUser.user_metadata || {};
        user = new User({
          name: metadata.full_name || metadata.name || email.split('@')[0],
          email,
          googleId,
          provider: sbUser.app_metadata?.provider || 'supabase',
          avatar: metadata.avatar_url || metadata.picture || null,
          profile: {
            city: '',
            avatar: metadata.avatar_url || '🍿',
            preferredFormat: 'IMAX Laser',
            preferredChain: '',
            favoriteGenres: [],
            notificationsEnabled: true,
            autoExportCalendar: false,
            themeMode: 'dark',
          },
        });
        await user.save();
      }

      if (user) {
        req.user = user;
        req.supabaseUser = sbUser;
        return next();
      }
    }

    // 2. Fallback Strategy: Verify CineTrip Node JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId).select('-passwordHash');
        if (user) {
          req.user = user;
          return next();
        }
      }
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired. Please login again.' });
      }
    }

    return res.status(401).json({ message: 'Invalid or expired session credentials.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticateToken };

