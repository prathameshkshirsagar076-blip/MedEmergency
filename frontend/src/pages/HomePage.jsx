import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, MapPin, Upload, ScanLine, Radio, PhoneCall, CheckCircle2, Lock, Building2 } from 'lucide-react';
import Button from '../components/ui/Button';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-200">
      
      {/* 1. Hero Section */}
      <section className="py-24 sm:py-36 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] text-xs font-semibold uppercase tracking-wider mb-6">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-Time Emergency Dispatch</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight-hero text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.08]">
          Emergency medicine, <br />
          <span className="text-[#0071E3] dark:text-[#2997FF]">
            found in minutes.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#6E6E73] dark:text-[#86868B] max-w-2xl mx-auto leading-relaxed font-normal">
          Upload any doctor's prescription. We automatically notify verified nearby pharmacies and connect you instantly when stock is confirmed.
        </p>

        {/* ONE Primary CTA Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/select-role?role=patient">
            <Button
              variant="accent"
              size="lg"
              className="min-w-[240px] text-base py-4 shadow-lg shadow-blue-500/20"
            >
              Find Medicine Now
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section id="how-it-works" className="py-24 bg-[#F5F5F7] dark:bg-[#161617] transition-colors duration-200 scroll-mt-14">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-[#0071E3] dark:text-[#2997FF] uppercase tracking-wider block mb-2">
              Life-Critical Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
              Engineered for clarity and speed.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6E6E73] dark:text-[#86868B]">
              Every second counts. Here is how MedEmergency works in 4 simple steps:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="p-6 rounded-[20px] bg-white dark:bg-[#1D1D1F] shadow-sm border border-[#E5E5EA] dark:border-[#2C2C2E] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#0071E3] dark:text-[#2997FF] uppercase tracking-wider block mb-1">
                  Step 01
                </span>
                <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Upload Rx
                </h3>
                <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-2 leading-relaxed">
                  Snap a photo or upload doctor's prescription directly from your device.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-[20px] bg-white dark:bg-[#1D1D1F] shadow-sm border border-[#E5E5EA] dark:border-[#2C2C2E] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <ScanLine className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                  Step 02
                </span>
                <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Instant OCR Scan
                </h3>
                <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-2 leading-relaxed">
                  Our system scans medication names & dosages with fuzzy catalog matching.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-[20px] bg-white dark:bg-[#1D1D1F] shadow-sm border border-[#E5E5EA] dark:border-[#2C2C2E] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Radio className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                  Step 03
                </span>
                <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Stores Notified
                </h3>
                <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-2 leading-relaxed">
                  Real-time radar broadcasts the emergency to all approved pharmacies in radius.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-[20px] bg-white dark:bg-[#1D1D1F] shadow-sm border border-[#E5E5EA] dark:border-[#2C2C2E] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 text-[#34C759] dark:text-[#30D158] flex items-center justify-center mb-4">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#34C759] dark:text-[#30D158] uppercase tracking-wider block mb-1">
                  Step 04
                </span>
                <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  1-Tap Connect
                </h3>
                <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-2 leading-relaxed">
                  First pharmacy confirming stock secures match; tap to call immediately.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. For Medical Stores Section */}
      <section id="for-stores" className="py-24 max-w-5xl mx-auto px-6 w-full scroll-mt-14">
        <div className="p-8 sm:p-12 rounded-[28px] bg-[#F5F5F7] dark:bg-[#1D1D1F] border border-[#E5E5EA] dark:border-[#2C2C2E] flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] dark:text-[#30D158] text-xs font-semibold uppercase tracking-wider mb-4">
              <Building2 className="w-3.5 h-3.5" />
              <span>For Licensed Pharmacies</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight-heading text-[#1D1D1F] dark:text-[#F5F5F7]">
              Join the emergency medicine dispatch network.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#6E6E73] dark:text-[#86868B] leading-relaxed">
              Help patients during critical emergencies, receive urgent audio-alert broadcasts in your area, and provide life-saving fulfillment with 1-click response.
            </p>
            
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-[#6E6E73] dark:text-[#86868B]">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#34C759]" /> Verified License Only</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#34C759]" /> Priority Sound Sirens</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#34C759]" /> 1-Tap Availability</span>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3">
            <Link to="/select-role?role=store" className="w-full">
              <Button variant="accent" size="lg" className="w-full whitespace-nowrap bg-[#34C759] hover:bg-[#30D158]">
                Register your Store
              </Button>
            </Link>
            <Link to="/store/login" className="w-full">
              <Button variant="outline" size="lg" className="w-full whitespace-nowrap">
                Store Sign In
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* 4. Trust & Safety Section */}
      <section id="about" className="py-20 bg-[#F5F5F7] dark:bg-[#161617] transition-colors duration-200 scroll-mt-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            <div className="p-6 rounded-[20px] bg-white dark:bg-[#1D1D1F] border border-[#E5E5EA] dark:border-[#2C2C2E]">
              <Shield className="w-8 h-8 text-[#0071E3] dark:text-[#2997FF] mb-4" />
              <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Licensed Stores Only
              </h3>
              <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-2 leading-relaxed">
                Every pharmacy undergoes strict drug license verification before being permitted into the emergency dispatch network.
              </p>
            </div>

            <div className="p-6 rounded-[20px] bg-white dark:bg-[#1D1D1F] border border-[#E5E5EA] dark:border-[#2C2C2E]">
              <Lock className="w-8 h-8 text-[#0071E3] dark:text-[#2997FF] mb-4" />
              <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Patient Privacy
              </h3>
              <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-2 leading-relaxed">
                Prescription data is encrypted and shared only with responding pharmacies solely to verify medicine inventory.
              </p>
            </div>

            <div className="p-6 rounded-[20px] bg-white dark:bg-[#1D1D1F] border border-[#E5E5EA] dark:border-[#2C2C2E]">
              <MapPin className="w-8 h-8 text-[#0071E3] dark:text-[#2997FF] mb-4" />
              <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Proximity Dispatch
              </h3>
              <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-[#86868B] mt-2 leading-relaxed">
                Smart Haversine radius calculations ensure you are connected to the closest open pharmacy with minimal transit time.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Minimal Footer */}
      <footer className="py-12 hairline-t border-[#D2D2D7] dark:border-[#333336] text-xs text-[#6E6E73] dark:text-[#86868B]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Copyright © {new Date().getFullYear()} MedEmergency Inc. All rights reserved.</span>
          
          <div className="flex items-center space-x-6">
            <a href="#how-it-works" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">How It Works</a>
            <a href="#for-stores" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">For Stores</a>
            <a href="#about" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">Trust & Safety</a>
            <Link to="/admin/login" className="text-[#6E6E73] dark:text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors font-medium">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
