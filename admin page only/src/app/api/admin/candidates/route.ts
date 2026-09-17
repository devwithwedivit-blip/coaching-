import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/session';
import { candidateStore } from '@/lib/candidate-store';

import os from 'os';

function getLanIp(): string {
  try {
    const nets = os.networkInterfaces();
    const priorityNames = ['wi-fi', 'wifi', 'wlan', 'wireless', 'ethernet', 'eth', 'en', 'local'];

    // 1st pass: prioritize active Wi-Fi / physical Ethernet
    for (const p of priorityNames) {
      for (const name of Object.keys(nets)) {
        if (name.toLowerCase().includes(p) && !name.toLowerCase().includes('vethernet') && !name.toLowerCase().includes('virtual')) {
          for (const net of nets[name] || []) {
            if (net.family === 'IPv4' && !net.internal && net.address !== '127.0.0.1') {
              return net.address;
            }
          }
        }
      }
    }

    // 2nd pass: any non-internal IPv4 that is not loopback
    for (const name of Object.keys(nets)) {
      if (!name.toLowerCase().includes('vethernet') && !name.toLowerCase().includes('virtual')) {
        for (const net of nets[name] || []) {
          if (net.family === 'IPv4' && !net.internal && net.address !== '127.0.0.1') {
            return net.address;
          }
        }
      }
    }
  } catch {}
  return '192.168.29.66';
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const session = verifySessionToken(sessionCookie.value);
    if (!session.valid) {
      return NextResponse.json({ error: 'Session expired or invalid.' }, { status: 401 });
    }

    const candidates = candidateStore.getAllCandidates();
    const stats = candidateStore.getStats();
    const lanIp = getLanIp();
    const lanInfo = {
      ip: lanIp,
      port: 3001,
      adminUrl: `http://${lanIp}:3001/login`,
      dashboardUrl: `http://${lanIp}:3001/dashboard`,
      testUrl: `http://${lanIp}:3001/test`,
      heroUrl: `http://${lanIp}:3001/home`,
    };

    return NextResponse.json({ candidates, stats, lanInfo });
  } catch (err) {
    console.error('[Admin Candidates Error]', err);
    return NextResponse.json({ error: 'Failed to fetch candidate data' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const session = verifySessionToken(sessionCookie.value);
    if (!session.valid) {
      return NextResponse.json({ error: 'Session expired or invalid.' }, { status: 401 });
    }

    candidateStore.clearAllCandidates();
    const stats = candidateStore.getStats();

    return NextResponse.json({
      success: true,
      message: 'All candidate records cleared. Portal reset to 0 entries.',
      candidates: [],
      stats,
    });
  } catch (err) {
    console.error('[Admin Clear Error]', err);
    return NextResponse.json({ error: 'Failed to clear candidate data' }, { status: 500 });
  }
}
