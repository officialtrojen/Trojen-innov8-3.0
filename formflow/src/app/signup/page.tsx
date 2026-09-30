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
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SignupPage() {
  const { signUp, signInWithGoogle, sendOtp, verifyOtpAndSetPassword } = useAuth();
  const router = useRouter();

  // Steps: 'form' | 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // UI States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown for resending OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 1: Submit Form to initiate Signup + Send OTP
  const handleStartSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // 1. Try initial Supabase signup
      const { session, error: err } = await signUp(email, password, name);

      if (err) {
        // If user already exists in Supabase
        if (err.toLowerCase().includes('already registered')) {
          setError('An account with this email already exists. Please log in or use OTP login.');
          setLoading(false);
          return;
        }
        // If standard signup failed due to email provider settings, trigger OTP fallback
        await sendOtp(email);
      }

      // If Supabase immediately issued a session (email confirmation turned off in project)
      if (session) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        router.push('/dashboard');
        return;
      }

      // 2. Also trigger official.trojen@gmail.com notifier if available
      try {
        fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch(() => {});
      } catch (_) {}

      // Transition to OTP verification step
      setStep('otp');
      setResendTimer(30);
      setSuccessMsg(`We sent a 6-digit verification code to ${email}`);
    } catch (exc: any) {
      setError(exc.message || 'Failed to start signup process');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Activate Password
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    const { error: verifyErr } = await verifyOtpAndSetPassword(
      email,
      otpCode.trim(),
      password,
      name
    );

    if (verifyErr) {
      setError(verifyErr);
      setLoading(false);
    } else {
      setSuccessMsg('Account verified! Welcome to FormFlow.');
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (_) {}

      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);

    try {
      await sendOtp(email);
      try {
        await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (_) {}

      setResendTimer(30);
      setSuccessMsg(`A new 6-digit code has been sent to ${email}`);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Signup
  const handleGoogleSignUp = async () => {
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
            maxWidth: 460,
            padding: 38,
            background: '#ffffff',
            borderRadius: 24,
            boxShadow: '0 24px 48px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
          }}
        >
          {/* Header Brand */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
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

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#4F7C7A',
                background: '#E8F3F1',
                padding: '4px 10px',
                borderRadius: 20,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              Option 2 &bull; OTP + Pass
            </span>
          </div>

          {/* Feedback Messages */}
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
                lineHeight: 1.4,
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
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} color="#166534" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: Registration Form with Name, Email & Password                     */}
          {/* ========================================================================= */}
          {step === 'form' && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#263B3B', marginBottom: 4 }}>
                Create your account
              </h1>
              <p style={{ color: '#52796F', fontSize: 13, marginBottom: 20 }}>
                Sign up with email OTP verification. Set your password now so you can login with either in the future!
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
                  padding: '11px 16px',
                  borderRadius: 12,
                  border: '1.5px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#1E293B',
                  fontSize: 13.5,
                  fontWeight: 600,
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
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                <span style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                  or create with email
                </span>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleStartSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Full Name */}
                <div>
                  <label htmlFor="name" style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon
                      size={16}
                      color="#94A3B8"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
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
                        padding: '11px 14px 11px 40px',
                        borderRadius: 12,
                        border: '1.5px solid #CBD5E1',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'border 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#4F7C7A')}
                      onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      color="#94A3B8"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
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
                        padding: '11px 14px 11px 40px',
                        borderRadius: 12,
                        border: '1.5px solid #CBD5E1',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'border 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#4F7C7A')}
                      onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Set Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      color="#94A3B8"
                      style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
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
                        padding: '11px 40px 11px 40px',
                        borderRadius: 12,
                        border: '1.5px solid #CBD5E1',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'border 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#4F7C7A')}
                      onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
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
                  <span style={{ fontSize: 11.5, color: '#64748B', marginTop: 4, display: 'block' }}>
                    You can log in with this password OR via OTP anytime!
                  </span>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 8,
                    width: '100%',
                    padding: '12px',
                    borderRadius: 12,
                    background: '#4F7C7A',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 700,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(79,124,122,0.3)',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#3D6160')}
                  onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4F7C7A')}
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

          {/* ========================================================================= */}
          {/* STEP 2: Enter 6-digit OTP to complete registration & set password         */}
          {/* ========================================================================= */}
          {step === 'otp' && (
            <div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: '#E8F3F1',
                  color: '#4F7C7A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <ShieldCheck size={26} />
              </div>

              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#263B3B', marginBottom: 6 }}>
                Enter verification code
              </h1>
              <p style={{ color: '#52796F', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
                We sent a 6-digit OTP code to <strong style={{ color: '#263B3B' }}>{email}</strong> from{' '}
                <strong style={{ color: '#4F7C7A' }}>official.trojen@gmail.com</strong>.
              </p>

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label htmlFor="otp-signup" style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                    6-Digit Security OTP
                  </label>
                  <input
                    id="otp-signup"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 14,
                      border: '2px solid #4F7C7A',
                      fontSize: 26,
                      fontWeight: 800,
                      letterSpacing: 10,
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      outline: 'none',
                      background: '#F8FAFC',
                      color: '#263B3B',
                    }}
                  />
                </div>

                {/* Password confirmation reminder */}
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: 12,
                    padding: '10px 14px',
                    fontSize: 12,
                    color: '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Sparkles size={16} />
                  <span>Your password is primed and will be saved as soon as OTP is confirmed!</span>
                </div>

                {/* Submit OTP */}
                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    background: otpCode.length === 6 ? '#4F7C7A' : '#94A3B8',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 700,
                    border: 'none',
                    cursor: otpCode.length === 6 && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: otpCode.length === 6 ? '0 4px 12px rgba(79,124,122,0.3)' : 'none',
                    transition: 'all 0.2s',
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

                {/* Resend & Back buttons */}
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
                      color: '#64748B',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Edit email / password</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendTimer > 0 ? '#94A3B8' : '#4F7C7A',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>{resendTimer > 0 ? `Resend code (${resendTimer}s)` : 'Resend code'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer Link */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13.5, color: '#52796F' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#4F7C7A', fontWeight: 700, textDecoration: 'none' }}>
              Sign in with Password or OTP
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
