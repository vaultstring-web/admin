'use client';

import { useState, useEffect } from 'react';
import { TimeRange, DashboardData } from '../components/dashboard/types';
import { generateMockData } from '@/components/dashboard/services/mockDataServices';
import { REFRESH_INTERVAL } from '@/components/dashboard/constants';
import { KpiSummary } from '@/components/dashboard/KpiSummary';
import { SystemHealth } from '@/components/dashboard/SystemHealth';
import { AlertsSection } from '@/components/dashboard/AlertsSection';
import { ForexStatus } from '@/components/dashboard/ForexStatus';
import { RefreshCw, LayoutDashboard, Search, Calendar } from 'lucide-react';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('Today');
  const [data, setData] = useState<DashboardData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = (range: TimeRange) => {
    setIsRefreshing(true);
    // Simulate API delay
    setTimeout(() => {
      setData(generateMockData(range));
      setIsRefreshing(false);
    }, 400);
  };

  useEffect(() => {
    fetchData(timeRange);
    
    const interval = setInterval(() => {
      setData(prev => {
        if (!prev) return null;
        const fresh = generateMockData(timeRange);
        // Deep merge logic simplified: just update dynamic values
        return {
          ...fresh,
          alerts: prev.alerts // Keep current alerts for stability in demo
        };
      });
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [timeRange]);

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin text-brand-blue">
        <RefreshCw size={32} />
      </div>
    </div>
  );

  return (
    <div className="max-w-400 mx-auto px-md md:px-lg py-lg space-y-lg animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-lg pb-sm border-b border-gray-100 dark:border-[#2a2a2a]">
        <div>
          <div className="flex items-center gap-sm mb-1 text-brand-blue">
            <LayoutDashboard size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Operator Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-md">
            Dashboard Overview
            {isRefreshing && <RefreshCw size={18} className="animate-spin text-gray-300" />}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-time platform performance and financial snapshot</p>
        </div>

        <div className="flex flex-wrap items-center gap-md">
          <div className="flex items-center bg-gray-100 dark:bg-[#1a1a1a] p-1 rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
            {(['Today', '7d', '30d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-lg py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  timeRange === range 
                    ? 'bg-white dark:bg-[#2a2a2a] text-brand-blue shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <div className="hidden sm:flex items-center gap-sm px-lg py-sm bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#2a2a2a] rounded-xl text-xs font-medium text-gray-500 cursor-pointer">
            <Calendar size={14} />
            <span>Custom Range</span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue cursor-pointer">
            <Search size={16} />
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <section className="space-y-lg">
        <KpiSummary data={data} />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
           <div className="xl:col-span-2 space-y-lg">
             <SystemHealth data={data} />
             <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
                <div>
                   <h4 className="font-bold text-brand-blue">Operational Awareness</h4>
                   <p className="text-sm text-brand-blue/70">Automatic refresh every 10s. Last update: {new Date(data.lastRefresh).toLocaleTimeString()}</p>
                </div>
                <button 
                  onClick={() => fetchData(timeRange)}
                  className="px-lg py-sm bg-brand-blue text-white rounded-lg text-xs font-bold uppercase hover:bg-opacity-90 transition-all shadow-md shadow-brand-blue/20"
                >
                  Manual Refresh
                </button>
             </div>
           </div>
           
           <div className="xl:col-span-1 flex flex-col gap-lg">
             <ForexStatus data={data} />
             <AlertsSection data={data} />
           </div>
        </div>
      </section>

      {/* Footer / Meta Data */}
      <footer className="pt-lg border-t border-gray-100 dark:border-[#2a2a2a] flex flex-col sm:flex-row justify-between items-center gap-md">
        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-sm">
            <div className="w-2 h-2 rounded-full bg-brand-green" />
            <span className="text-[10px] font-bold uppercase text-gray-400">Gateway Status: Optimal</span>
          </div>
          <div className="flex items-center gap-sm">
            <div className="w-2 h-2 rounded-full bg-brand-green" />
            <span className="text-[10px] font-bold uppercase text-gray-400">Forex Feed: Live</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-mono">
          System Node: MWK-AZ-04 | Session: FX-B912-PRD
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;