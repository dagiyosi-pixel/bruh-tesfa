// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Administrative & Tutor Security, Auth & Sessions
// =============================================================================

import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const ADMIN_COOKIE_NAME = 'bruh_tesfa_admin_session';
const TUTOR_COOKIE_NAME = 'bruh_tesfa_tutor_session';
const PARENT_COOKIE_NAME = 'bruh_tesfa_parent_session';

const ADMIN_PASSWORD_DEFAULT = process.env.ADMIN_INITIAL_PASSWORD || 'BruhTesfaAdmin2026!';
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'bruh-tesfa-secure-production-secret-addis-2026';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

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
 * Validates an admin session token string cryptographically using constant-time comparison.
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
 * Validates whether the current server context has an authenticated admin session.
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

  const inputHash = crypto.createHash('sha256').update(password).digest();
  const expectedHash = crypto.createHash('sha256').update(ADMIN_PASSWORD_DEFAULT).digest();

  return crypto.timingSafeEqual(inputHash, expectedHash);
}

// =============================================================================
// TUTOR AUTHENTICATION & SESSION PERSISTENCE
// =============================================================================

/**
 * Derives a secure password hash using scrypt with random salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a password against a stored scrypt hash using constant-time comparison.
 */
export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!password || !storedHash || typeof password !== 'string' || typeof storedHash !== 'string') {
    return false;
  }
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Creates a signed, tamper-proof session token for a verified tutor.
 */
export function createTutorSessionToken(tutorId: string, phone: string): string {
  const ts = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(`tutor:${tutorId}:${phone}:${ts}`)
    .digest('hex');
  return Buffer.from(`tutor:${tutorId}:${phone}:${ts}:${signature}`).toString('base64');
}

/**
 * Validates a tutor session token string.
 */
export function verifyTutorTokenString(token: string): { isAuthenticated: boolean; tutorId?: string; phone?: string; error?: string } {
  if (!token || typeof token !== 'string') {
    return { isAuthenticated: false, error: 'Missing token' };
  }
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 5) {
      return { isAuthenticated: false, error: 'Malformed tutor token structure' };
    }
    const [prefix, tutorId, phone, ts, hash] = parts;
    if (prefix !== 'tutor') {
      return { isAuthenticated: false, error: 'Invalid token prefix' };
    }
    const sessionTime = parseInt(ts, 10);
    if (isNaN(sessionTime)) {
      return { isAuthenticated: false, error: 'Invalid token timestamp' };
    }
    const now = Date.now();
    if (now - sessionTime > SESSION_TTL_MS || sessionTime > now + 60000) {
      return { isAuthenticated: false, error: 'Session token expired or from the future' };
    }
    const expectedHash = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(`tutor:${tutorId}:${phone}:${ts}`)
      .digest('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const expectedBuf = Buffer.from(expectedHash, 'hex');
    if (hashBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(hashBuf, expectedBuf)) {
      return { isAuthenticated: false, error: 'Signature mismatch' };
    }
    return { isAuthenticated: true, tutorId, phone };
  } catch {
    return { isAuthenticated: false, error: 'Decryption failed' };
  }
}

/**
 * Validates whether the incoming request has a valid tutor session cookie.
 */
export async function verifyTutorSession(): Promise<{ isAuthenticated: boolean; tutorId?: string; phone?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TUTOR_COOKIE_NAME)?.value;
    if (!token) {
      return { isAuthenticated: false, error: 'No tutor session cookie' };
    }
    return verifyTutorTokenString(token);
  } catch {
    return { isAuthenticated: false, error: 'Failed to read tutor session cookie' };
  }
}

export { ADMIN_COOKIE_NAME, TUTOR_COOKIE_NAME, PARENT_COOKIE_NAME };
