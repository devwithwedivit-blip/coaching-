'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  // Form State
  const [step, setStep] = useState<1 | 2>(1);
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  
  // OTP State (6 digits)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Status & Timers
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  
  // Timers: 5-minute expiry & 60-second resend cooldown
  const [expirySeconds, setExpirySeconds] = useState(300);
  const [cooldownSeconds, setCooldownSeconds] = useState(60);

  // Check if already authenticated on mount
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace('/dashboard');
        }
      })
      .catch(() => {});
  }, [router]);

  // Expiry Countdown (Step 2)
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setExpirySeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMessage('Verification code has expired. Please request a new code.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Resend Cooldown Timer (Step 2)
  useEffect(() => {
    if (step !== 2 || cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, cooldownSeconds]);

  // Direct Login (Bypass mail verification code)
  async function handleDirectLogin(customName?: string, customEmail?: string) {
    const finalName = (customName || adminName).trim() || 'Chief Administrator';
    const finalEmail = (customEmail || email).trim() || 'admin@sarvottam.ac.in';

    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: finalName,
          email: finalEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to sign in.');
        setLoading(false);
        return;
      }

      setSuccessMessage('✓ Verification code bypassed! Entering Admin Portal...');
      setTimeout(() => {
        router.replace('/dashboard');
      }, 250);
    } catch {
      setErrorMessage('Network error during login. Please check server connection.');
      setLoading(false);
    }
  }

  // Step 1: Submit Admin Name & Email
  async function handleRequestCode(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!adminName.trim() || adminName.trim().length < 2) {
      setErrorMessage('Please enter your full Admin Name (at least 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid official Email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: adminName.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to generate verification code.');
        setLoading(false);
        return;
      }

      // Success: Proceed to Step 2
      setStep(2);
      setExpirySeconds(300);
      setCooldownSeconds(60);
      setOtp(['', '', '', '', '', '']);
      setRemainingAttempts(5);
      setSuccessMessage(data.message || 'Verification code dispatched to your email.');

      // Auto focus first OTP input box
      setTimeout(() => {
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0]?.focus();
        }
      }, 150);
    } catch {
      setErrorMessage('Network error while requesting verification code. Please check server connection.');
    } finally {
      setLoading(false);
    }
  }

  // Handle OTP digit changes
  function handleOtpChange(index: number, val: string) {
    const cleanDigit = val.replace(/\D/g, '').slice(-1);
    const updated = [...otp];
    updated[index] = cleanDigit;
    setOtp(updated);

    // Auto-advance
    if (cleanDigit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (cleanDigit && index === 5 && updated.every((d) => d.length === 1)) {
      handleVerifyCode(updated.join(''));
    }
  }

  // Handle Backspace navigation
  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  }

  // Handle Paste event (e.g. pasting 123456)
  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split('');
    const updated = [...otp];
    for (let i = 0; i < 6; i++) {
      updated[i] = digits[i] || '';
    }
    setOtp(updated);

    // Focus on the next empty or last box
    const nextEmptyIndex = updated.findIndex((d) => !d);
    if (nextEmptyIndex !== -1) {
      otpInputsRef.current[nextEmptyIndex]?.focus();
    } else {
      otpInputsRef.current[5]?.focus();
      handleVerifyCode(updated.join(''));
    }
  }

  // Step 2: Submit 6-digit Code for Server Validation
  async function handleVerifyCode(codeToSubmit?: string) {
    const code = codeToSubmit || otp.join('');
    setErrorMessage('');
    setSuccessMessage('');

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    if (expirySeconds <= 0) {
      setErrorMessage('Verification code has expired. Please request a fresh code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Verification failed.');
        if (typeof data.attemptsRemaining === 'number') {
          setRemainingAttempts(data.attemptsRemaining);
          if (data.attemptsRemaining === 0) {
            setOtp(['', '', '', '', '', '']);
          }
        }
        setLoading(false);
        return;
      }

      // Success!
      setSuccessMessage('Code verified successfully. Loading Admin Portal...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 600);
    } catch {
      setErrorMessage('Network error during code verification. Please try again.');
      setLoading(false);
    }
  }

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Masked email for display
  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => `${a}${'*'.repeat(Math.max(b.length, 3))}${c}`)
    : '';

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: '#f8fafc' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '36px 30px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: '1.6rem', marginBottom: '12px' }}>
            🛡️
          </div>
          <br />
          <span className="glass-pill" style={{ marginBottom: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }} />
            Antigravity · Admin Security
          </span>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 4px' }}>
            {step === 1 ? 'Admin Portal Authentication' : 'Enter Verification Code'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
            {step === 1
              ? 'Authorized staff access for Sarvottam CBT Examination Engine.'
              : `A 6-digit one-time code was sent to ${maskedEmail}`}
          </p>
        </div>

        {/* Dynamic Alerts */}
        {errorMessage && (
          <div className="alert-box alert-error" role="alert">
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <div>{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="alert-box alert-success" role="status">
            <span style={{ fontSize: '1.1rem' }}>✓</span>
            <div>{successMessage}</div>
          </div>
        )}

        {/* STEP 1: Admin Name & Email Entry */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); handleDirectLogin(); }}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="adminNameInput">
                <span>Admin Full Name <span style={{ color: '#2563eb' }}>*</span></span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Administrator Identity</span>
              </label>
              <input
                id="adminNameInput"
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Rajesh Verma"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="adminEmailInput">
                <span>Official Email Address <span style={{ color: '#2563eb' }}>*</span></span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Admin Account Email</span>
              </label>
              <input
                id="adminEmailInput"
                type="email"
                className="form-input"
                placeholder="e.g. admin@sarvottam.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Primary Sign In Button (Bypasses Mail Verification) */}
            <button type="submit" className="btn-gold-primary" disabled={loading} style={{ marginBottom: '12px' }}>
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span>Signing In (Bypassing Code)...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal (Bypass Code)</span>
                  <span>⚡</span>
                </>
              )}
            </button>

            {/* 1-Click Instant Access Shortcut */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => handleDirectLogin('Chief Administrator', 'admin@sarvottam.ac.in')}
                disabled={loading}
                style={{
                  flex: 1,
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#047857',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>⚡ 1-Click Instant Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleRequestCode()}
                disabled={loading}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
                title="Send a 6-digit OTP code to email"
              >
                ✉️ Send OTP Code
              </button>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.76rem', color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              ⚡ <strong style={{ color: '#0f172a' }}>Verification Code Bypass Active:</strong> Click <em>Sign In</em> or <em>1-Click Instant Access</em> to enter the dashboard immediately without email verification.
            </div>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Verification Entry */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.84rem', marginBottom: '14px' }}>
              <span style={{ color: '#64748b' }}>Admin: <strong style={{ color: '#0f172a' }}>{adminName}</strong></span>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Change Email
              </button>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="otp-inputs-grid" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpInputsRef.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-box-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  disabled={loading || expirySeconds <= 0}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {/* Timers & Attempts Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#64748b', margin: '14px 4px 18px' }}>
              <div>
                Code expires in: <strong style={{ color: expirySeconds < 60 ? '#dc2626' : '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>{formatTime(expirySeconds)}</strong>
              </div>
              {remainingAttempts !== null && (
                <div style={{ color: remainingAttempts <= 2 ? '#dc2626' : '#64748b', fontSize: '0.78rem' }}>
                  {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} left
                </div>
              )}
            </div>

            {/* Verify CTA */}
            <button
              type="button"
              className="btn-gold-primary"
              onClick={() => handleVerifyCode()}
              disabled={loading || otp.join('').length !== 6 || expirySeconds <= 0}
              style={{ marginBottom: '10px' }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span>Verifying Code Server-Side...</span>
                </>
              ) : (
                <>
                  <span>Verify Code &amp; Access Dashboard</span>
                  <span>→</span>
                </>
              )}
            </button>

            {/* Bypass Button in Step 2 */}
            <button
              type="button"
              onClick={() => handleDirectLogin()}
              disabled={loading}
              style={{
                width: '100%',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '10px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '10px'
              }}
            >
              <span>⚡ Bypass Code &amp; Enter Dashboard Now</span>
            </button>

            {/* Resend Code Button */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => handleRequestCode()}
                disabled={loading || cooldownSeconds > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: cooldownSeconds > 0 ? '#94a3b8' : '#2563eb',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: cooldownSeconds > 0 ? 'not-allowed' : 'pointer',
                  textDecoration: cooldownSeconds > 0 ? 'none' : 'underline',
                }}
              >
                {cooldownSeconds > 0 ? `Resend Code in ${cooldownSeconds}s` : 'Resend Verification Code'}
              </button>
            </div>
          </div>
        )}

      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
