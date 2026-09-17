import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { adminName = 'Administrator', email = 'admin@sarvottam.ac.in' } = body;

    const trimmedName = String(adminName).trim() || 'Administrator';
    const trimmedEmail = String(email).trim().toLowerCase() || 'admin@sarvottam.ac.in';

    const adminData = {
      name: trimmedName,
      email: trimmedEmail,
      role: 'super_admin' as const,
    };

    const sessionToken = createSessionToken(adminData);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Direct sign-in successful. Verification code bypassed.',
        admin: adminData,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    console.log(`[Admin Auth] Mail verification bypassed. Logged in: ${trimmedName} (${trimmedEmail})`);

    return response;
  } catch (err) {
    console.error('[Direct Login Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to complete direct login.' }, { status: 500 });
  }
}
