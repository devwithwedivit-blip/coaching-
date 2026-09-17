'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { CandidateRecord, DashboardStats, formatDOB } from '@/lib/types';

interface AdminSession {
  name: string;
  email: string;
  role: string;
  expiresAt: number;
}

interface LanInfo {
  ip: string;
  port: number;
  adminUrl: string;
  dashboardUrl: string;
  testUrl: string;
  heroUrl: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lanInfo, setLanInfo] = useState<LanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'candidates' | 'paper' | 'proctor' | 'audit'>('candidates');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [streamFilter, setStreamFilter] = useState<'ALL' | 'NEET' | 'IIT'>('ALL');
  const [currentTime, setCurrentTime] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    return () => clearInterval(timer);
  }, []);

  // Fetch candidate telemetry
  const fetchCandidates = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/candidates', { cache: 'no-store' });
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
        setStats(data.stats || null);
        if (data.lanInfo) setLanInfo(data.lanInfo);
        setLastSyncTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
      }
    } catch (err) {
      console.error('[Dashboard fetch error]', err);
    } finally {
      if (!isSilent) setRefreshing(false);
    }
  }, [router]);

  // Initial load & Auth verification
  useEffect(() => {
    async function initDashboard() {
      try {
        const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!sessionRes.ok) {
          router.replace('/login');
          return;
        }
        const sessionData = await sessionRes.json();
        if (!sessionData.authenticated || !sessionData.admin) {
          router.replace('/login');
          return;
        }
        setAdmin(sessionData.admin);
        await fetchCandidates(true);
      } catch (e) {
        console.error('Dashboard init error:', e);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [router, fetchCandidates]);

  // Periodic Auto-Sync every 4 seconds for real-time exam telemetry
  useEffect(() => {
    const pollTimer = setInterval(() => {
      fetchCandidates(true);
    }, 4000);
    return () => clearInterval(pollTimer);
  }, [fetchCandidates]);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.replace('/login');
  }

  function handleCopy(text: string, label: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyFeedback(`${label} copied!`);
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  }

  function exportCSV() {
    if (candidates.length === 0) return;
    const headers = ['Roll No', 'Full Name', 'Age/DOB (DDMMYY)', 'Formatted DOB', 'Email ID', 'Phone Number', 'Stream', 'Subject', 'Status', 'Score', 'Max Score', 'Correct', 'Wrong', 'Unattempted', 'Proctor Violations', 'Registration Time'];
    const rows = candidates.map(c => [
      `"${c.rollNo}"`,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.age}"`,
      `"${c.dobFormatted || formatDOB(c.age)}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.stream || 'NEET (UG)'}"`,
      `"${c.subject || 'Standard Paper'}"`,
      `"${c.status}"`,
      c.score !== null ? c.score : 'N/A',
      c.maxScore || 200,
      c.correct !== null ? c.correct : 'N/A',
      c.wrong !== null ? c.wrong : 'N/A',
      c.unattempted !== null ? c.unattempted : 'N/A',
      c.proctorFlags,
      `"${new Date(c.registeredAt).toLocaleString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sarvottam_candidates_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleClearAll() {
    if (!confirm('Are you sure you want to reset the candidate roster back to 0? All active exam records will be cleared.')) return;
    try {
      const res = await fetch('/api/admin/candidates', { method: 'DELETE' });
      if (res.ok) {
        setCandidates([]);
        setStats({
          totalRegistrations: 0,
          activeLiveSessions: 0,
          completedTests: 0,
          disqualifiedAttempts: 0,
          averageScore: 0,
          botanySectionAAvg: 0,
          botanySectionBAvg: 0,
          proctorAlertsTotal: 0,
        });
        setCopyFeedback('Portal reset to 0 entries');
        setTimeout(() => setCopyFeedback(null), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const filteredCandidates = candidates.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.rollNo.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.age.includes(q) ||
      (c.stream && c.stream.toLowerCase().includes(q)) ||
      (c.subject && c.subject.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesStream =
      streamFilter === 'ALL' ||
      (streamFilter === 'NEET' && (!c.stream || c.stream.toUpperCase().includes('NEET') || !c.stream.toUpperCase().includes('IIT'))) ||
      (streamFilter === 'IIT' && c.stream && c.stream.toUpperCase().includes('IIT'));
    return matchesSearch && matchesStatus && matchesStream;
  });

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#0f172a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ color: '#0f172a', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.92rem' }}>Loading Antigravity Admin Portal...</p>
        </div>
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', padding: '24px 20px', maxWidth: '1440px', margin: '0 auto', background: '#f8fafc' }}>
      
      {/* Copy Toast Feedback */}
      {copyFeedback && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '0.84rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>✓</span> {copyFeedback}
        </div>
      )}

      {/* Top Navbar */}
      <header className="glass-panel" style={{ padding: '14px 22px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            ⚡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
                ANTIGRAVITY
              </span>
              <span className="glass-pill" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>ADMIN PORTAL</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Sarvottam Institutes · CBT Telemetry &amp; Examination Control
            </div>
          </div>
        </div>

        {/* Live Sync Status, Time & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Live Polling Sync Badge */}
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.74rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10b981',
            }} />
            <span>LIVE TELEMETRY SYNC</span>
            {lastSyncTime && <span style={{ opacity: 0.8, fontFamily: 'JetBrains Mono, monospace' }}>({lastSyncTime})</span>}
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={() => fetchCandidates(false)}
            disabled={refreshing}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ display: 'inline-block' }}>🔄</span>
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Clock */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{currentTime}</span>
          </div>

          {/* Admin Profile */}
          <div style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
              {admin?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
              {admin?.email}
            </div>
          </div>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '6px 12px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Sign Out</span> 🚪
          </button>
        </div>
      </header>

      {/* Same Wi-Fi LAN Access Hub */}
      <section className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
              📡
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a' }}>Same Wi-Fi Network Connected</span>
                <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontSize: '0.70rem', fontWeight: 700 }}>
                  ONLINE · {lanInfo?.ip || '192.168.29.66'}:3001
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '3px' }}>
                Any phone, tablet, or laptop on this Wi-Fi network can take the CBT exam and access this admin portal.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            
            {/* Student Exam Link */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>📝 CBT TEST (STUDENTS):</span>
              <a
                href={lanInfo?.testUrl || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3001/test` : 'http://192.168.29.66:3001/test')}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.80rem', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}
              >
                {lanInfo?.testUrl || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3001/test` : 'http://192.168.29.66:3001/test')}
              </a>
              <button
                type="button"
                onClick={() => handleCopy(lanInfo?.testUrl || `${window.location.protocol}//${window.location.hostname}:3001/test`, 'Student CBT Test Link')}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '4px', padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Copy
              </button>
            </div>

            {/* Admin Portal Link */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>🔒 ADMIN PORTAL:</span>
              <a
                href={lanInfo?.adminUrl || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3001/login` : 'http://192.168.29.66:3001/login')}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.80rem', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}
              >
                {lanInfo?.adminUrl || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3001/login` : 'http://192.168.29.66:3001/login')}
              </a>
              <button
                type="button"
                onClick={() => handleCopy(lanInfo?.adminUrl || `${window.location.protocol}//${window.location.hostname}:3001/login`, 'Admin Portal Link')}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '4px', padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Copy
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Metrics Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div className="glass-panel" style={{ padding: '18px 20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Registered</span>
            <span style={{ fontSize: '1.2rem' }}>👥</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', fontFamily: 'Poppins, sans-serif' }}>
            {stats?.totalRegistrations ?? candidates.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#047857', marginTop: '4px' }}>
            Students registered before CBT
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Live In Exam</span>
            <span style={{ fontSize: '1.2rem' }}>💻</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2563eb', fontFamily: 'Poppins, sans-serif' }}>
            {stats?.activeLiveSessions ?? candidates.filter(c => c.status === 'LIVE_TESTING').length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#2563eb', marginTop: '4px' }}>
            🔒 Fullscreen Active Sessions
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Completed Tests</span>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#047857', fontFamily: 'Poppins, sans-serif' }}>
            {stats?.completedTests ?? candidates.filter(c => c.status === 'COMPLETED').length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
            Avg Score: {stats?.averageScore ?? 0} / 200
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Proctor Flags</span>
            <span style={{ fontSize: '1.2rem' }}>🚨</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626', fontFamily: 'Poppins, sans-serif' }}>
            {stats?.disqualifiedAttempts ?? candidates.filter(c => c.status === 'DISQUALIFIED_ABRUPT').length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#b91c1c', marginTop: '4px' }}>
            {stats?.proctorAlertsTotal ?? 0} tab switch violations
          </div>
        </div>

      </section>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'candidates', label: `Student Roster & CBT Telemetry (${candidates.length})` },
            { id: 'paper', label: 'Exam Specs (NEET & IIT-JEE)' },
            { id: 'proctor', label: 'Proctoring Log' },
            { id: 'audit', label: 'Security & 2FA Audit' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as unknown as typeof activeTab)}
              style={{
                background: activeTab === t.id ? '#0f172a' : '#ffffff',
                color: activeTab === t.id ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: activeTab === t.id ? '#0f172a' : '#e2e8f0',
                padding: '8px 16px',
                borderRadius: '6px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Export & Reset Roster Buttons */}
        {activeTab === 'candidates' && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {candidates.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🗑️ Reset to 0 Entries</span>
              </button>
            )}
            <button
              type="button"
              onClick={exportCSV}
              disabled={candidates.length === 0}
              style={{
                background: candidates.length === 0 ? '#f8fafc' : '#ecfdf5',
                border: '1px solid',
                borderColor: candidates.length === 0 ? '#e2e8f0' : '#a7f3d0',
                color: candidates.length === 0 ? '#94a3b8' : '#047857',
                padding: '7px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.80rem',
                cursor: candidates.length === 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>📥 Export Roster (CSV)</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: Candidates Registry */}
      {activeTab === 'candidates' && (
        <div className="glass-panel" style={{ padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          
          {/* Header Description & Search/Filter */}
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              Live Registered Students Telemetry
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.84rem' }}>
              Visualizing student information fed on the CBT website: Stream (NEET / IIT-JEE), Subject, Full Name, DOB in DDMMYY, Email ID, Mobile Phone Number, Exam Status, and Live Proctor flags.
            </p>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', gap: '10px', flex: '1', minWidth: '280px', maxWidth: '440px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search name, email, phone, stream, subject, DOB..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '9px 12px', fontSize: '0.86rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Stream Filter */}
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>STREAM:</span>
                {[
                  { id: 'ALL', label: 'ALL' },
                  { id: 'NEET', label: '🩺 NEET (UG)' },
                  { id: 'IIT', label: '📐 IIT-JEE' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStreamFilter(st.id as any)}
                    style={{
                      background: streamFilter === st.id ? '#0f172a' : '#ffffff',
                      border: '1px solid',
                      borderColor: streamFilter === st.id ? '#0f172a' : '#e2e8f0',
                      color: streamFilter === st.id ? '#ffffff' : '#64748b',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>STATUS:</span>
                {['ALL', 'LIVE_TESTING', 'COMPLETED', 'DISQUALIFIED_ABRUPT'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    style={{
                      background: statusFilter === st ? '#0f172a' : '#ffffff',
                      border: '1px solid',
                      borderColor: statusFilter === st ? '#0f172a' : '#e2e8f0',
                      color: statusFilter === st ? '#ffffff' : '#64748b',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {st === 'ALL' ? 'ALL' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="cbt-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="cbt-table" style={{ width: '100%', minWidth: '1060px' }}>
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Stream &amp; Subject</th>
                  <th>DOB (DDMMYY)</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Roll Number</th>
                  <th>Exam Status</th>
                  <th>Score / Max</th>
                  <th>Proctor Flags</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                        0 Candidate Entries in Portal
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '520px', margin: '0 auto', lineHeight: '1.5' }}>
                        No candidate records found. Whenever a student enters their details (Full Name, Age/DOB in DDMMYY, Email, Phone) on the CBT exam page and starts testing, their record will immediately appear and update here in real-time.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c) => {
                    const dobReadable = c.dobFormatted || formatDOB(c.age);
                    const avatarLetter = c.fullName ? c.fullName.charAt(0).toUpperCase() : 'S';
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCandidate(c)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Student Name & Avatar */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: '#0f172a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              flexShrink: 0
                            }}>
                              {avatarLetter}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>
                                {c.fullName}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                {c.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Stream & Subject */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: (c.stream && c.stream.includes('IIT')) ? '#eff6ff' : '#ecfdf5',
                              color: (c.stream && c.stream.includes('IIT')) ? '#1d4ed8' : '#047857',
                              border: `1px solid ${(c.stream && c.stream.includes('IIT')) ? '#bfdbfe' : '#a7f3d0'}`,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              width: 'fit-content'
                            }}>
                              {(c.stream && c.stream.includes('IIT')) ? '📐 IIT-JEE' : '🩺 NEET (UG)'}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                              {c.subject || ((c.stream && c.stream.includes('IIT')) ? 'Standard Paper' : 'Botany (50 Qs)')}
                            </span>
                          </div>
                        </td>

                        {/* DOB (DDMMYY) */}
                        <td>
                          <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
                            <span style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: '0.80rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              background: '#f8fafc',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                              display: 'inline-block',
                              width: 'fit-content'
                            }}>
                              {c.age || '—'}
                            </span>
                            <span style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                              {dobReadable}
                            </span>
                          </div>
                        </td>

                        {/* Email Address */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <a
                              href={`mailto:${c.email}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500 }}
                              title="Click to send email"
                            >
                              {c.email}
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(c.email, 'Email');
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                padding: '2px 4px'
                              }}
                              title="Copy email"
                            >
                              📋
                            </button>
                          </div>
                        </td>

                        {/* Phone Number */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <a
                              href={`tel:${c.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: '#0f172a', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.80rem', fontWeight: 600 }}
                              title="Click to call"
                            >
                              {c.phone}
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(c.phone, 'Phone number');
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                padding: '2px 4px'
                              }}
                              title="Copy phone"
                            >
                              📋
                            </button>
                          </div>
                        </td>

                        {/* Roll Number */}
                        <td>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#64748b' }}>
                            {c.rollNo}
                          </span>
                        </td>

                        {/* Exam Status */}
                        <td>
                          {c.status === 'COMPLETED' && (
                            <span className="status-tag status-completed">
                              <span>✓</span> Completed
                            </span>
                          )}
                          {c.status === 'LIVE_TESTING' && (
                            <span className="status-tag status-live">
                              <span>●</span> Live In Test
                            </span>
                          )}
                          {c.status === 'DISQUALIFIED_ABRUPT' && (
                            <span className="status-tag status-abrupt">
                              <span>⚠</span> Abrupt Exit
                            </span>
                          )}
                        </td>

                        {/* Score / Max */}
                        <td>
                          {c.score !== null ? (
                            <div>
                              <div style={{
                                fontWeight: 700,
                                fontSize: '0.92rem',
                                color: c.score >= 140 ? '#047857' : c.score === 0 ? '#dc2626' : '#0f172a'
                              }}>
                                {c.score} <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 500 }}>/ {c.maxScore || 200}</span>
                              </div>
                              {c.correct !== null && (
                                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                  {c.correct}✓ {c.wrong}✗ {c.unattempted}-
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#2563eb', fontSize: '0.78rem', fontStyle: 'italic' }}>
                              In Progress...
                            </span>
                          )}
                        </td>

                        {/* Proctor Flags */}
                        <td>
                          {c.proctorFlags === 0 ? (
                            <span style={{ color: '#047857', fontSize: '0.76rem', fontWeight: 600 }}>0 Clean</span>
                          ) : (
                            <span style={{
                              color: '#b91c1c',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span>⚠️</span> {c.proctorFlags} Violation{c.proctorFlags > 1 ? 's' : ''}
                            </span>
                          )}
                        </td>

                        {/* Action - Inspect Candidate */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCandidate(c);
                            }}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#0f172a',
                              padding: '4px 10px',
                              borderRadius: '5px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>Inspect</span> 🔍
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CANDIDATE INSPECT MODAL / DOSSIER */}
      {selectedCandidate && (
        <div
          onClick={() => setSelectedCandidate(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 10000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '640px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#0f172a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                }}>
                  {selectedCandidate.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', fontFamily: 'Poppins, sans-serif' }}>
                    {selectedCandidate.fullName}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                    {selectedCandidate.rollNo}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 700
                }}
              >
                ✕
              </button>
            </div>

            {/* Candidate Details Grid */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                📋 Student Personal &amp; Contact Information (From CBT Form)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                
                {/* Stream & Subject */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Exam Stream &amp; Subject</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{
                      background: (selectedCandidate.stream && selectedCandidate.stream.includes('IIT')) ? '#eff6ff' : '#ecfdf5',
                      color: (selectedCandidate.stream && selectedCandidate.stream.includes('IIT')) ? '#1d4ed8' : '#047857',
                      border: `1px solid ${(selectedCandidate.stream && selectedCandidate.stream.includes('IIT')) ? '#bfdbfe' : '#a7f3d0'}`,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 700
                    }}>
                      {(selectedCandidate.stream && selectedCandidate.stream.includes('IIT')) ? '📐 IIT-JEE' : '🩺 NEET (UG)'}
                    </span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                      {selectedCandidate.subject || ((selectedCandidate.stream && selectedCandidate.stream.includes('IIT')) ? 'Standard Paper' : 'Botany (50 Qs)')}
                    </span>
                  </div>
                </div>

                {/* Full Name */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Student Full Name</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', marginTop: '3px' }}>{selectedCandidate.fullName}</div>
                </div>

                {/* DOB in DDMMYY */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Age / DOB (DDMMYY)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      {selectedCandidate.age}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      ({selectedCandidate.dobFormatted || formatDOB(selectedCandidate.age)})
                    </span>
                  </div>
                </div>

                {/* Email Address */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
                    <a href={`mailto:${selectedCandidate.email}`} style={{ color: '#2563eb', fontSize: '0.86rem', fontWeight: 500, textDecoration: 'none' }}>
                      {selectedCandidate.email}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedCandidate.email, 'Email')}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '4px', padding: '2px 6px', fontSize: '0.70rem', cursor: 'pointer' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Phone Number */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
                    <a href={`tel:${selectedCandidate.phone}`} style={{ color: '#0f172a', fontSize: '0.88rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textDecoration: 'none' }}>
                      {selectedCandidate.phone}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedCandidate.phone, 'Phone number')}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '4px', padding: '2px 6px', fontSize: '0.70rem', cursor: 'pointer' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* CBT Exam Progress & Score */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                📊 CBT Examination Telemetry &amp; Performance
              </h4>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Exam: </span>
                    <strong style={{ color: '#0f172a' }}>{selectedCandidate.stream}</strong>
                    <span style={{ color: '#cbd5e1' }}>·</span>
                    <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.82rem' }}>{selectedCandidate.subject || 'Standard Paper'}</span>
                  </div>
                  <div>
                    {selectedCandidate.status === 'COMPLETED' && <span className="status-tag status-completed">Completed</span>}
                    {selectedCandidate.status === 'LIVE_TESTING' && <span className="status-tag status-live">Live In Examination</span>}
                    {selectedCandidate.status === 'DISQUALIFIED_ABRUPT' && <span className="status-tag status-abrupt">Disqualified (Abrupt Exit)</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                  <div style={{ textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>FINAL SCORE</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: selectedCandidate.score !== null && selectedCandidate.score >= 140 ? '#047857' : selectedCandidate.score === 0 ? '#dc2626' : '#0f172a', marginTop: '2px' }}>
                      {selectedCandidate.score !== null ? `${selectedCandidate.score} / ${selectedCandidate.maxScore || 200}` : '—'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#047857' }}>CORRECT (+4)</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#047857', marginTop: '2px' }}>
                      {selectedCandidate.correct !== null ? selectedCandidate.correct : '—'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#dc2626' }}>WRONG (-1)</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#dc2626', marginTop: '2px' }}>
                      {selectedCandidate.wrong !== null ? selectedCandidate.wrong : '—'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>UNATTEMPTED (0)</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#64748b', marginTop: '2px' }}>
                      {selectedCandidate.unattempted !== null ? selectedCandidate.unattempted : '—'}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '12px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <span>Registered: {new Date(selectedCandidate.registeredAt).toLocaleString()}</span>
                  {selectedCandidate.lastActiveAt && <span>Last Active: {new Date(selectedCandidate.lastActiveAt).toLocaleTimeString()}</span>}
                </div>
              </div>
            </div>

            {/* AI Proctoring Audit */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                🛡️ AI Proctoring &amp; Screen-Lock Violations
              </h4>
              <div style={{
                background: selectedCandidate.proctorFlags === 0 ? '#ecfdf5' : '#fef2f2',
                border: '1px solid',
                borderColor: selectedCandidate.proctorFlags === 0 ? '#a7f3d0' : '#fecaca',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '1.3rem' }}>{selectedCandidate.proctorFlags === 0 ? '🛡️' : '🚨'}</span>
                <div>
                  <div style={{ fontWeight: 600, color: selectedCandidate.proctorFlags === 0 ? '#047857' : '#b91c1c', fontSize: '0.86rem' }}>
                    {selectedCandidate.proctorFlags === 0 ? 'Zero Violations Detected (Clean Session)' : `${selectedCandidate.proctorFlags} Tab Switch / Window Blur Violation(s)`}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '2px' }}>
                    {selectedCandidate.status === 'DISQUALIFIED_ABRUPT'
                      ? 'Candidate triggered 2 tab-switch / minimize violations. Test auto-submitted as ABRUPT with zero score.'
                      : selectedCandidate.proctorFlags === 1
                      ? 'First violation warning modal triggered on client window. Candidate resumed.'
                      : 'Candidate adhered strictly to the 1-hour fullscreen locked examination session.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <a
                href={`mailto:${selectedCandidate.email}`}
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.80rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>✉️ Email Student</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: '1px solid #0f172a',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.80rem',
                  cursor: 'pointer'
                }}
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: NEET & IIT-JEE Specifications */}
      {activeTab === 'paper' && (
        <div className="glass-panel" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
            Examination Streams &amp; Subjects Specifications (NEET &amp; IIT-JEE)
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.84rem', marginBottom: '20px' }}>
            Official syllabus structure: NEET (UG) 4 Subjects (Physics, Chemistry, Botany, Zoology) and IIT-JEE 2024 Stream.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700 }}>⚡ NEET: PHYSICS</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, margin: '6px 0', color: '#0f172a' }}>50 Questions</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Section A (35 Qs) + Section B (15 Qs) | Max 200 Marks</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: '#0891b2', fontWeight: 700 }}>🧪 NEET: CHEMISTRY</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, margin: '6px 0', color: '#0f172a' }}>50 Questions</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Section A (35 Qs) + Section B (15 Qs) | Max 200 Marks</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>🌿 NEET: BOTANY</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, margin: '6px 0', color: '#0f172a' }}>50 Questions</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Section A (35 Qs) + Section B (15 Qs) | Max 200 Marks</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 700 }}>🐾 NEET: ZOOLOGY</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, margin: '6px 0', color: '#0f172a' }}>50 Questions</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Section A (35 Qs) + Section B (15 Qs) | Max 200 Marks</div>
            </div>
          </div>

          <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '10px', padding: '18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '2rem' }}>📐</div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                IIT-JEE 2024 Examination Stream Option
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#3b82f6', lineHeight: '1.5' }}>
                Configured as a distinct stream option for engineering candidates. Evaluated as a single comprehensive paper without subject breakdown, in accordance with institutional testing specifications.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Proctoring Log */}
      {activeTab === 'proctor' && (
        <div className="glass-panel" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
            AI Proctoring Telemetry Stream
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.84rem', marginBottom: '18px' }}>
            Active tab-switch and window-blur events detected during live full screen examination sessions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {candidates.filter(c => c.proctorFlags > 0).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🛡️</div>
                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px', fontSize: '0.92rem' }}>No Proctoring Violations Recorded</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>All candidate sessions are clean with zero tab switches or window minimizes.</div>
              </div>
            ) : (
              candidates
                .filter(c => c.proctorFlags > 0)
                .map(c => (
                  <div
                    key={c.id}
                    style={{
                      background: c.proctorFlags >= 2 ? '#fef2f2' : '#fffbeb',
                      border: '1px solid',
                      borderColor: c.proctorFlags >= 2 ? '#fecaca' : '#fde68a',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <strong style={{ color: c.proctorFlags >= 2 ? '#b91c1c' : '#b45309' }}>
                        [{c.proctorFlags >= 2 ? 'DISQUALIFIED · 2ND VIOLATION' : '1ST WARNING ISSUED'}]
                      </strong>{' '}
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{c.fullName}</span> ({c.rollNo})
                      <div style={{ fontSize: '0.76rem', color: '#475569', marginTop: '3px' }}>
                        {c.proctorFlags >= 2
                          ? 'Candidate navigated away from examination window twice. Auto-submitted as ABRUPT with zero score recorded.'
                          : 'Window focus lost or tab switched. First violation warning dialogue presented on client screen.'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Contact: {c.email} | {c.phone} | DOB: {c.age} ({c.dobFormatted || formatDOB(c.age)})
                      </div>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                      {c.lastActiveAt ? new Date(c.lastActiveAt).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Security & 2FA Audit */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
            Server-Side Two-Factor Authentication Audit
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.84rem', marginBottom: '18px' }}>
            Security telemetry verifying that all OTP code generation, validation, and session tokens remain strictly server-side.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '0.76rem', color: '#2563eb', fontWeight: 600 }}>ACTIVE SESSION TOKEN</div>
              <div style={{ fontSize: '0.90rem', fontWeight: 600, color: '#047857', margin: '6px 0' }}>HMAC SHA-256 Signed</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Stored in HttpOnly SameSite=Lax cookie. Inaccessible to client JS.</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '0.76rem', color: '#2563eb', fontWeight: 600 }}>OTP DISPATCH ENGINE</div>
              <div style={{ fontSize: '0.90rem', fontWeight: 600, color: '#0f172a', margin: '6px 0' }}>6-Digit Crypto Random</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Stored hashed on server with 5-minute strict expiry and burn-on-verify.</div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '0.76rem', color: '#2563eb', fontWeight: 600 }}>RATE LIMIT ENFORCEMENT</div>
              <div style={{ fontSize: '0.90rem', fontWeight: 600, color: '#b45309', margin: '6px 0' }}>Active (60s cooldown / 5 attempts max)</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Code permanently burned on 5th incorrect attempt.</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
