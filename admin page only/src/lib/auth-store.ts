import crypto from 'crypto';

export interface CodeRecord {
  email: string;
  adminName: string;
  hashedCode: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

export interface RequestLimitRecord {
  requestTimestamps: number[];
  lastRequestedAt: number;
}

// In-memory server-side security store
// (In production, this can be backed by Redis or database)
class AuthSecurityStore {
  private activeCodes = new Map<string, CodeRecord>();
  private requestLimits = new Map<string, RequestLimitRecord>();

  private readonly EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  private readonly RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown
  private readonly MAX_REQUESTS_IN_WINDOW = 3;
  private readonly RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_FAILED_ATTEMPTS = 5;

  private hash(code: string): string {
    return crypto.createHash('sha256').update(code.trim()).digest('hex');
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private cleanupExpired() {
    const now = Date.now();
    for (const [key, record] of this.activeCodes.entries()) {
      if (now > record.expiresAt) {
        this.activeCodes.delete(key);
      }
    }
  }

  /**
   * Check rate-limiting and generate a cryptographically random 6-digit code.
   * Returns generated code strictly to server-side caller for email dispatch.
   */
  public generateVerificationCode(
    adminName: string,
    rawEmail: string
  ): { success: true; code: string; expiresAt: number } | { success: false; error: string; cooldownSeconds?: number } {
    this.cleanupExpired();
    const email = this.normalizeEmail(rawEmail);
    const now = Date.now();

    // 1. Rate-limit checks
    let limitRecord = this.requestLimits.get(email);
    if (!limitRecord) {
      limitRecord = { requestTimestamps: [], lastRequestedAt: 0 };
      this.requestLimits.set(email, limitRecord);
    }

    // Cooldown check (60s)
    const timeSinceLast = now - limitRecord.lastRequestedAt;
    if (timeSinceLast < this.RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((this.RESEND_COOLDOWN_MS - timeSinceLast) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting another code.`,
        cooldownSeconds: waitSeconds,
      };
    }

    // Window limit check (max 3 per 15 min)
    limitRecord.requestTimestamps = limitRecord.requestTimestamps.filter(t => now - t < this.RATE_WINDOW_MS);
    if (limitRecord.requestTimestamps.length >= this.MAX_REQUESTS_IN_WINDOW) {
      return {
        success: false,
        error: 'Too many verification code requests. Please try again after 15 minutes.',
      };
    }

    // 2. Generate secure 6-digit numeric OTP (100000 - 999999)
    const secureCode = crypto.randomInt(100000, 1000000).toString();
    const hashed = this.hash(secureCode);
    const expiresAt = now + this.EXPIRY_MS;

    // 3. Store hashed code
    this.activeCodes.set(email, {
      email,
      adminName: adminName.trim(),
      hashedCode: hashed,
      createdAt: now,
      expiresAt,
      attempts: 0,
      maxAttempts: this.MAX_FAILED_ATTEMPTS,
    });

    // Update rate limits
    limitRecord.lastRequestedAt = now;
    limitRecord.requestTimestamps.push(now);

    return {
      success: true,
      code: secureCode, // Kept server-side only for dispatching via email
      expiresAt,
    };
  }

  /**
   * Validate user-entered code against the server-side hash.
   * Client receives only success/failure and attempts remaining.
   */
  public verifyCode(
    rawEmail: string,
    enteredCode: string
  ): {
    success: boolean;
    error?: string;
    attemptsRemaining?: number;
    adminName?: string;
    email?: string;
  } {
    this.cleanupExpired();
    const email = this.normalizeEmail(rawEmail);
    const record = this.activeCodes.get(email);

    if (!record) {
      return {
        success: false,
        error: 'No active verification code found for this email, or the code has expired.',
      };
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      this.activeCodes.delete(email);
      return {
        success: false,
        error: 'Verification code has expired. Please request a new one.',
      };
    }

    // Check attempt limits
    record.attempts++;
    const hashedInput = this.hash(enteredCode);

    if (hashedInput !== record.hashedCode) {
      const remaining = record.maxAttempts - record.attempts;
      if (remaining <= 0) {
        // Burn the code immediately on maximum failed attempts
        this.activeCodes.delete(email);
        return {
          success: false,
          error: 'Maximum verification attempts exceeded. Code invalidated for security. Please request a new code.',
          attemptsRemaining: 0,
        };
      }
      return {
        success: false,
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        attemptsRemaining: remaining,
      };
    }

    // Verification successful! Burn code immediately to prevent replay attacks
    const adminName = record.adminName;
    this.activeCodes.delete(email);

    return {
      success: true,
      adminName,
      email,
    };
  }
}

// Global singleton instance for the Node server runtime
const globalAuthStore = globalThis as unknown as { __authSecurityStore?: AuthSecurityStore };
export const authSecurityStore = globalAuthStore.__authSecurityStore || (globalAuthStore.__authSecurityStore = new AuthSecurityStore());
