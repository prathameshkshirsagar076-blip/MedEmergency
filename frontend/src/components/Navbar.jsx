import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, PlusCircle, Activity, History, LogOut, LayoutDashboard, Store, User, ShieldCheck, HeartPulse } from 'lucide-react';
import Button from './ui/Button';

export default function Navbar() {
  const { user, logout, isPatient, isStore, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/select-role');
  };

  const getPrimaryDisplayName = () => {
    if (!user) return '';
    if (user.role === 'store') {
      return user.store?.store_name || user.name;
    }
    return user.name?.replace(/\s*\(Patient\)/i, '') || 'Patient';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border-b border-[#E1E7EA] dark:border-[#2C2C2E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#0071E3] flex items-center justify-center text-white shadow-subtle group-hover:bg-[#0077ED] transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Med<span className="text-[#0071E3] dark:text-[#2997FF]">Emergency</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-[#6E6E73] dark:text-[#86868B] font-semibold -mt-1 font-mono">
                Verified Medical Network
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {isPatient && (
              <>
                <Link
                  to="/upload"
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/upload'
                      ? 'bg-[#0071E3]/10 text-[#0071E3] font-bold'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-[#0071E3]" />
                  Find Medicine
                </Link>
                <Link
                  to="/patient/history"
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/patient/history'
                      ? 'bg-[#0071E3]/10 text-[#0071E3] font-bold'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-slate-50'
                  }`}
                >
                  <History className="w-4 h-4 text-[#6E6E73]" />
                  My Requests
                </Link>
              </>
            )}

            {isStore && (
              <>
                <Link
                  to="/store/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/store/dashboard'
                      ? 'bg-[#34C759]/10 text-[#34C759] font-bold'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-slate-50'
                  }`}
                >
                  <Activity className="w-4 h-4 text-[#34C759]" />
                  Emergency Feed
                </Link>
                <Link
                  to="/store/history"
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/store/history'
                      ? 'bg-[#34C759]/10 text-[#34C759] font-bold'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-slate-50'
                  }`}
                >
                  <History className="w-4 h-4 text-[#6E6E73]" />
                  History
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-indigo-500/10 text-indigo-600 font-bold'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                Admin Portal
              </Link>
            )}
          </nav>

          {/* User Status / Auth Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-2 bg-[#F5F5F7]/80 dark:bg-[#2C2C2E]/80 border border-[#E5E5EA] dark:border-[#3A3A3C] rounded-full pl-1.5 pr-3 py-1 shadow-2xs">
                  {user.role === 'store' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#34C759]/15 text-[#248A3D] dark:text-[#30D158] border border-[#34C759]/30">
                      <Store className="w-3 h-3 shrink-0" />
                      <span>Medical Store</span>
                    </span>
                  )}
                  {user.role === 'patient' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0071E3]/15 text-[#0071E3] dark:text-[#2997FF] border border-[#0071E3]/30">
                      <HeartPulse className="w-3 h-3 shrink-0" />
                      <span>Patient</span>
                    </span>
                  )}
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                      <ShieldCheck className="w-3 h-3 shrink-0" />
                      <span>Admin</span>
                    </span>
                  )}

                  <div className="flex flex-col text-left leading-tight pr-1">
                    <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate max-w-[130px] sm:max-w-[200px]">
                      {getPrimaryDisplayName()}
                    </span>
                    {user.role === 'store' && user.store?.store_name && (
                      <span className="text-[10px] text-[#6E6E73] dark:text-[#86868B] truncate max-w-[130px] sm:max-w-[200px]">
                        Owner: {user.name}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-[#6E6E73] hover:text-[#FF3B30] hover:bg-slate-100 dark:hover:bg-[#2C2C2E] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/select-role"
                  className="px-3.5 py-2 text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/select-role">
                  <Button variant="accent" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
