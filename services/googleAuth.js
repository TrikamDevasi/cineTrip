import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import api from './api';

// Complete auth session if in a browser popup / redirect flow
WebBrowser.maybeCompleteAuthSession();

/**
 * Helper to parse all query & hash parameters from any callback URL
 */
export function extractAuthParams(url) {
  if (!url || typeof url !== 'string') return {};

  const params = {};

  // Extract from query string (...?key=val)
  if (url.includes('?')) {
    const queryString = url.split('?')[1].split('#')[0];
    const searchParams = new URLSearchParams(queryString);
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
  }

  // Extract from hash fragment (...#key=val)
  if (url.includes('#')) {
    const hashString = url.split('#')[1];
    const hashParams = new URLSearchParams(hashString);
    for (const [key, value] of hashParams.entries()) {
      params[key] = value;
    }
  }

  return params;
}

/**
 * Process an auth callback URL (from deep link, WebBrowser, or redirect)
 */
export async function processAuthSessionFromUrl(url) {
  const params = extractAuthParams(url);

  if (params.error || params.error_description) {
    return {
      success: false,
      error: params.error_description || params.error || 'Authentication error occurred.',
    };
  }

  // 1. Handle PKCE Flow (exchange code for session)
  if (params.code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
      if (!error && data?.session) {
        return buildAuthResult(data.session);
      }
      if (error) {
        console.warn('Supabase exchangeCodeForSession warning:', error.message);
      }
    } catch (codeErr) {
      console.warn('exchangeCodeForSession exception:', codeErr.message);
    }
  }

  // 2. Handle Implicit Flow (access_token + refresh_token)
  if (params.access_token && params.refresh_token) {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (!error && data?.session) {
        return buildAuthResult(data.session, params.provider_token);
      }
    } catch (setErr) {
      console.warn('setSession exception:', setErr.message);
    }
  }

  // 3. Fallback: check active Supabase session
  const { data: currentSession } = await supabase.auth.getSession();
  if (currentSession?.session) {
    return buildAuthResult(currentSession.session, params.provider_token);
  }

  return {
    success: false,
    error: 'No valid session credentials found in auth response.',
  };
}

/**
 * Format session and exchange/sync with backend
 */
async function buildAuthResult(session, providerToken = null) {
  if (!session || !session.access_token) {
    return { success: false, error: 'Invalid session structure' };
  }

  const rawToken = session.access_token;
  const pToken = providerToken || session.provider_token || null;
  const sbUser = session.user;

  const fallbackUser = {
    id: sbUser?.id || `sb_${Date.now()}`,
    name:
      sbUser?.user_metadata?.full_name ||
      sbUser?.user_metadata?.name ||
      sbUser?.email?.split('@')[0] ||
      'Cinephile User',
    email: sbUser?.email || '',
    avatar:
      sbUser?.user_metadata?.avatar_url ||
      sbUser?.user_metadata?.picture ||
      null,
  };

  // Sync with CineTrip Backend (with 4s timeout so offline backend never blocks user)
  try {
    const backendPromise = api.post('/api/auth/google', {
      accessToken: rawToken,
      providerToken: pToken,
      token: rawToken,
      user: fallbackUser,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Backend sync timeout')), 4000)
    );

    const backendResponse = await Promise.race([backendPromise, timeoutPromise]);

    if (backendResponse && backendResponse.token && backendResponse.user) {
      return {
        success: true,
        user: backendResponse.user,
        token: backendResponse.token,
      };
    }
  } catch (backendErr) {
    console.warn('Backend sync for Google OAuth bypassed, using verified Supabase session:', backendErr.message);
  }

  return {
    success: true,
    user: fallbackUser,
    token: rawToken,
  };
}

/**
 * Sign in with Google using Supabase OAuth and WebBrowser,
 * works seamlessly across Native (iOS / Android) and Web.
 */
export async function signInWithGoogle() {
  try {
    // 1. Web Platform: Direct browser redirect (never blocked by popup blockers)
    if (Platform.OS === 'web') {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : makeRedirectUri({ scheme: 'cinetrip', path: 'auth/callback' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
        return { success: true, redirecting: true };
      }
      return { success: true, redirecting: true };
    }

    // 2. Native Platforms (iOS / Android): In-App Browser AuthSession
    const redirectUrl = makeRedirectUri({
      scheme: 'cinetrip',
      path: 'auth/callback',
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    if (!data?.url) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        return buildAuthResult(sessionData.session);
      }
      return {
        success: false,
        error: 'Failed to obtain Google sign-in URL.',
      };
    }

    const authResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (authResult.type === 'success' && authResult.url) {
      return await processAuthSessionFromUrl(authResult.url);
    }

    if (authResult.type === 'cancel' || authResult.type === 'dismiss') {
      return {
        success: false,
        cancelled: true,
        error: 'Google Sign-In was cancelled.',
      };
    }

    const { data: fallbackSession } = await supabase.auth.getSession();
    if (fallbackSession?.session) {
      return buildAuthResult(fallbackSession.session);
    }

    return {
      success: false,
      error: 'Google Sign-In was not completed.',
    };
  } catch (err) {
    console.warn('Supabase Google OAuth error:', err.message);
    return {
      success: false,
      error: err.message || 'Failed to sign in with Google.',
    };
  }
}

