import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { HeartPulse, AlertCircle, ArrowLeft, Loader2, CheckCircle2, Mail, KeyRound, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import OtpInput from '../../components/ui/OtpInput';

export default function PatientLoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [signupStep, setSignupStep] = useState(1); // 1: Form, 2: OTP Verification
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP Verification, 3: New Password
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // Cooldown timers
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    loginWithGoogle,
    patientLogin,
    patientSignup,
    verifySignupOtp,
    resendSignupOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
  } = useAuth();
  const navigate = useNavigate();

  const isGoogleConfigured = Boolean(
    import.meta.env.VITE_GOOGLE_CLIENT_ID && 
    !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('placeholder')
  );

  // Cooldown countdown effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // 1. Google Auth Handlers
  const handleGoogleSuccess = async (codeResponse) => {
    setError('');
    setLoading(true);
    try {
      const res = await loginWithGoogle(codeResponse.code);
      if (res.success) {
        navigate('/upload');
      } else {
        setError(res.message || 'Google sign-in failed. Please try again.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(
        err.response?.data?.message ||
        'Unable to complete Google authentication. Please check your connection and retry.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (errorResponse) => {
    console.error('Google login error:', errorResponse);
    setError('Google Sign-In was cancelled or encountered an issue. Please try again.');
    setLoading(false);
  };

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  // 2. Email + Password Login Handler
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await patientLogin(email, password);
      if (res.success) {
        navigate('/upload');
      } else {
        setError(res.message || 'Invalid email address or password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error signing in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 3a. Signup Step 1: Submit Form -> Sends OTP
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/\d/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await patientSignup(name, email, password);
      if (res.success) {
        setSignupStep(2);
        setOtp('');
        setResendCooldown(30);
        setSuccessMsg(`We've sent a 6-digit verification code to ${email.toLowerCase().trim()}`);
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate signup.');
    } finally {
      setLoading(false);
    }
  };

  // 3b. Signup Step 2: Verify Signup OTP
  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifySignupOtp(email.toLowerCase().trim(), cleanOtp);
      if (res.success) {
        navigate('/upload');
      } else {
        setError(res.message || 'Invalid or expired verification code.');
        setOtp('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  // 3c. Resend Signup OTP
  const handleResendSignupOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const res = await resendSignupOtp(email.toLowerCase().trim());
      if (res.success) {
        setResendCooldown(30);
        setSuccessMsg('A fresh verification code has been sent to your email.');
      } else {
        setError(res.message || 'Failed to resend verification code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error resending code.');
    } finally {
      setResending(false);
    }
  };

  // 4a. Forgot Password Step 1: Send Reset Code
  const handleForgotSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your email address to reset password.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.toLowerCase().trim());
      if (res.success) {
        setForgotStep(2);
        setOtp('');
        setResendCooldown(30);
        setSuccessMsg(`We've sent a 6-digit verification code to ${email.toLowerCase().trim()}`);
      } else {
        setError(res.message || 'Error processing password reset request.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  // 4b. Forgot Password Step 2: Verify Code
  const handleForgotVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyResetOtp(email.toLowerCase().trim(), cleanOtp);
      if (res.success) {
        setForgotStep(3);
        setSuccessMsg('Code verified! Please create your new password.');
      } else {
        setError(res.message || 'Invalid or expired verification code.');
        setOtp('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  // 4c. Forgot Password Step 3: Set New Password
  const handleForgotSetNewPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError('Password must contain at least one number.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email.toLowerCase().trim(), otp.trim(), newPassword);
      if (res.success) {
        switchMode('login');
        setPassword('');
        setSuccessMsg('Password has been reset successfully! Please sign in with your new password.');
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  // Switch modes and reset all sub-states
  const switchMode = (newMode) => {
    setMode(newMode);
    setSignupStep(1);
    setForgotStep(1);
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 sm:py-20">
      
      {/* Top Back Link */}
      <div className="w-full max-w-[440px] mb-4 flex justify-start">
        <Link
          to="/select-role"
          className="inline-flex items-center gap-1.5 text-xs text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to role selection</span>
        </Link>
      </div>

      {/* Main Elevated Card Container */}
      <div className="w-full max-w-[440px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-[24px] sm:rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-7 sm:p-10 text-center transition-all duration-200">
        
        {/* Crafted Brand Icon with Soft Radial Glow */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0071E3]/20 to-[#0071E3]/5 text-[#0071E3] dark:text-[#2997FF] shadow-sm mb-6 mx-auto ring-1 ring-[#0071E3]/20">
          <div className="absolute inset-0 bg-[#0071E3]/15 blur-xl rounded-full" />
          {mode === 'forgot' ? (
            <KeyRound className="w-6 h-6 relative z-10" />
          ) : (mode === 'signup' && signupStep === 2) ? (
            <Mail className="w-6 h-6 relative z-10" />
          ) : (
            <HeartPulse className="w-6 h-6 relative z-10" />
          )}
        </div>

        {/* Dynamic Headings */}
        {mode === 'login' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
              Sign in to get help fast.
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
              Zero friction in an emergency. Sign in securely with Google or email.
            </p>
          </div>
        )}

        {mode === 'signup' && signupStep === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
              Create patient account.
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
              Save your prescription broadcasts and emergency order history.
            </p>
          </div>
        )}

        {mode === 'signup' && signupStep === 2 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
              Verify your email.
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
              Enter the 6-digit code we sent to <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{email}</span>
            </p>
          </div>
        )}

        {mode === 'forgot' && forgotStep === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
              Reset your password.
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
              Enter your registered email and we'll send a 6-digit verification code.
            </p>
          </div>
        )}

        {mode === 'forgot' && forgotStep === 2 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
              Check your email.
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
              Enter the 6-digit code we sent to <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{email}</span>
            </p>
          </div>
        )}

        {mode === 'forgot' && forgotStep === 3 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
              Set new password.
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
              Choose a strong password with at least 8 characters and a number.
            </p>
          </div>
        )}

        {/* Refined Error Banner (Left 4px Accent Border) */}
        {error && (
          <div className="mt-5 p-3.5 rounded-r-[14px] bg-[#FF3B30]/5 border-l-4 border-l-[#FF3B30] text-[#FF3B30] text-xs text-left flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 stroke-[2]" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Refined Success Banner (Left 4px Accent Border) */}
        {successMsg && (
          <div className="mt-5 p-3.5 rounded-r-[14px] bg-[#34C759]/5 border-l-4 border-l-[#34C759] text-[#34C759] text-xs text-left flex items-start gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 stroke-[2]" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* MODE 1: LOGIN */}
        {mode === 'login' && (
          <div className="mt-7 space-y-5 animate-fade-in">
            
            {/* Google Sign-in Button */}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (isGoogleConfigured) {
                    googleLogin();
                  } else {
                    setError('Google Client ID is not configured yet in frontend/.env. Set VITE_GOOGLE_CLIENT_ID or use Email Sign In below.');
                  }
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-[14px] bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] border border-[#D2D2D7] dark:border-[#3E3E42] shadow-sm hover:bg-[#F5F5F7] dark:hover:bg-[#3A3A3C] active:scale-[0.98] transition-all font-medium text-sm disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#0071E3]" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{loading ? 'Verifying with Google...' : 'Continue with Google'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[#D2D2D7] dark:border-[#333336] w-full" />
              <span className="bg-white dark:bg-[#1C1C1E] px-3 text-[11px] text-[#6E6E73] dark:text-[#86868B] font-semibold uppercase tracking-wider relative">
                or sign in with email
              </span>
              <div className="border-t border-[#D2D2D7] dark:border-[#333336] w-full" />
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-[#6E6E73] dark:text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="accent"
                  fullWidth
                  loading={loading}
                  className="py-3.5"
                >
                  Sign In
                </Button>
              </div>
            </form>

            <div className="text-xs text-[#6E6E73] dark:text-[#86868B] pt-2">
              New to MedEmergency?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline"
              >
                Create an account
              </button>
            </div>

          </div>
        )}

        {/* MODE 2: SIGNUP (2-Step In-Page Flow) */}
        {mode === 'signup' && (
          <div className="mt-7 space-y-5 animate-fade-in">
            
            {/* STEP 1: Registration Form */}
            {signupStep === 1 && (
              <form onSubmit={handleEmailSignup} className="space-y-4 text-left">
                <Input
                  label="Full Name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />

                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters with a number"
                  />
                  <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] block mt-1">
                    Must be at least 8 characters and include a number.
                  </span>
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                />

                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="accent"
                    fullWidth
                    loading={loading}
                    className="py-3.5"
                  >
                    Create Patient Account
                  </Button>
                </div>

                <div className="text-xs text-[#6E6E73] dark:text-[#86868B] pt-2 text-center">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: OTP Verification */}
            {signupStep === 2 && (
              <form onSubmit={handleVerifySignupOtp} className="space-y-6 text-left animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider mb-3 text-center">
                    Enter 6-Digit Code
                  </label>
                  
                  {/* Premium 6-Box OTP Input */}
                  <OtpInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={loading}
                    error={Boolean(error)}
                    autoFocus={true}
                  />

                  <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] block mt-2 text-center">
                    Check your email inbox and spam/junk folder.
                  </span>
                </div>

                <div>
                  <Button
                    type="submit"
                    variant="accent"
                    fullWidth
                    loading={loading}
                    disabled={otp.length !== 6}
                    className="py-3.5"
                  >
                    Verify & Create Account
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-3 pt-2 text-xs">
                  {/* Resend button with 30s cooldown */}
                  <div className="text-[#6E6E73] dark:text-[#86868B]">
                    Didn't receive the code?{' '}
                    {resendCooldown > 0 ? (
                      <span className="text-[#86868B] font-medium">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendSignupOtp}
                        disabled={resending}
                        className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline disabled:opacity-50"
                      >
                        {resending ? 'Sending...' : 'Resend code'}
                      </button>
                    )}
                  </div>

                  {/* Wrong email back link */}
                  <button
                    type="button"
                    onClick={() => {
                      setSignupStep(1);
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
                  >
                    Wrong email? Go back
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* MODE 3: FORGOT PASSWORD (3-Step In-Page Flow) */}
        {mode === 'forgot' && (
          <div className="mt-7 space-y-5 animate-fade-in">
            
            {/* STEP 1: Enter Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotSendCode} className="space-y-4 text-left animate-fade-in">
                <Input
                  label="Registered Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />

                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="accent"
                    fullWidth
                    loading={loading}
                    className="py-3.5"
                  >
                    Send Reset Code
                  </Button>
                </div>

                <div className="text-xs text-[#6E6E73] dark:text-[#86868B] pt-2 text-center">
                  Remembered your password?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline"
                  >
                    Back to Sign in
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter 6-Digit OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleForgotVerifyCode} className="space-y-6 text-left animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider mb-3 text-center">
                    Enter 6-Digit Verification Code
                  </label>

                  {/* 6-Box OTP Input */}
                  <OtpInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={loading}
                    error={Boolean(error)}
                    autoFocus={true}
                  />

                  <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] block mt-2 text-center">
                    Check your email inbox or spam folder for your code.
                  </span>
                </div>

                <div>
                  <Button
                    type="submit"
                    variant="accent"
                    fullWidth
                    loading={loading}
                    disabled={otp.length !== 6}
                    className="py-3.5"
                  >
                    Verify Code
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-3 pt-2 text-xs">
                  {/* Resend button with 30s cooldown */}
                  <div className="text-[#6E6E73] dark:text-[#86868B]">
                    Didn't receive the code?{' '}
                    {resendCooldown > 0 ? (
                      <span className="text-[#86868B] font-medium">
                        Resend code in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleForgotSendCode}
                        disabled={loading}
                        className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline disabled:opacity-50"
                      >
                        Resend code
                      </button>
                    )}
                  </div>

                  {/* Wrong email back link */}
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
                  >
                    Wrong email? Go back
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Set New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleForgotSetNewPassword} className="space-y-4 text-left animate-fade-in">
                <div>
                  <Input
                    label="New Password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters with a number"
                  />
                  <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] block mt-1">
                    Must be at least 8 characters and include a number.
                  </span>
                </div>

                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />

                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="accent"
                    fullWidth
                    loading={loading}
                    className="py-3.5"
                  >
                    Reset Password
                  </Button>
                </div>

                <div className="text-xs text-[#6E6E73] dark:text-[#86868B] pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
                  >
                    Cancel and return to Sign In
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* Footer Medical Store Link */}
        <div className="mt-8 pt-6 hairline-t border-[#D2D2D7] dark:border-[#333336]">
          <div className="text-xs text-[#6E6E73] dark:text-[#86868B]">
            Are you a pharmacy owner?{' '}
            <Link to="/store/login" className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline">
              Medical Store Portal
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
