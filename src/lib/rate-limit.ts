import { NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

// Clean up stale entries every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit?: number; // Max requests allowed
  windowMs?: number; // Window size in milliseconds
  prefix?: string; // Route prefix to segment limits
}

/**
 * Extract client IP address from Next.js request headers
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Rate limit check for Next.js Route Handlers.
 * Returns null if allowed, or a 429 NextResponse if rate limit is exceeded.
 */
export function checkRateLimit(
  req: Request,
  options: RateLimitOptions = {}
): NextResponse | null {
  const {
    limit = 10,
    windowMs = 15 * 60 * 1000, // Default 15 minutes
    prefix = "global",
  } = options;

  const ip = getClientIp(req);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return null;
  }

  if (record.count >= limit) {
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please slow down and try again later.",
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfterSec.toString(),
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(record.resetTime / 1000).toString(),
        },
      }
    );
  }

  record.count += 1;
  return null;
}
