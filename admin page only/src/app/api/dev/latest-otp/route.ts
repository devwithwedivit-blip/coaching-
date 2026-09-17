import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 });
  }
  try {
    const outboxPath = path.join(process.cwd(), '.server_outbox', 'email_dispatches.json');
    if (fs.existsSync(outboxPath)) {
      const data = JSON.parse(fs.readFileSync(outboxPath, 'utf-8'));
      return NextResponse.json({ code: data[0]?.code || null });
    }
  } catch (e) {
    console.error(e);
  }
  return NextResponse.json({ code: null });
}
