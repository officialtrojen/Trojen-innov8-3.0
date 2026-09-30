'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import LiveBackground from '@/components/LiveBackground';
import { Mail, KeyRound, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signInWithGoogle, sendOtp, verifyOtp } = useAuth();
  const router = useRouter();

  // Mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('otp');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // UI state
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle password login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Try sending via backend official.trojen@gmail.com transporter
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      // 2. Also trigger Supabase OTP
      await sendOtp(email);

      setOtpSent(true);
      setResendTimer(30);
      setSuccessMsg(`6-digit OTP code sent from official.trojen@gmail.com!`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setError('');
    setLoading(true);

    const { error: err } = await verifyOtp(email, otpCode);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err);
      setGoogleLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <LiveBackground />
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: 440,
            padding: 36,
            background: '#ffffff',
            borderRadius: 24,
            boxShadow: '0 24px 48px rgba(0,0,0,0.1)',
            border: '1px solid #E2E8F0',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #4F7C7A, #52796F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: 18,
                boxShadow: '0 4px 10px rgba(79,124,122,0.3)',
              }}
            >
              F
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#263B3B' }}>FormFlow</span>
          </Link>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#263B3B', marginBottom: 4 }}>
            Welcome to FormFlow
          </h1>
          <p style={{ color: '#52796F', fontSize: 13, marginBottom: 20 }}>
            Sign in to access your forms and workflow analytics.
          </p>

          {/* Feedback alerts */}
          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                color: '#166534',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {successMsg}
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              border: '1.5px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#1E293B',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: 16,
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </button>

          {/* Mode Selector Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#F1F5F9',
              padding: 4,
              borderRadius: 12,
              marginBottom: 20,
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setError('');
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s',
                background: authMode === 'otp' ? '#FFFFFF' : 'transparent',
                color: authMode === 'otp' ? '#4F7C7A' : '#64748B',
                boxShadow: authMode === 'otp' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <ShieldCheck size={14} />
              Email OTP Code
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setError('');
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s',
                background: authMode === 'password' ? '#FFFFFF' : 'transparent',
                color: authMode === 'password' ? '#4F7C7A' : '#64748B',
                boxShadow: authMode === 'password' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <KeyRound size={14} />
              Password
            </button>
          </div>

          {/* MODE 1: EMAIL OTP AUTHENTICATION */}
          {authMode === 'otp' && (
            <div>
              {!otpSent ? (
                /* Step 1: Request OTP */
                <form onSubmit={handleSendOtp}>
                  <div style={{ marginBottom: 18 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: 6,
                      }}
                    >
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. you@gmail.com"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: '1.5px solid #CBD5E1',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>
                      📩 OTP will be sent from <strong>official.trojen@gmail.com</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 12,
                      background: '#4F7C7A',
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {loading ? 'Sending OTP Code...' : 'Send 6-Digit OTP Code →'}
                  </button>
                </form>
              ) : (
                /* Step 2: Verify OTP */
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                        Enter 6-Digit Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        style={{ background: 'none', border: 'none', fontSize: 11, color: '#4F7C7A', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Change Email
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      autoFocus
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 12,
                        border: '2px solid #4F7C7A',
                        fontSize: 24,
                        fontWeight: 800,
                        letterSpacing: 8,
                        textAlign: 'center',
                        color: '#263B3B',
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: '#64748B' }}>
                        Sent to: <strong>{email}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={resendTimer > 0 || loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 12,
                          color: resendTimer > 0 ? '#94A3B8' : '#4F7C7A',
                          cursor: resendTimer > 0 ? 'default' : 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 12,
                      background: '#4F7C7A',
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      opacity: otpCode.length === 6 ? 1 : 0.6,
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify Code & Sign In ✓'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* MODE 2: PASSWORD AUTHENTICATION */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  background: '#4F7C7A',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In with Password'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#52796F' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#4F7C7A', fontWeight: 700, textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
