import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, ArrowLeft, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          navigate('/store/dashboard');
        } else if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/upload');
        }
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Please check your network or credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 sm:py-20 text-center">
      
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
        
        {/* Glowing Heart Icon */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0071E3]/20 to-[#0071E3]/5 text-[#0071E3] dark:text-[#2997FF] shadow-sm mb-6 mx-auto ring-1 ring-[#0071E3]/20">
          <div className="absolute inset-0 bg-[#0071E3]/15 blur-xl rounded-full" />
          <HeartPulse className="w-7 h-7 relative z-10" />
        </div>

        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
            Get help, fast.
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
            Sign in to broadcast or respond to emergency prescriptions.
          </p>
        </div>

        {error && (
          <div className="mt-5 p-3.5 rounded-r-[14px] bg-[#FF3B30]/5 border-l-4 border-l-[#FF3B30] text-[#FF3B30] text-xs text-left flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 stroke-[2]" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4 text-left animate-fade-in">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

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

        {/* Panicked User Immediate Action */}
        <div className="mt-6">
          <Link
            to="/upload"
            className="text-xs text-[#0071E3] dark:text-[#2997FF] hover:underline"
          >
            In an emergency? Upload a prescription right away →
          </Link>
        </div>

        {/* 1-Click Demo Fill */}
        <div className="mt-8 pt-6 hairline-t border-[#D2D2D7] dark:border-[#333336]">
          <p className="text-[11px] font-semibold text-[#6E6E73] dark:text-[#86868B] uppercase tracking-wider mb-2.5">
            Demo Accounts
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('patient@medemergency.com', 'Password@123')}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#3A3A3C] active:scale-[0.98] transition-all"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('store1@medemergency.com', 'Password@123')}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#3A3A3C] active:scale-[0.98] transition-all"
            >
              Pharmacy
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('prathameshkshirsagar076@gmail.com', 'Vaishu@2007')}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#3A3A3C] active:scale-[0.98] transition-all"
            >
              Admin
            </button>
          </div>

          <div className="mt-6 text-xs text-[#6E6E73] dark:text-[#86868B]">
            Don't have an account?{' '}
            <Link to="/patient/login" className="text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline">
              Create one
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
