import React from 'react';
import { ShieldCheck, PhoneCall } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E1E7EA] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="font-display text-base font-bold text-[#0F1B2D]">
                Med<span className="text-[#146C6C]">Emergency</span>
              </span>
              <span className="text-[10px] font-mono bg-[#E6F0F0] text-[#146C6C] px-2 py-0.5 rounded-full border border-[#146C6C]/20 font-bold">
                Clinical Network
              </span>
            </div>
            <p className="text-xs text-[#5C6B73] mt-1">
              Time-sensitive emergency prescription broadcasting and direct pharmacy matching.
            </p>
          </div>

          <div className="flex items-center space-x-6 text-xs text-[#5C6B73]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2E8B57]" />
              Licensed Pharmacies Only
            </span>
            <span className="flex items-center gap-1.5 text-[#D63B2F] font-semibold">
              <PhoneCall className="w-3.5 h-3.5" />
              National Emergency: 112
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E1E7EA] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5C6B73]">
          <span>&copy; {new Date().getFullYear()} MedEmergency Platform. Confidential & Mission-Critical.</span>
          <span className="font-mono text-[10px] text-slate-400 mt-2 sm:mt-0">
            System Status: 100% Operational
          </span>
        </div>
      </div>
    </footer>
  );
}
