// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Administrative Security & Cryptographic Auth
// =============================================================================

import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const ADMIN_COOKIE_NAME = 'bruh_tesfa_admin_session';
const ADMIN_PASSWORD_DEFAULT = process.env.ADMIN_INITIAL_PASSWORD || 'BruhTesfaAdmin2026!';
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'bruh-tesfa-secure-production-secret-addis-2026';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Computes an HMAC-SHA256 signature for a user and timestamp.
 */
function computeTokenSignature(user: string, timestamp: string): string {
  return crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(`${user}:${timestamp}`)
    .digest('hex');
}

/**
 * Validates a session token string cryptographically using constant-time comparison.
 */
export function verifyAdminTokenString(token: string): { isAuthenticated: boolean; role?: string; error?: string } {
  if (!token || typeof token !== 'string') {
    return { isAuthenticated: false, error: 'Missing token' };
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) {
      return { isAuthenticated: false, error: 'Malformed token structure' };
    }

    const [user, ts, hash] = parts;

    if (user !== 'admin') {
      return { isAuthenticated: false, error: 'Invalid user identity' };
    }

    const sessionTime = parseInt(ts, 10);
    if (isNaN(sessionTime)) {
      return { isAuthenticated: false, error: 'Invalid token timestamp' };
    }

    const now = Date.now();
    if (now - sessionTime > SESSION_TTL_MS || sessionTime > now + 60000) {
      return { isAuthenticated: false, error: 'Session token expired or from the future' };
    }

    const expectedHash = computeTokenSignature(user, ts);
    const hashBuf = Buffer.from(hash, 'hex');
    const expectedBuf = Buffer.from(expectedHash, 'hex');

    if (hashBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(hashBuf, expectedBuf)) {
      return { isAuthenticated: false, error: 'Signature mismatch' };
    }

    return { isAuthenticated: true, role: 'admin' };
  } catch {
    return { isAuthenticated: false, error: 'Decryption failed' };
  }
}

/**
 * Validates whether the current server context (cookies or Authorization header) has an authenticated admin session.
 */
export async function verifyAdminSession(): Promise<{ isAuthenticated: boolean; role?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return { isAuthenticated: false, error: 'No admin session cookie' };
    }

    return verifyAdminTokenString(token);
  } catch {
    return { isAuthenticated: false, error: 'Failed to read session cookie' };
  }
}

/**
 * Creates an admin session cookie token signed with HMAC-SHA256 upon valid credentials entry.
 */
export function createAdminSessionToken(): string {
  const ts = Date.now().toString();
  const signature = computeTokenSignature('admin', ts);
  return Buffer.from(`admin:${ts}:${signature}`).toString('base64');
}

/**
 * Validates the administrative password using constant-time comparison to prevent timing attacks.
 */
export function validateAdminCredentials(password?: string): boolean {
  if (!password || typeof password !== 'string') return false;

  // Use SHA-256 digest comparison with timingSafeEqual to avoid timing leaks
  const inputHash = crypto.createHash('sha256').update(password).digest();
  const expectedHash = crypto.createHash('sha256').update(ADMIN_PASSWORD_DEFAULT).digest();

  return crypto.timingSafeEqual(inputHash, expectedHash);
}

export { ADMIN_COOKIE_NAME };
