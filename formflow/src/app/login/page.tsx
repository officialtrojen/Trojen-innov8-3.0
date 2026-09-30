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
      window.location.href = '/dashboard';
    }
  };

  // Handle Send OTP — optimistic: switch to OTP screen instantly, send in background
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    // Switch to OTP screen IMMEDIATELY — no waiting for API
    setOtpSent(true);
    setResendTimer(30);
    setSuccessMsg(`OTP sent to ${email}! Check your inbox.`);

    // Fire API in background
    sendOtp(email).then(({ error: otpErr }) => {
      if (otpErr) {
        // Revert if API actually failed
        setOtpSent(false);
        setResendTimer(0);
        setSuccessMsg('');
        setError(otpErr);
      }
    });
  };

  // Handle Verify OTP — show loading instantly, verify then navigate
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setError('');
    setLoading(true); // Show loading immediately

    const { error: err } = await verifyOtp(email, otpCode);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
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
      window.location.href = '/dashboard';
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
          style={{
            width: '100%',
            maxWidth: 440,
            padding: 36,
            background: 'rgba(8, 12, 20, 0.72)',
            backdropFilter: 'blur(20px)',
            borderRadius: 20,
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
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
                width: 34,
                height: 34,
                borderRadius: 9,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E2E8F0',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: '#FFFFFF' }}>FormFlow</span>
          </Link>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
            Welcome to FormFlow
          </h1>
          <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24 }}>
            Sign in to access your forms and workflow analytics.
          </p>

          {/* Feedback alerts */}
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#FCA5A5',
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
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6EE7B7',
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
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: 20,
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
              background: '#0B0F19',
              padding: 4,
              borderRadius: 12,
              marginBottom: 20,
              gap: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s',
                background: authMode === 'otp' ? '#8B5CF6' : 'transparent',
                color: authMode === 'otp' ? '#FFFFFF' : '#94A3B8',
                boxShadow: authMode === 'otp' ? '0 2px 8px rgba(139, 92, 246, 0.4)' : 'none',
              }}
            >
              <ShieldCheck size={15} />
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
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s',
                background: authMode === 'password' ? '#8B5CF6' : 'transparent',
                color: authMode === 'password' ? '#FFFFFF' : '#94A3B8',
                boxShadow: authMode === 'password' ? '0 2px 8px rgba(139, 92, 246, 0.4)' : 'none',
              }}
            >
              <KeyRound size={15} />
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
                        fontWeight: 700,
                        color: '#FFFFFF',
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
                        border: '1.5px solid rgba(139, 92, 246, 0.4)',
                        fontSize: 14,
                        color: '#FFFFFF',
                        backgroundColor: '#0F172A',
                        caretColor: '#A855F7',
                        outline: 'none',
                        cursor: 'text',
                      }}
                    />
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
                      📩 OTP will be sent from <strong style={{ color: '#C084FC' }}>official.trojen@gmail.com</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
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
                      <label style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                        Enter 6-Digit Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        style={{ background: 'none', border: 'none', fontSize: 12, color: '#C084FC', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Change Email
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={8}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="••••••"
                      autoFocus
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 12,
                        border: '2px solid #8B5CF6',
                        fontSize: otpCode.length > 6 ? 20 : 24,
                        fontWeight: 800,
                        letterSpacing: otpCode.length > 6 ? 5 : 8,
                        textAlign: 'center',
                        color: '#FFFFFF',
                        backgroundColor: '#0F172A',
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>
                        Sent to: <strong style={{ color: '#FFFFFF' }}>{email}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={resendTimer > 0 || loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 12,
                          color: resendTimer > 0 ? '#64748B' : '#C084FC',
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
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: otpCode.length >= 6 && !loading ? 'pointer' : 'not-allowed',
                      opacity: otpCode.length >= 6 ? 1 : 0.6,
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
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1.5px solid rgba(139, 92, 246, 0.4)',
                    fontSize: 14,
                    color: '#FFFFFF',
                    backgroundColor: '#0F172A',
                    caretColor: '#A855F7',
                    outline: 'none',
                    cursor: 'text',
                  }}
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1.5px solid rgba(139, 92, 246, 0.4)',
                    fontSize: 14,
                    color: '#FFFFFF',
                    backgroundColor: '#0F172A',
                    caretColor: '#A855F7',
                    outline: 'none',
                    cursor: 'text',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Signing in...' : 'Sign In with Password'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#94A3B8' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#C084FC', fontWeight: 700, textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
