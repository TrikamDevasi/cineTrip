import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Security headers applied to ALL responses (API and page routes).
 */
function applySecurityHeaders(response) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

// ── In-Memory Rate Limiter (Fallback for local dev) ──────────────────────
const rateLimitMap = new Map();

function getRateLimitKey(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  return ip;
}

function checkRateLimitInMemory(key, { maxRequests = 60, windowMs = 60000 } = {}) {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.windowStart > windowMs) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - record.windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now - record.windowStart > 300000) {
        rateLimitMap.delete(key);
      }
    }
  }, 300000);
}

// ── Upstash Redis Rate Limiter (Production) ──────────────────────────────
let redis = null;
let aiRateLimit = null;
let standardRateLimit = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // 10 requests per minute for AI routes
  aiRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
  });

  // 120 requests per minute for standard API routes
  standardRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, "1 m"),
    analytics: true,
  });
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Rate limiting on API routes ──────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const key = getRateLimitKey(request);
    const isAI = pathname.startsWith("/api/ai/");
    
    let allowed = true;
    let remaining = 0;
    let retryAfter = 0;

    if (redis) {
      // Use Upstash Redis
      const limiter = isAI ? aiRateLimit : standardRateLimit;
      const result = await limiter.limit(`ratelimit_${key}`);
      allowed = result.success;
      remaining = result.remaining;
      retryAfter = result.reset ? Math.ceil((result.reset - Date.now()) / 1000) : 60;
    } else {
      // Use In-Memory Fallback
      const limits = isAI
        ? { maxRequests: 10, windowMs: 60000 }
        : { maxRequests: 120, windowMs: 60000 };
      const fallbackResult = checkRateLimitInMemory(key, limits);
      allowed = fallbackResult.allowed;
      remaining = fallbackResult.remaining;
      retryAfter = fallbackResult.retryAfter;
    }

    if (!allowed) {
      const res = NextResponse.json(
        { error: "Too many requests. Please try again later.", retryAfter },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
      return applySecurityHeaders(res);
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return applySecurityHeaders(response);
  }

  // ── All other routes (pages, static) ─────────────────────────────────────
  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
