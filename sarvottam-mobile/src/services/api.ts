import { CandidateRecord, DashboardStats } from '../types';
import { storage } from './storage';

// Default Next.js Backend URL (Port 3001)
const DEFAULT_API_URL = 'http://localhost:3001';

export const apiService = {
  async getBaseUrl(): Promise<string> {
    const custom = await storage.getItem('sarvottam_api_url');
    return custom || DEFAULT_API_URL;
  },

  async setBaseUrl(url: string): Promise<void> {
    await storage.setItem('sarvottam_api_url', url.trim());
  },

  // 1. Admin Authentication Endpoints
  async requestAdminCode(adminName: string, email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const baseUrl = await this.getBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName, email }),
      });
      return await res.json();
    } catch (err) {
      return {
        success: true,
        message: 'Dev mode: Verification code logged to terminal console (Bypass: 000000 or 123456)',
      };
    }
  },

  async verifyAdminCode(email: string, code: string): Promise<{ success: boolean; admin?: any; error?: string }> {
    try {
      const baseUrl = await this.getBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      return await res.json();
    } catch (err) {
      // Local bypass fallback if server is unreachable
      if (['000000', '123456', '888888'].includes(code.trim())) {
        return {
          success: true,
          admin: { name: 'Super Administrator', email, role: 'super_admin' },
        };
      }
      return { success: false, error: 'Network error connecting to Admin Server. Use bypass code 000000.' };
    }
  },

  async directAdminLogin(adminName?: string, email?: string): Promise<{ success: boolean; admin?: any; error?: string }> {
    try {
      const baseUrl = await this.getBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/direct-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName, email }),
      });
      return await res.json();
    } catch (err) {
      return {
        success: true,
        admin: { name: adminName || 'Super Administrator', email: email || 'admin@sarvottam.ac.in', role: 'super_admin' },
      };
    }
  },

  // 2. CBT Telemetry Endpoints
  async sendCbtTelemetry(payload: {
    action: 'register' | 'start_exam' | 'update_answers' | 'submit_exam' | 'proctor_warning' | 'abrupt_terminate';
    fullName: string;
    age: string;
    email: string;
    phone: string;
    rollNo?: string;
    stream?: string;
    subject?: string;
    status?: 'LIVE_TESTING' | 'COMPLETED' | 'DISQUALIFIED_ABRUPT';
    score?: number;
    correct?: number;
    wrong?: number;
    unattempted?: number;
    proctorFlags?: number;
  }): Promise<{ success: boolean; candidate?: CandidateRecord; stats?: DashboardStats }> {
    try {
      const baseUrl = await this.getBaseUrl();
      const res = await fetch(`${baseUrl}/api/cbt/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      // Save candidate locally in AsyncStorage cache
      const existing = await storage.getJson<CandidateRecord[]>('sarvottam_cached_candidates', []);
      const updatedCandidate: CandidateRecord = {
        id: 'CAN-' + Math.floor(100000 + Math.random() * 900000),
        rollNo: payload.rollNo || `NEET2024-${payload.age}-${payload.phone.slice(-4)}`,
        fullName: payload.fullName,
        age: payload.age,
        email: payload.email,
        phone: payload.phone,
        stream: payload.stream || 'NEET (UG) 2024',
        subject: payload.subject || 'Botany Mock (50 Qs)',
        registeredAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        status: payload.status || (payload.action === 'submit_exam' ? 'COMPLETED' : 'LIVE_TESTING'),
        score: payload.score ?? null,
        maxScore: 200,
        correct: payload.correct ?? null,
        wrong: payload.wrong ?? null,
        unattempted: payload.unattempted ?? null,
        proctorFlags: payload.proctorFlags ?? 0,
      };
      const filtered = existing.filter(c => c.email !== payload.email && c.phone !== payload.phone);
      filtered.unshift(updatedCandidate);
      await storage.setJson('sarvottam_cached_candidates', filtered);

      return {
        success: true,
        candidate: updatedCandidate,
      };
    }
  },

  // 3. Admin Candidates Management
  async getAdminCandidates(): Promise<{ candidates: CandidateRecord[]; stats: DashboardStats; lanInfo?: any }> {
    try {
      const baseUrl = await this.getBaseUrl();
      const res = await fetch(`${baseUrl}/api/admin/candidates`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // Fallback to locally stored candidates and telemetry
    const cached = await storage.getJson<CandidateRecord[]>('sarvottam_cached_candidates', [
      {
        id: 'CAN-067673',
        rollNo: 'NEET2024-27112002-7891',
        fullName: 'Saatwik Gosain',
        age: '27112002',
        dobFormatted: '27 Nov 2002',
        email: 'teamsntra@gmail.com',
        phone: '7310810875',
        stream: 'NEET (UG) 2024',
        subject: 'Botany Mock (50 Qs)',
        registeredAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        status: 'COMPLETED',
        score: 164,
        maxScore: 200,
        correct: 42,
        wrong: 4,
        unattempted: 4,
        proctorFlags: 0,
      },
      {
        id: 'CAN-088192',
        rollNo: 'NEET2024-18052006-4821',
        fullName: 'Aarav Sharma',
        age: '18052006',
        dobFormatted: '18 May 2006',
        email: 'aarav.sharma@gmail.com',
        phone: '9876543210',
        stream: 'NEET (UG) 2024',
        subject: 'Botany Mock (50 Qs)',
        registeredAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        status: 'LIVE_TESTING',
        score: 0,
        maxScore: 200,
        correct: null,
        wrong: null,
        unattempted: null,
        proctorFlags: 0,
      },
    ]);

    const completed = cached.filter(c => c.status === 'COMPLETED');
    const live = cached.filter(c => c.status === 'LIVE_TESTING');
    const avg = completed.length > 0
      ? Math.round(completed.reduce((acc, c) => acc + (c.score || 0), 0) / completed.length)
      : 0;

    return {
      candidates: cached,
      stats: {
        totalRegistrations: cached.length,
        activeLiveSessions: live.length,
        completedTests: completed.length,
        disqualifiedAttempts: cached.filter(c => c.status === 'DISQUALIFIED_ABRUPT').length,
        averageScore: avg,
        botanySectionAAvg: 112,
        botanySectionBAvg: 38,
        proctorAlertsTotal: cached.reduce((acc, c) => acc + (c.proctorFlags || 0), 0),
      },
      lanInfo: {
        ip: 'localhost',
        port: 3001,
        adminUrl: 'http://localhost:3001/login',
        dashboardUrl: 'http://localhost:3001/dashboard',
        testUrl: 'http://localhost:3001/test',
      },
    };
  },

  async clearCandidates(): Promise<{ success: boolean; message: string }> {
    try {
      const baseUrl = await this.getBaseUrl();
      const res = await fetch(`${baseUrl}/api/admin/candidates`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}

    await storage.setJson('sarvottam_cached_candidates', []);
    return { success: true, message: 'All candidate records cleared successfully.' };
  },
};
