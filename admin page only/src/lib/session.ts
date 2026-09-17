import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'antigravity-secret-key-salt-988172641-admin-session-cbt';
export const SESSION_COOKIE_NAME = 'antigravity_admin_session';
export const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

export interface AdminSessionPayload {
  name: string;
  email: string;
  role: 'super_admin' | 'exam_admin';
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates an HMAC-signed session token string
 */
export function createSessionToken(admin: { name: string; email: string; role?: 'super_admin' | 'exam_admin' }): string {
  const now = Date.now();
  const payload: AdminSessionPayload = {
    name: admin.name,
    email: admin.email,
    role: admin.role || 'super_admin',
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE * 1000,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Validates HMAC-signed session token
 */
export function verifySessionToken(token: string | undefined): { valid: boolean; admin?: AdminSessionPayload } {
  if (!token || !token.includes('.')) {
    return { valid: false };
  }

  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return { valid: false };

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');

    // Constant time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: false };
    }

    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload: AdminSessionPayload = JSON.parse(jsonStr);

    if (Date.now() > payload.expiresAt) {
      return { valid: false };
    }

    return { valid: true, admin: payload };
  } catch {
    return { valid: false };
  }
}
