import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Store, Shield, ArrowLeft, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function StoreLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'store') {
          if (res.user.store && res.user.store.is_approved === false) {
            navigate('/store/pending-approval');
          } else {
            navigate('/store/dashboard');
          }
        } else if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/upload');
        }
      } else {
        setError(res.message || 'Invalid email address or password.');
      }
    } catch (err) {
      console.error('Store login error:', err);
      setError(err.response?.data?.message || 'Unable to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotSent(true);
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
        
        {/* Crafted Brand Icon with Glowing Badge */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50/80 dark:bg-emerald-900/30 text-[#34C759] dark:text-[#30D158] shadow-sm mb-6 mx-auto ring-1 ring-[#34C759]/20">
          <div className="absolute inset-0 bg-[#34C759]/15 blur-xl rounded-full" />
          <Store className="w-7 h-7 relative z-10" />
        </div>

        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
            Medical Store Sign In
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
            Access your live emergency broadcast radar & incoming requests.
          </p>
        </div>

        {/* Refined Error Banner */}
        {error && (
          <div className="mt-5 p-3.5 rounded-r-[14px] bg-[#FF3B30]/5 border-l-4 border-l-[#FF3B30] text-[#FF3B30] text-xs text-left flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 stroke-[2]" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4 text-left animate-fade-in">
          <Input
            label="Email Address"
            type="email"
            placeholder="store@pharmacy.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#6E6E73] dark:text-[#86868B]">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotEmail(email);
                  setForgotSent(false);
                }}
                className="text-xs text-[#0071E3] dark:text-[#2997FF] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="accent"
              fullWidth
              loading={loading}
              className="bg-[#34C759] hover:bg-[#30D158] py-3.5"
            >
              Sign In to Live Feed
            </Button>
          </div>
        </form>

        {/* Demo Accounts Quick-Fill */}
        <div className="mt-8 pt-6 hairline-t border-[#D2D2D7] dark:border-[#333336] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-2.5">
            Pre-configured Demo Pharmacies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('store1@medemergency.com', 'Password@123')}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#3A3A3C] active:scale-[0.98] transition-all"
            >
              Apollo 24/7 (1.0km)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('store2@medemergency.com', 'Password@123')}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#3A3A3C] active:scale-[0.98] transition-all"
            >
              LifeCare (1.4km)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('store3@medemergency.com', 'Password@123')}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#3A3A3C] active:scale-[0.98] transition-all"
            >
              MedPlus (2.5km)
            </button>
          </div>

          <div className="mt-6 text-xs text-[#6E6E73] dark:text-[#86868B]">
            Need to register a new store?{' '}
            <Link to="/store/signup" className="text-[#34C759] dark:text-[#30D158] font-semibold hover:underline">
              Register Pharmacy →
            </Link>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-[24px] bg-white dark:bg-[#1C1C1E] shadow-2xl border border-[#E5E5EA] dark:border-[#2C2C2E] text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center mb-4">
              <KeyRound className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Reset Store Password
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-[#86868B] mt-1.5">
              Enter your pharmacy's registered email address to receive password reset instructions.
            </p>

            {forgotSent ? (
              <div className="mt-5 p-3.5 rounded-r-[14px] bg-[#34C759]/5 border-l-4 border-l-[#34C759] text-xs text-[#34C759] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>If an account exists for {forgotEmail}, password reset instructions have been dispatched.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-5 space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <Button type="submit" variant="accent" fullWidth size="md" className="py-3">
                  Send Reset Link
                </Button>
              </form>
            )}

            <div className="mt-5 pt-3 hairline-t border-[#D2D2D7] dark:border-[#333336] text-right">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-xs font-medium text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
