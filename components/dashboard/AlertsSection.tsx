import React from 'react';
import { Card } from './dash-ui/Card';
import { Bell, AlertCircle, Info, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DashboardData, Alert } from './types';

interface AlertsSectionProps {
  data: DashboardData;
}

const SeverityBadge = ({ severity }: { severity: Alert['severity'] }) => {
  const styles = {
    Critical: 'text-red-600 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20',
    Warning: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20',
    Info: 'text-[#3b5a65] bg-[#3b5a65]/5 dark:text-[#7ba1ad] dark:bg-[#3b5a65]/10 border-[#3b5a65]/10',
  } as const;
  
  return (
    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${styles[severity]}`}>
      {severity}
    </span>
  );
};

export const AlertsSection = ({ data }: AlertsSectionProps) => {
  return (
    <Card className="flex-1 relative overflow-hidden">
      {/* Header with Semantic Count */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-tight text-gray-900 dark:text-gray-100">
            System Events
          </h3>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
            {data.alerts.length} operational events • Last 24h
          </p>
        </div>
        <button className="text-[10px] font-bold text-[#3b5a65] dark:text-[#7ba1ad] uppercase hover:underline">
          Clear All
        </button>
      </div>

      <div className="relative flex flex-col gap-1 max-h-105 overflow-y-auto custom-scrollbar pr-1">
        {/* The Timeline Line */}
        <div className="absolute left-4.75 top-2 bottom-2 w-px bg-gray-100 dark:bg-gray-800" />

        <AnimatePresence>
          {data.alerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#448a33]/20 blur-2xl rounded-full" />
                <CheckCircle2 size={40} className="relative text-[#448a33] opacity-80" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">All systems go</p>
              <p className="text-xs text-gray-400 mt-1">No operational incidents reported.</p>
            </motion.div>
          ) : (
            data.alerts.map((alert, index) => {
              const isCritical = alert.severity === 'Critical';
              return (
                <motion.div 
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative pl-10 pr-4 py-4 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/2 border border-transparent hover:border-gray-100 dark:hover:border-white/10`}
                >
                  {/* Timeline Dot/Icon */}
                  <div className={`absolute left-2.5 top-5 z-10 w-5 h-5 rounded-full border-4 border-white dark:border-[#1a1a1a] flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isCritical ? 'bg-red-500 shadow-lg shadow-red-500/20' : 
                    alert.severity === 'Warning' ? 'bg-amber-500' : 'bg-[#3b5a65]'
                  }`}>
                    {isCritical ? <AlertCircle size={10} className="text-white" /> : 
                     alert.severity === 'Warning' ? <Bell size={10} className="text-white" /> : 
                     <Info size={10} className="text-white" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                          {alert.category}
                        </span>
                        <SeverityBadge severity={alert.severity} />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                        <Clock size={10} />
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    <p className={`text-xs leading-relaxed ${isCritical ? 'text-gray-900 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                      {alert.message}
                    </p>

                    {/* Hover Action */}
                    <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-[10px] font-bold uppercase tracking-widest text-[#3b5a65] dark:text-[#7ba1ad] flex items-center gap-1 hover:gap-2 transition-all">
                        View Log <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
      
      {/* Decorative Glow for Critical Alerts */}
      {data.alerts.some(a => a.severity === 'Critical') && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl pointer-events-none" />
      )}
    </Card>
  );
};