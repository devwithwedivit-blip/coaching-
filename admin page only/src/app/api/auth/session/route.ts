import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const verification = verifySessionToken(sessionCookie.value);

    if (!verification.valid || !verification.admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        name: verification.admin.name,
        email: verification.admin.email,
        role: verification.admin.role,
        expiresAt: verification.admin.expiresAt,
      },
    });
  } catch (err) {
    console.error('[Session Check Error]', err);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
