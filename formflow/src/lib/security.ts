import crypto from 'crypto';

// ============================================================
// FormFlow Security Utilities (OWASP Top 10 Hardening)
// ============================================================

// ---------- 1. A04 & A07: In-Memory Sliding-Window Rate Limiter ----------
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
    };
  }

  if (record.count >= limit) {
    const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
    };
  }

  record.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return {
    allowed: true,
    remaining: limit - record.count,
    resetSeconds,
  };
}

// ---------- 2. A02 & A07: Cryptographically Secure OTP Generation ----------
export function generateSecureOtp(digits: number = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits);
  return crypto.randomInt(min, max).toString();
}

// ---------- 3. A03: HTML & Email Template Sanitization (XSS / Injection) ----------
export function escapeHtml(unsafe: string): string {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ---------- 4. A03: CSV & Spreadsheet Formula Injection Protection ----------
export function sanitizeSpreadsheetCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = Array.isArray(value) ? value.join(', ') : String(value);

  // If value starts with a formula trigger character, prepend a single quote
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r', '|'];
  const trimmed = str.trimStart();
  if (formulaTriggers.some((char) => trimmed.startsWith(char))) {
    return `'${str}`;
  }
  return str;
}

// ---------- 5. A03 & A05: Safe Filename for Content-Disposition Headers ----------
export function sanitizeFilename(raw: string, fallback: string = 'export'): string {
  const clean = raw
    .replace(/[\r\n\t]/g, '') // Prevent HTTP header splitting
    .replace(/[^\w.-]/g, '_') // Allow only alphanumeric, dots, dashes, underscores
    .slice(0, 64);
  return clean || fallback;
}

// ---------- 6. A10: Server-Side Request Forgery (SSRF) Protection ----------
// Disallowed IP ranges and private host patterns
const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/, // Loopback
  /^0\.0\.0\.0$/,
  /^10\.\d+\.\d+\.\d+$/, // Class A private
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/, // Class B private
  /^192\.168\.\d+\.\d+$/, // Class C private
  /^169\.254\.\d+\.\d+$/, // Link-local / Cloud Metadata (AWS/GCP/Azure)
  /^fc00:/i, // IPv6 Unique Local
  /^fe80:/i, // IPv6 Link-Local
  /^::1$/, // IPv6 Loopback
  /^0:0:0:0:0:0:0:1$/,
];

export function isSafeWebhookUrl(urlString: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(urlString);

    // Only allow HTTP/HTTPS
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { safe: false, reason: 'Only HTTP and HTTPS protocols are permitted.' };
    }

    // In production, require HTTPS
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'HTTPS is required in production environments.' };
    }

    const hostname = parsed.hostname.toLowerCase().trim();

    // Block private / loopback / cloud metadata IPs & hostnames
    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return { safe: false, reason: 'Internal or private network URLs are prohibited.' };
      }
    }

    // Block non-standard or internal ports (allow standard 80, 443)
    if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
      return { safe: false, reason: 'Custom ports are restricted for webhook endpoints.' };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: 'Invalid or malformed URL.' };
  }
}

// ---------- 7. A09: Security Audit Logging ----------
export type SecurityEventType =
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'SSRF_BLOCKED'
  | 'INVALID_OTP_ATTEMPT'
  | 'INJECTION_ATTEMPT';

export function logSecurityEvent(
  type: SecurityEventType,
  details: Record<string, unknown>,
  clientIp?: string
) {
  const timestamp = new Date().toISOString();
  // Filter out any sensitive fields (tokens, passwords, full secrets)
  const sanitizedDetails = { ...details };
  delete (sanitizedDetails as any).password;
  delete (sanitizedDetails as any).token;
  delete (sanitizedDetails as any).otp;

  console.warn(
    JSON.stringify({
      level: 'SECURITY_ALERT',
      type,
      timestamp,
      clientIp: clientIp || 'unknown',
      details: sanitizedDetails,
    })
  );
}

// Helper to extract client IP from Next.js request headers
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
