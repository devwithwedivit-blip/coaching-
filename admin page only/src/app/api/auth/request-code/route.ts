import { NextResponse } from 'next/server';
import { authSecurityStore } from '@/lib/auth-store';
import { sendOtpEmail } from '@/lib/email-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminName, email } = body;

    // 1. Validation
    if (!adminName || typeof adminName !== 'string' || adminName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid Admin Name (at least 2 characters).' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid official Email address.' },
        { status: 400 }
      );
    }

    // 2. Server-side code generation & rate limiting
    const result = authSecurityStore.generateVerificationCode(adminName.trim(), email.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, cooldownSeconds: result.cooldownSeconds },
        { status: 429 }
      );
    }

    // 3. Server-side email dispatch
    await sendOtpEmail({
      email: email.trim(),
      adminName: adminName.trim(),
      code: result.code,
      expiresInMinutes: 5,
    });

    // 4. Return sanitized response — ZERO code exposure to client
    return NextResponse.json(
      {
        success: true,
        message: 'A 6-digit verification code has been generated and sent to your email address.',
        expiresAt: result.expiresAt,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('[Request-Code API Error]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing your request.' },
      { status: 500 }
    );
  }
}
