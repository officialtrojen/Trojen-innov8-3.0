'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import LiveBackground from '@/components/LiveBackground';
import {
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function SignUpPage() {
  const { signUpWithPasswordAndSendOtp, verifyOtp, signInWithGoogle, sendOtp } = useAuth();
  const router = useRouter();

  // Wizard Step: 'form' (enter name, email, pass) -> 'otp' (verify 6-digit code)
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const [redirectUrl, setRedirectUrl] = useState('/dashboard');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('redirect');
      if (r) {
        setRedirectUrl(r);
      }
      const urlError = params.get('error');
      if (urlError) {
        if (urlError === 'oauth_failed') {
          setError('Google sign-up could not be completed. Please try again.');
        } else {
          setError(decodeURIComponent(urlError));
        }
      }

      const handlePageShow = () => setGoogleLoading(false);
      window.addEventListener('pageshow', handlePageShow);
      return () => window.removeEventListener('pageshow', handlePageShow);
    }
  }, []);

  // Handle Step 1: Start Registration & Send OTP — optimistic: show OTP screen instantly
  const handleStartSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email || !email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters long.'); return; }

    setError('');
    // Switch to OTP step IMMEDIATELY — no waiting for API
    setStep('otp');
    setResendTimer(30);
    setSuccessMsg(`OTP sent to ${email}! Check your inbox.`);

    // Fire Supabase signup in background
    signUpWithPasswordAndSendOtp(name, email, password).then(({ error: signUpError }) => {
      if (signUpError) {
        // Revert to form if signup actually failed
        setStep('form');
        setResendTimer(0);
        setSuccessMsg('');
        setError(signUpError);
      }
    });
  };

  // Handle Step 2: Verify OTP and finalize signup
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    const { error: err } = await verifyOtp(email, otpCode);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);

    try {
      // Single Supabase call to resend
      const { error: otpErr } = await sendOtp(email);
      if (otpErr) {
        setError(otpErr);
        return;
      }
      setResendTimer(30);
      setSuccessMsg(`A new 6-digit code has been sent to ${email}`);
    } catch (err: any) {
      setError('Failed to resend OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth
  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    const { error: err } = await signInWithGoogle(redirectUrl);
    if (err) {
      setError(err);
      setGoogleLoading(false);
    }
    // Note: Do not navigate manually. signInWithGoogle initiates redirect to Google consent screen.
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
            maxWidth: 460,
            padding: 38,
            background: 'rgba(8, 12, 20, 0.72)',
            backdropFilter: 'blur(20px)',
            borderRadius: 20,
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
          }}
        >
          {/* Header Brand */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link
                href="/"
                title="Back to home"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#94A3B8',
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94A3B8'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </Link>
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
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
            </div>

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#C084FC',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                padding: '4px 10px',
                borderRadius: 20,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              OTP + Password
            </span>
          </div>

          {/* Feedback Messages */}
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
                lineHeight: 1.4,
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
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} color="#6EE7B7" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === 'form' && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
                Create your account
              </h1>
              <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 20 }}>
                Sign up with email OTP verification & password.
              </p>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
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
                  marginBottom: 16,
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
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
                {googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.15)' }} />
                <span style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                  or create with email
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.15)' }} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleStartSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Full Name */}
                <div>
                  <label htmlFor="name" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon
                      size={16}
                      color="#94A3B8"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
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
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      color="#94A3B8"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
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
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
                    Set Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      color="#94A3B8"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 40px',
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
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: 4,
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, display: 'block' }}>
                    You can log in with this password OR via OTP anytime!
                  </span>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    marginTop: 8,
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <span className="spinner" />
                  ) : (
                    <>
                      <span>Verify Email & Create Account</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Enter 6-digit OTP */}
          {step === 'otp' && (
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#C084FC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                }}
              >
                <ShieldCheck size={26} />
              </div>

              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
                Enter verification code
              </h1>
              <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
                We sent a 6-digit OTP code to <strong style={{ color: '#FFFFFF' }}>{email}</strong> from{' '}
                <strong style={{ color: '#C084FC' }}>official.trojen@gmail.com</strong>.
              </p>

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label htmlFor="otp-signup" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                    Security OTP Code
                  </label>
                  <input
                    id="otp-signup"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="••••••"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 14,
                      border: '2px solid #8B5CF6',
                      fontSize: otpCode.length > 6 ? 22 : 26,
                      fontWeight: 800,
                      letterSpacing: otpCode.length > 6 ? 6 : 10,
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      outline: 'none',
                      background: '#0F172A',
                      color: '#FFFFFF',
                    }}
                  />
                </div>

                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    fontSize: 12.5,
                    color: '#6EE7B7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Sparkles size={16} />
                  <span>Your password is set and will be activated once OTP is verified!</span>
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
                  {loading ? (
                    <span className="spinner" />
                  ) : (
                    <>
                      <span>Verify & Complete Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('form');
                      setError('');
                      setSuccessMsg('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Edit details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendTimer > 0 ? '#64748B' : '#C084FC',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>{resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend code'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer Link */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#94A3B8' }}>
            Already have an account?{' '}
            <Link
              href={redirectUrl !== '/dashboard' ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
              style={{ color: '#C084FC', fontWeight: 700, textDecoration: 'none' }}
            >
              Sign in with Password or OTP
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
