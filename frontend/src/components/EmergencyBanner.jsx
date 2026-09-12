import React from 'react';
import { useSocket } from '../context/SocketContext';
import { BellRing, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmergencyBanner() {
  const { liveAlerts, removeAlert } = useSocket();
  const navigate = useNavigate();

  if (liveAlerts.length === 0) return null;
  const current = liveAlerts[0];

  return (
    <div className="bg-[#D63B2F] text-white shadow-subtle border-b border-[#B0291E] sticky top-16 z-30 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-1 bg-white/20 rounded-full flex-shrink-0">
            <BellRing className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span>{current.title}</span>
              <span className="font-mono text-[10px] bg-white text-[#D63B2F] px-1.5 py-0.2 rounded font-bold">
                HIGH PRIORITY
              </span>
            </p>
            <p className="text-xs text-white/90 font-medium">{current.message}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigate('/store/dashboard');
              removeAlert(current.id);
            }}
            className="px-3 py-1 bg-white text-[#D63B2F] hover:bg-slate-100 rounded-md text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
          >
            Respond <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => removeAlert(current.id)}
            className="p-1 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
