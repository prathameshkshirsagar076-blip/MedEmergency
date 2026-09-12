import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowLeft, AlertCircle, Lock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = () => {
    setEmail('prathameshkshirsagar076@gmail.com');
    setPassword('Vaishu@2007');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          setError('Access denied. This account does not possess administrator privileges.');
        }
      } else {
        setError(res.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || 'Unable to authenticate administrator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 sm:py-20">
      
      {/* Back Link */}
      <div className="w-full max-w-[440px] mb-4 flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to website</span>
        </Link>
      </div>

      {/* Main Elevated Card Container */}
      <div className="w-full max-w-[440px] bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-[24px] sm:rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-7 sm:p-10 text-center transition-all duration-200">
        
        {/* Crafted Lock Icon with Radial Glow */}
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm mb-6 mx-auto ring-1 ring-indigo-500/20">
          <div className="absolute inset-0 bg-indigo-500/15 blur-xl rounded-full" />
          <Lock className="w-6 h-6 relative z-10" />
        </div>

        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
            System Administration
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-1.5">
            Restricted portal for pharmacy verification, approvals & network supervision.
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
            label="Administrator Email"
            type="email"
            placeholder="prathameshkshirsagar076@gmail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Security Password"
            type="password"
            placeholder="••••••••"
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
              Sign In to Admin Portal
            </Button>
          </div>
        </form>

        {/* Demo Admin Auto-fill */}
        <div className="mt-8 pt-6 hairline-t border-[#D2D2D7] dark:border-[#333336] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-2.5">
            Administrator Credentials
          </p>
          <button
            type="button"
            onClick={handleDemoFill}
            className="px-3.5 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#3A3A3C] active:scale-[0.98] transition-all"
          >
            Fill Admin Credentials (prathameshkshirsagar076@gmail.com)
          </button>
        </div>

      </div>
    </div>
  );
}
