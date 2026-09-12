import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldAlert, CheckCircle2, ArrowRight, Building2, LogOut } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function StorePendingApprovalPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/select-role');
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        
        {/* Amber Clock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Clock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Verification Under Review</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
          Registration Under Review
        </h1>
        
        <p className="mt-4 text-base text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
          Thank you for registering <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">{user?.store?.store_name || 'your pharmacy'}</strong>. To safeguard patients in life-critical emergencies, all pharmacy drug licenses must be reviewed by the Administrator before dispatch access is activated.
        </p>

        {/* Verification Card */}
        <div className="mt-8 p-6 rounded-[20px] bg-[#F5F5F7] dark:bg-[#1D1D1F] border border-[#E5E5EA] dark:border-[#2C2C2E] text-left space-y-4">
          <div className="flex items-center justify-between pb-3 hairline-b border-[#D2D2D7] dark:border-[#333336]">
            <span className="text-xs text-[#6E6E73] dark:text-[#86868B]">Store Profile</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pending Admin Approval
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#6E6E73] dark:text-[#86868B] block">Store Name</span>
              <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{user?.store?.store_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#6E6E73] dark:text-[#86868B] block">Drug License #</span>
              <span className="font-semibold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">{user?.store?.license_number || 'Under Verification'}</span>
            </div>
            <div>
              <span className="text-[#6E6E73] dark:text-[#86868B] block">Contact Email</span>
              <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{user?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#6E6E73] dark:text-[#86868B] block">Address</span>
              <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{user?.store?.address || 'Submitted'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          
          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="accent"
              size="md"
              className="w-full sm:w-auto"
            >
              Return to Home
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
