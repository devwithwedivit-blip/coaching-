import { NextResponse } from 'next/server';
import { candidateStore } from '@/lib/candidate-store';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET() {
  const stats = candidateStore.getStats();
  return NextResponse.json({ success: true, stats }, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      action = 'register',
      fullName,
      age,
      email,
      phone,
      rollNo,
      stream,
      subject,
      status,
      score,
      correct,
      wrong,
      unattempted,
      proctorFlags,
    } = body;

    if (!fullName || (!email && !phone)) {
      return NextResponse.json(
        { error: 'Missing candidate details (fullName, email/phone are required).' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Determine status based on action or explicitly passed status
    let candidateStatus: 'LIVE_TESTING' | 'COMPLETED' | 'DISQUALIFIED_ABRUPT' = 'LIVE_TESTING';
    if (status) {
      candidateStatus = status;
    } else if (action === 'submit_exam') {
      candidateStatus = 'COMPLETED';
    } else if (action === 'abrupt_terminate') {
      candidateStatus = 'DISQUALIFIED_ABRUPT';
    } else if (action === 'start_exam' || action === 'register' || action === 'proctor_warning') {
      candidateStatus = 'LIVE_TESTING';
    }

    const candidate = candidateStore.addOrUpdateCandidate({
      fullName: String(fullName).trim(),
      age: String(age || '').trim(),
      email: String(email || '').trim(),
      phone: String(phone || '').trim(),
      rollNo: rollNo ? String(rollNo) : undefined,
      stream: stream || 'NEET (UG) 2024',
      subject: subject || 'Botany Mock (50 Qs)',
      status: candidateStatus,
      score: score !== undefined ? Number(score) : undefined,
      correct: correct !== undefined ? Number(correct) : undefined,
      wrong: wrong !== undefined ? Number(wrong) : undefined,
      unattempted: unattempted !== undefined ? Number(unattempted) : undefined,
      proctorFlags: proctorFlags !== undefined ? Number(proctorFlags) : undefined,
    });

    console.log(`[CBT Telemetry] Candidate registered/updated: ${candidate.fullName} (${candidate.email}, ${candidate.phone}) - Status: ${candidate.status}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Telemetry received successfully',
        candidate,
        stats: candidateStore.getStats(),
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error('[CBT Telemetry Error]', err);
    return NextResponse.json(
      { error: 'Internal server error processing telemetry' },
      { status: 500, headers: corsHeaders }
    );
  }
}
