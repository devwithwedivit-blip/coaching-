export interface CandidateRecord {
  id: string;
  rollNo: string;
  fullName: string;
  age: string; // DDMMYY format, e.g. 180506
  dobFormatted?: string; // Formatted date string, e.g. 18 May 2006
  email: string;
  phone: string;
  stream: string;
  subject: string;
  registeredAt: string;
  lastActiveAt?: string;
  status: 'LIVE_TESTING' | 'COMPLETED' | 'DISQUALIFIED_ABRUPT';
  score: number | null;
  maxScore: number;
  correct: number | null;
  wrong: number | null;
  unattempted: number | null;
  proctorFlags: number;
}

export interface DashboardStats {
  totalRegistrations: number;
  activeLiveSessions: number;
  completedTests: number;
  disqualifiedAttempts: number;
  averageScore: number;
  botanySectionAAvg: number;
  botanySectionBAvg: number;
  proctorAlertsTotal: number;
}

// Client-safe helper to format DDMMYY into human readable string
export function formatDOBDDMMYY(val: string): string {
  if (!val) return '';
  const clean = val.replace(/[\/\-\s]/g, '');
  if (clean.length !== 6 && clean.length !== 8) return val;
  const d = clean.slice(0, 2);
  const mIndex = parseInt(clean.slice(2, 4), 10) - 1;
  const yRaw = clean.slice(4);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[mIndex] || clean.slice(2, 4);
  const fullYear = yRaw.length === 2 ? (parseInt(yRaw, 10) > 40 ? `19${yRaw}` : `20${yRaw}`) : yRaw;
  return `${d} ${monthName} ${fullYear}`;
}

export function formatDOB(val: string): string {
  return formatDOBDDMMYY(val) || '—';
}
