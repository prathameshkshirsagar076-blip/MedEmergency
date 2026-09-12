import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Moon, Sun, Store, User, ShieldCheck, HeartPulse } from 'lucide-react';
import Button from './Button';

export default function FrostedHeader() {
  const { user, logout, isPatient, isStore, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('med_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('med_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('med_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/select-role');
  };

  // Primary display name calculation
  const getPrimaryDisplayName = () => {
    if (!user) return '';
    if (user.role === 'store') {
      return user.store?.store_name || user.name;
    }
    return user.name?.replace(/\s*\(Patient\)/i, '') || 'Patient';
  };

  return (
    <header className="sticky top-0 z-40 frosted-glass hairline-b transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Brand Link */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <Shield className="w-5 h-5 text-[#0071E3] dark:text-[#2997FF]" />
          <span className="text-base font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            MedEmergency
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          {!user && (
            <>
              <a
                href="/#how-it-works"
                className="text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
              >
                How it works
              </a>
              <a
                href="/#for-stores"
                className="text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
              >
                For Medical Stores
              </a>
              <a
                href="/#about"
                className="text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
              >
                About
              </a>
            </>
          )}

          {isPatient && (
            <>
              <Link
                to="/upload"
                className={`transition-colors ${
                  location.pathname === '/upload'
                    ? 'text-[#0071E3] dark:text-[#2997FF] font-medium'
                    : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                Upload Prescription
              </Link>
              <Link
                to="/patient/history"
                className={`transition-colors ${
                  location.pathname === '/patient/history'
                    ? 'text-[#0071E3] dark:text-[#2997FF] font-medium'
                    : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                My Requests
              </Link>
            </>
          )}

          {isStore && (
            <>
              <Link
                to="/store/dashboard"
                className={`transition-colors ${
                  location.pathname === '/store/dashboard'
                    ? 'text-[#0071E3] dark:text-[#2997FF] font-medium'
                    : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                Live Feed
              </Link>
              <Link
                to="/store/history"
                className={`transition-colors ${
                  location.pathname === '/store/history'
                    ? 'text-[#0071E3] dark:text-[#2997FF] font-medium'
                    : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                }`}
              >
                History
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`transition-colors ${
                location.pathname === '/admin'
                  ? 'text-[#0071E3] dark:text-[#2997FF] font-medium'
                  : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* User Identity / Role Indicator / Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-1.5 rounded-full text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Account Identity Block */}
              <div className="flex items-center gap-2 bg-[#F5F5F7]/80 dark:bg-[#2C2C2E]/80 border border-[#E5E5EA] dark:border-[#3A3A3C] rounded-full pl-1.5 pr-3 py-1 shadow-2xs">
                
                {/* 1. Role Pill Badge */}
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

                {/* 2. Names: Store Name (for stores) or Personal Name (for patient/admin) */}
                <div className="flex flex-col text-left leading-tight pr-1">
                  <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate max-w-[130px] sm:max-w-[200px]" title={getPrimaryDisplayName()}>
                    {getPrimaryDisplayName()}
                  </span>
                  {user.role === 'store' && user.store?.store_name && (
                    <span className="text-[10px] text-[#6E6E73] dark:text-[#86868B] truncate max-w-[130px] sm:max-w-[200px]" title={`Owner: ${user.name}`}>
                      Owner: {user.name}
                    </span>
                  )}
                </div>

              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-medium text-[#6E6E73] dark:text-[#86868B] hover:text-[#FF3B30] dark:hover:text-[#FF453A] transition-colors px-1 py-1"
                title="Sign out of account"
              >
                Sign Out
              </button>

            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3 text-sm">
              <Link
                to="/select-role"
                className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors"
              >
                Login
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
    </header>
  );
}
