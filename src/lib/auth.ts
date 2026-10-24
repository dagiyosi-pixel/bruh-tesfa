// =============================================================================
// BRUH TESFA (ብሩህ ተስፋ) - Administrative Security & Authentication
// =============================================================================

import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'bruh_tesfa_admin_session';
const ADMIN_PASSWORD_DEFAULT = process.env.ADMIN_INITIAL_PASSWORD || 'BruhTesfaAdmin2026!';
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'bruh-tesfa-secure-production-secret-addis-2026';

/**
 * Validates whether the current server context has an authenticated admin session.
 */
export async function verifyAdminSession(): Promise<{ isAuthenticated: boolean; role?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      return { isAuthenticated: false };
    }

    // Token format: base64(admin:timestamp:hash)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [user, ts, hash] = decoded.split(':');

    if (user !== 'admin') {
      return { isAuthenticated: false };
    }

    // Basic expiration check (7 days)
    const sessionTime = parseInt(ts, 10);
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    if (isNaN(sessionTime) || now - sessionTime > sevenDaysMs) {
      return { isAuthenticated: false };
    }

    // Simple integrity check
    const expectedHash = Buffer.from(`${user}:${ts}:${ADMIN_SECRET}`).toString('hex').slice(0, 16);
    if (hash !== expectedHash) {
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true, role: 'admin' };
  } catch {
    return { isAuthenticated: false };
  }
}

/**
 * Creates an admin session cookie token upon valid password entry.
 */
export function createAdminSessionToken(): string {
  const ts = Date.now().toString();
  const hash = Buffer.from(`admin:${ts}:${ADMIN_SECRET}`).toString('hex').slice(0, 16);
  return Buffer.from(`admin:${ts}:${hash}`).toString('base64');
}

/**
 * Validates the administrative password during login.
 */
export function validateAdminCredentials(password: string): boolean {
  if (!password) return false;
  return password === ADMIN_PASSWORD_DEFAULT;
}

export { ADMIN_COOKIE_NAME };
