import React from 'react';
import { Card } from './dash-ui/Card';
import { RefreshCcw, Globe, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import type { DashboardData } from './types';
import { motion } from 'framer-motion';

interface ForexStatusProps {
  data: DashboardData;
}

export const ForexStatus = ({ data }: ForexStatusProps) => {
  const isLive = data.forex.status === 'Live';
  const isUp = data.forex.trend === 'up';

  return (
    <Card className="relative overflow-hidden group">
      {/* 1. Header Section: Identity & Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#3b5a65]/10 text-[#3b5a65] dark:text-[#7ba1ad]">
            <Globe size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
              Market Pair
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">MWK</span>
              <ArrowRightLeft size={12} className="text-gray-300" />
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">CNY</span>
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
          isLive 
            ? 'bg-[#448a33]/10 text-[#448a33] dark:text-[#66b354]' 
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
        }`}>
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#448a33] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#448a33]"></span>
            </span>
          )}
          {data.forex.status}
        </div>
      </div>

      {/* 2. Main Rate Display: The "Hero" Section */}
      <div className="relative z-10 bg-gray-50 dark:bg-white/2 rounded-2xl p-5 border border-gray-100 dark:border-white/5 mb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tight">
              Current Exchange Rate
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono tracking-tighter text-gray-900 dark:text-white">
                {data.forex.rate.toFixed(5)}
              </span>
              <div className={`flex items-center gap-0.5 text-xs font-bold ${
                isUp ? 'text-[#448a33]' : 'text-red-500'
              }`}>
                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                0.02%
              </div>
            </div>
          </div>
          
          <div className="text-right">
             <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">As of</p>
             <p className="text-[11px] font-mono font-medium text-gray-600 dark:text-gray-300">
               {new Date(data.forex.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
             </p>
          </div>
        </div>
        
        {/* Background Visual: Subtle "Trading" Waveform */}
        <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.07] overflow-hidden rounded-2xl">
           <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d">
             <path d="M0 30 Q 25 35, 50 20 T 100 25" fill="none" stroke="currentColor" strokeWidth="2" />
           </svg>
        </div>
      </div>

      {/* 3. Range Indicators: 24h Context */}
      <div className="grid grid-cols-2 gap-4 mb-6">
         <div className="group/range border-l-2 border-gray-100 dark:border-gray-800 pl-3 py-1">
            <p className="text-[9px] text-gray-400 uppercase font-bold mb-0.5">24h High</p>
            <p className="text-sm font-bold font-mono text-gray-700 dark:text-gray-200">0.00418</p>
         </div>
         <div className="group/range border-l-2 border-gray-100 dark:border-gray-800 pl-3 py-1">
            <p className="text-[9px] text-gray-400 uppercase font-bold mb-0.5">24h Low</p>
            <p className="text-sm font-bold font-mono text-gray-700 dark:text-gray-200">0.00395</p>
         </div>
      </div>

      {/* 4. Action: Secondary Brand Color */}
      <button className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white dark:bg-transparent border border-[#3b5a65]/30 text-[#3b5a65] dark:text-[#7ba1ad] rounded-xl text-xs font-bold hover:bg-[#3b5a65] hover:text-white dark:hover:bg-[#3b5a65]/20 transition-all duration-200 active:scale-[0.98]">
        <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
        Force Rate Refresh
      </button>

      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#3b5a65]/5 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />
    </Card>
  );
};