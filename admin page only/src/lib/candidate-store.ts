import fs from 'fs';
import path from 'path';
import { CandidateRecord, DashboardStats, formatDOBDDMMYY, formatDOB } from './types';

export type { CandidateRecord, DashboardStats };
export { formatDOBDDMMYY, formatDOB };

const DEFAULT_CANDIDATES: CandidateRecord[] = [];

class CandidateStore {
  private filePath: string;
  private memoryCache: CandidateRecord[] | null = null;

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'candidates.json');
    this.initStore();
  }

  private initStore() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify(DEFAULT_CANDIDATES, null, 2), 'utf-8');
        this.memoryCache = [...DEFAULT_CANDIDATES];
      } else {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.memoryCache = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[CandidateStore Init Warning]', err);
      this.memoryCache = [...DEFAULT_CANDIDATES];
    }
  }

  private save() {
    try {
      if (this.memoryCache) {
        fs.writeFileSync(this.filePath, JSON.stringify(this.memoryCache, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[CandidateStore Save Error]', err);
    }
  }

  public getAllCandidates(): CandidateRecord[] {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.memoryCache = JSON.parse(raw);
      } else {
        this.memoryCache = [];
      }
    } catch {
      if (!this.memoryCache) this.memoryCache = [];
    }

    // Return sorted newest first
    return [...(this.memoryCache || [])].sort((a, b) => {
      const ta = new Date(a.registeredAt).getTime() || 0;
      const tb = new Date(b.registeredAt).getTime() || 0;
      return tb - ta;
    });
  }

  public getCandidateById(id: string): CandidateRecord | undefined {
    const list = this.getAllCandidates();
    return list.find((c) => c.id === id || c.rollNo === id);
  }

  public addOrUpdateCandidate(data: {
    fullName: string;
    age: string; // DDMMYY
    email: string;
    phone: string;
    rollNo?: string;
    stream?: string;
    subject?: string;
    status?: 'LIVE_TESTING' | 'COMPLETED' | 'DISQUALIFIED_ABRUPT';
    score?: number | null;
    correct?: number | null;
    wrong?: number | null;
    unattempted?: number | null;
    proctorFlags?: number;
  }): CandidateRecord {
    if (!this.memoryCache) {
      this.initStore();
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim().replace(/[\+\-\s\(\)]/g, '');
    const cleanAge = data.age.trim();
    const formattedDOB = formatDOBDDMMYY(cleanAge);

    // Check if matching candidate already exists by email or phone
    const existingIndex = this.memoryCache!.findIndex(
      (c) => (cleanEmail && c.email.toLowerCase() === cleanEmail) || (cleanPhone && c.phone === cleanPhone)
    );

    const nowIso = new Date().toISOString();
    const defaultRoll = data.rollNo || `NEET2024-${cleanAge}-${cleanPhone.slice(-4) || '0881'}`;

    if (existingIndex >= 0) {
      const existing = this.memoryCache![existingIndex];
      const updated: CandidateRecord = {
        ...existing,
        fullName: data.fullName || existing.fullName,
        age: cleanAge || existing.age,
        dobFormatted: formattedDOB || existing.dobFormatted,
        email: cleanEmail || existing.email,
        phone: cleanPhone || existing.phone,
        stream: data.stream || existing.stream,
        subject: data.subject || existing.subject,
        status: data.status !== undefined ? data.status : existing.status,
        score: data.score !== undefined ? data.score : existing.score,
        correct: data.correct !== undefined ? data.correct : existing.correct,
        wrong: data.wrong !== undefined ? data.wrong : existing.wrong,
        unattempted: data.unattempted !== undefined ? data.unattempted : existing.unattempted,
        proctorFlags: data.proctorFlags !== undefined ? data.proctorFlags : existing.proctorFlags,
        lastActiveAt: nowIso,
      };
      this.memoryCache![existingIndex] = updated;
      this.save();
      return updated;
    } else {
      const newId = `CAN-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
      const streamVal = data.stream || 'NEET (UG) 2024';
      const subjectVal = data.subject || (streamVal.includes('IIT') ? 'IIT-JEE Standard Paper' : 'Botany Mock (50 Qs)');
      const isFullNeet = subjectVal.toLowerCase().includes('200') || subjectVal.toLowerCase().includes('full');
      const isIit = streamVal.includes('IIT');
      const maxScoreVal = isFullNeet ? 720 : (isIit ? 300 : 200);

      const newRecord: CandidateRecord = {
        id: newId,
        rollNo: defaultRoll,
        fullName: data.fullName,
        age: cleanAge,
        dobFormatted: formattedDOB,
        email: cleanEmail,
        phone: cleanPhone,
        stream: streamVal,
        subject: subjectVal,
        registeredAt: nowIso,
        lastActiveAt: nowIso,
        status: data.status || 'LIVE_TESTING',
        score: data.score !== undefined ? data.score : null,
        maxScore: maxScoreVal,
        correct: data.correct !== undefined ? data.correct : null,
        wrong: data.wrong !== undefined ? data.wrong : null,
        unattempted: data.unattempted !== undefined ? data.unattempted : null,
        proctorFlags: data.proctorFlags !== undefined ? data.proctorFlags : 0,
      };
      this.memoryCache!.unshift(newRecord);
      this.save();
      return newRecord;
    }
  }

  public clearAllCandidates(): void {
    this.memoryCache = [];
    this.save();
  }

  public getStats(): DashboardStats {
    const list = this.getAllCandidates();
    const totalRegistrations = list.length;
    const activeLiveSessions = list.filter((c) => c.status === 'LIVE_TESTING').length;
    const completedTests = list.filter((c) => c.status === 'COMPLETED').length;
    const disqualifiedAttempts = list.filter((c) => c.status === 'DISQUALIFIED_ABRUPT').length;

    const completedWithScore = list.filter((c) => c.status === 'COMPLETED' && typeof c.score === 'number');
    const totalScore = completedWithScore.reduce((acc, c) => acc + (c.score || 0), 0);
    const averageScore = completedWithScore.length > 0 ? Number((totalScore / completedWithScore.length).toFixed(1)) : 0;

    const proctorAlertsTotal = list.reduce((acc, c) => acc + (c.proctorFlags || 0), 0);

    return {
      totalRegistrations,
      activeLiveSessions,
      completedTests,
      disqualifiedAttempts,
      averageScore,
      botanySectionAAvg: completedWithScore.length > 0 ? Number((averageScore * 0.77).toFixed(1)) : 0,
      botanySectionBAvg: completedWithScore.length > 0 ? Number((averageScore * 0.23).toFixed(1)) : 0,
      proctorAlertsTotal,
    };
  }
}

// Global singleton instance for the server runtime
const globalForCandidateStore = global as unknown as { candidateStore?: CandidateStore };
export const candidateStore = globalForCandidateStore.candidateStore || new CandidateStore();
if (process.env.NODE_ENV !== 'production') {
  globalForCandidateStore.candidateStore = candidateStore;
}
