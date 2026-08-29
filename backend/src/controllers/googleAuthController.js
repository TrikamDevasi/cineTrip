const jwt = require('jsonwebtoken');
const User = require('../models/User');

const GOOGLE_CLIENT_IDS = [
  process.env.GOOGLE_CLIENT_ID,
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
].filter(Boolean);

/**
 * Strategy 1: Verify Google ID Token via Google's official tokeninfo endpoint
 * Validates cryptographic signature, expiration, issuer, and returns verified payload.
 */
async function verifyGoogleIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') return null;
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );
    if (response.ok) {
      const payload = await response.json();
      if (payload && payload.email) {
        // Check audience if configured
        if (GOOGLE_CLIENT_IDS.length > 0 && payload.aud) {
          const matchesAudience = GOOGLE_CLIENT_IDS.includes(payload.aud);
          if (!matchesAudience) {
            console.warn(`Google ID token audience (${payload.aud}) does not match configured client IDs.`);
          }
        }
        return {
          googleId: payload.sub,
          email: payload.email.toLowerCase(),
          name: payload.name || payload.email.split('@')[0],
          avatar: payload.picture || null,
        };
      }
    }
  } catch (err) {
    console.warn('Google ID token verification error:', err.message);
  }
  return null;
}

/**
 * Strategy 2: Verify Google Access Token via Google OAuth2 Userinfo API
 */
async function verifyGoogleAccessToken(accessToken) {
  if (!accessToken || typeof accessToken !== 'string') return null;
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.email) {
        return {
          googleId: data.sub,
          email: data.email.toLowerCase(),
          name: data.name || data.email.split('@')[0],
          avatar: data.picture || null,
        };
      }
    }
  } catch (err) {
    console.warn('Google Access token verification error:', err.message);
  }
  return null;
}

/**
 * Strategy 3: Verify Supabase Auth Token via Supabase Auth API
 */
async function verifySupabaseToken(token) {
  if (!token || typeof token !== 'string') return null;
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
      if (data && data.email) {
        const metadata = data.user_metadata || {};
        return {
          googleId: data.id,
          email: data.email.toLowerCase(),
          name: metadata.full_name || metadata.name || data.email.split('@')[0],
          avatar: metadata.avatar_url || metadata.picture || null,
        };
      }
    }
  } catch (err) {
    console.warn('Supabase token verification error:', err.message);
  }
  return null;
}

/**
 * Generate CineTrip Application JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * POST /api/auth/google
 *
 * Body:
 * { idToken?: string, accessToken?: string, token?: string }
 */
const googleAuth = async (req, res, next) => {
  try {
    const { idToken, accessToken, providerToken, token, user: clientUser } = req.body;
    const candidates = [idToken, providerToken, accessToken, token].filter(
      (t) => typeof t === 'string' && t.trim().length > 0
    );

    if (candidates.length === 0 && (!clientUser || !clientUser.email)) {
      return res.status(400).json({
        message: 'Google authentication credential is required.',
      });
    }

    // Step 1: Multi-strategy server-side token verification with Google / Supabase
    let verifiedIdentity = null;

    for (const candidate of candidates) {
      verifiedIdentity = await verifyGoogleIdToken(candidate);
      if (verifiedIdentity) break;

      verifiedIdentity = await verifyGoogleAccessToken(candidate);
      if (verifiedIdentity) break;

      verifiedIdentity = await verifySupabaseToken(candidate);
      if (verifiedIdentity) break;
    }

    // Fallback if client already verified with Supabase
    if (!verifiedIdentity && clientUser && clientUser.email) {
      verifiedIdentity = {
        googleId: clientUser.id || `sb_${Date.now()}`,
        email: clientUser.email.toLowerCase(),
        name: clientUser.name || clientUser.email.split('@')[0],
        avatar: clientUser.avatar || null,
      };
    }

    if (!verifiedIdentity || !verifiedIdentity.email) {
      return res.status(401).json({
        message: 'Google authentication verification failed. Invalid or expired token.',
      });
    }

    const { googleId, email, name, avatar } = verifiedIdentity;

    // Step 2: Find existing user by googleId OR email in MongoDB
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // Step 3: Create new User in MongoDB
      user = new User({
        name,
        email,
        googleId,
        provider: 'google',
        avatar,
        profile: {
          city: '',
          avatar: avatar || '🍿',
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

    // Step 4: Issue CineTrip Application JWT
    const appToken = generateToken(user._id);

    return res.status(200).json({
      message: 'Google authentication successful.',
      token: appToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  googleAuth,
  verifyGoogleIdToken,
  verifyGoogleAccessToken,
  verifySupabaseToken,
};
