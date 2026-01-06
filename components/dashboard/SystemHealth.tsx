import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { ShieldCheck, Zap, AlertTriangle, Activity } from 'lucide-react';
import { Card } from './dash-ui/Card';
import type { DashboardData } from './types';

interface SystemHealthProps {
  data: DashboardData;
}

interface HealthMetricProps {
  label: string;
  value: string;
  status: 'success' | 'warning' | 'error';
  icon: React.ReactElement<{ size?: number }>;
}

const HealthMetric = ({ label, value, status, icon }: HealthMetricProps) => {
  const styles = {
    success: 'border-[#448a33] text-[#448a33] bg-[#448a33]/5',
    warning: 'border-amber-500 text-amber-500 bg-amber-500/5',
    error: 'border-red-500 text-red-500 bg-red-500/5',
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border-l-4 transition-all duration-300 hover:translate-x-1 ${styles[status]} bg-white dark:bg-white/5`}>
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-white dark:bg-black/20 shadow-sm">
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">
            {label}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 font-mono tracking-tight">
            {value}
          </p>
        </div>
      </div>
      <div className="h-2 w-2 rounded-full animate-pulse bg-current" />
    </div>
  );
};

export const SystemHealth = ({ data }: SystemHealthProps) => {
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const latency = 120 + (i % 10) * 4;
    const errors = i % 7 === 0 ? 60 : 0;
    return { time: `${i}:00`, latency, errors };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Infrastructure Status Column */}
      <Card className="lg:col-span-1 border-t-2 border-[#448a33]">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={18} className="text-[#448a33]" />
          <h3 className="text-sm font-bold uppercase tracking-tight text-gray-700 dark:text-gray-300">System Vitals</h3>
        </div>

        <div className="flex flex-col gap-3">
          <HealthMetric 
            label="Network Uptime" 
            value={`${data.health.uptime24h}%`} 
            status="success"
            icon={<ShieldCheck />}
          />
          <HealthMetric 
            label="Service Latency" 
            value={`${Math.round(data.health.avgLatencyMs)}ms`} 
            status={data.health.avgLatencyMs > 200 ? 'warning' : 'success'}
            icon={<Zap />}
          />
          <HealthMetric 
            label="Incident Rate" 
            value={`${data.health.errorRate.toFixed(2)}%`} 
            status={data.health.errorRate > 0.1 ? 'error' : 'success'}
            icon={<AlertTriangle />}
          />
          
          {/* Segmented Uptime Viz */}
          <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">30 Day History</span>
              <span className="text-xs font-mono font-bold text-[#448a33]">{data.health.uptime30d}%</span>
            </div>
            <div className="flex gap-1 h-3">
              {Array.from({ length: 30 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-sm transition-all duration-500 ${
                    i === 28 ? 'bg-amber-400' : 'bg-[#448a33]'
                  } ${i > 20 ? 'opacity-100' : 'opacity-40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Traffic Performance Chart */}
      <Card className="lg:col-span-2 border-t-2 border-[#3b5a65]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-tight text-gray-700 dark:text-gray-300">Live Traffic Telemetry</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#3b5a65]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">Latency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">Errors</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b5a65" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b5a65" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.1} />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 200]} />
              <Tooltip 
                cursor={{ stroke: '#3b5a65', strokeWidth: 1 }}
                contentStyle={{ 
                  backgroundColor: 'rgba(18, 18, 18, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="latency" 
                stroke="#3b5a65" 
                fillOpacity={1} 
                fill="url(#colorLatency)" 
                strokeWidth={3}
                animationDuration={1500}
              />
              <Area 
                type="step" 
                dataKey="errors" 
                stroke="#ef4444" 
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
