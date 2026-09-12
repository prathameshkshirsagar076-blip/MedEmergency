import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Store, ArrowRight, Shield, HeartPulse } from 'lucide-react';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('role');

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl text-center">
        
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center mx-auto mb-6">
          <Shield className="w-6 h-6" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight-hero text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
          How would you like to use MedEmergency?
        </h1>
        <p className="mt-3 text-base text-[#6E6E73] dark:text-[#86868B] max-w-md mx-auto">
          Choose your role to continue to the right portal.
        </p>

        {/* Two Equal-Weight Interactive Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          {/* Option 1: Patient Card */}
          <div
            onClick={() => navigate('/patient/login')}
            className={`group relative p-8 rounded-[24px] cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
              preselected === 'patient'
                ? 'ring-2 ring-[#0071E3] bg-[#F5F5F7] dark:bg-[#1D1D1F]'
                : 'bg-[#F5F5F7] dark:bg-[#1D1D1F] border border-transparent hover:border-[#D2D2D7] dark:hover:border-[#333336]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#2C2C2E] shadow-sm flex items-center justify-center text-[#0071E3] dark:text-[#2997FF] mb-6 group-hover:scale-110 transition-transform">
              <HeartPulse className="w-7 h-7" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#0071E3] dark:text-[#2997FF] block mb-1">
              For Individuals & Families
            </span>
            <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              I'm a Patient
            </h2>
            <p className="mt-2 text-sm text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Upload a prescription and instantly find emergency medicines at verified pharmacies nearby.
            </p>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#0071E3] dark:text-[#2997FF] group-hover:translate-x-1 transition-transform">
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Option 2: Medical Store Card */}
          <div
            onClick={() => navigate('/store/login')}
            className={`group relative p-8 rounded-[24px] cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
              preselected === 'store'
                ? 'ring-2 ring-[#34C759] bg-[#F5F5F7] dark:bg-[#1D1D1F]'
                : 'bg-[#F5F5F7] dark:bg-[#1D1D1F] border border-transparent hover:border-[#D2D2D7] dark:hover:border-[#333336]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#2C2C2E] shadow-sm flex items-center justify-center text-[#34C759] dark:text-[#30D158] mb-6 group-hover:scale-110 transition-transform">
              <Store className="w-7 h-7" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-[#34C759] dark:text-[#30D158] block mb-1">
              For Licensed Pharmacies
            </span>
            <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              I'm a Medical Store
            </h2>
            <p className="mt-2 text-sm text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Receive live emergency broadcasts in your area, confirm stock availability, and serve critical patients.
            </p>

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#34C759] dark:text-[#30D158] group-hover:translate-x-1 transition-transform">
              <span>Pharmacist Login / Signup</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

        </div>

        {/* Quick Returning User Affordance */}
        <div className="mt-12 text-center text-xs text-[#6E6E73] dark:text-[#86868B]">
          Looking for administrator access?{' '}
          <Link to="/admin/login" className="text-[#0071E3] dark:text-[#2997FF] hover:underline font-medium">
            Admin Portal →
          </Link>
        </div>

      </div>
    </div>
  );
}
