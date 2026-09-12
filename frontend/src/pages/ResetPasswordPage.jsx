import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from the URL. Please check your link.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError('Password must contain at least one number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email, token, newPassword);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link or code may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 sm:py-20 text-center">
      
      {/* Top Back Link */}
      <div className="w-full max-w-[440px] mb-4 flex justify-start">
        <Link
          to="/patient/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Sign In</span>
        </Link>
      </div>

      {/* Main Elevated Card Container */}
      <div className="w-full max-w-[440px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-[24px] sm:rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-7 sm:p-10 text-center transition-all duration-200">
        
        {/* Brand Key Icon with Radial Glow */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0071E3]/20 to-[#0071E3]/5 text-[#0071E3] dark:text-[#2997FF] shadow-sm mb-6 mx-auto ring-1 ring-[#0071E3]/20">
          <div className="absolute inset-0 bg-[#0071E3]/15 blur-xl rounded-full" />
          <KeyRound className="w-6 h-6 relative z-10" />
        </div>

        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
            Set new password
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
            Enter a secure password of at least 8 characters with at least one number.
          </p>
        </div>

        {error && (
          <div className="mt-5 p-3.5 rounded-r-[14px] bg-[#FF3B30]/5 border-l-4 border-l-[#FF3B30] text-[#FF3B30] text-xs text-left flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 stroke-[2]" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success ? (
          <div className="mt-7 p-6 rounded-[20px] bg-[#34C759]/5 border-l-4 border-l-[#34C759] text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[#34C759] text-white flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Password Reset Complete
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
            <div className="pt-2">
              <Button
                variant="accent"
                fullWidth
                onClick={() => navigate('/patient/login')}
                className="py-3.5"
              >
                Sign In Now
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4 text-left animate-fade-in">
            {!emailParam && (
              <Input
                label="Account Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            )}

            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters with a number"
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type your password"
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
          </form>
        )}

      </div>
    </div>
  );
}
