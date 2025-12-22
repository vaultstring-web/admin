import React from 'react';
import { DashboardData } from './types';
import { Card } from './dash-ui/Card';
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, Activity, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface KpiSummaryProps {
  data: DashboardData;
}

/**
 * StatItem leverages the Design System Foundation:
 * - Typography: Inter/Manrope stack with Monospace for data
 * - Spacing: Multiples of 4px (gap-1 = 4px, gap-2 = 8px, etc.)
 * - Colors: Semantic tokens for Primary Green and Primary Blue
 */
const StatItem: React.FC<{ 
  label: string; 
  value: string; 
  trend: number; 
  icon: React.ReactNode;
  sublabel?: string;
  variant: 'primary' | 'secondary'; // primary = Green, secondary = Blue
}> = ({ label, value, trend, icon, sublabel, variant }) => {
  const isPositive = trend >= 0;

  // Semantic color mapping based on Design System
  const themeClasses = variant === 'primary' 
    ? 'text-[#448a33] bg-[#448a33]/10 dark:text-[#66b354] dark:bg-[#448a33]/20 border-[#448a33]/20'
    : 'text-[#3b5a65] bg-[#3b5a65]/10 dark:text-[#7ba1ad] dark:bg-[#3b5a65]/20 border-[#3b5a65]/20';

  const trendClasses = isPositive 
    ? 'text-[#448a33] dark:text-[#66b354]' 
    : 'text-red-600 dark:text-red-400'; // Semantic Error color

  return (
    <div className="relative flex flex-col h-full group">
      {/* Icon and Trend Row - Spacing: md (16px) */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg border transition-all duration-300 ${themeClasses}`}>
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${trendClasses}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>

      {/* Content Row - Spacing: xs (4px) */}
      <div className="space-y-1">
        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight font-mono">
          {value}
        </h2>
        {sublabel && (
          <p className="text-xs text-gray-400 dark:text-gray-500 font-normal">
            {sublabel}
          </p>
        )}
      </div>

      {/* Interactive Hover Micro-Viz: Background Glow */}
      <div className={`absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 ${variant === 'primary' ? 'bg-[#448a33]/5' : 'bg-[#3b5a65]/5'}`} />
    </div>
  );
};

export const KpiSummary: React.FC<KpiSummaryProps> = ({ data }) => {
  const formatCurrency = (val: number, curr: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

  const totalUsers = data.users.customers.current + data.users.merchants.current;
  const merchantRatio = (data.users.merchants.current / totalUsers) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Transactions - Blue (Secondary) */}
      <Card className="hover:border-[#3b5a65]/30 transition-colors">
        <StatItem 
          label="Activity" 
          value={formatNumber(data.transactions.current)} 
          trend={data.transactions.trend}
          icon={<Activity />}
          variant="secondary"
          sublabel="Success rate: 99.4%"
        />
      </Card>
      
      {/* User Split - Green (Primary) */}
      <Card className="hover:border-[#448a33]/30 transition-colors">
        <div className="flex flex-col h-full justify-between">
          <StatItem 
            label="User Base" 
            value={formatNumber(totalUsers)} 
            trend={data.users.customers.trend}
            icon={<Users />}
            variant="primary"
          />
          {/* Micro-visualization: Ratio Bar */}
          <div className="mt-4">
            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full flex overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${100 - merchantRatio}%` }}
                className="bg-[#448a33] opacity-60 h-full" 
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${merchantRatio}%` }}
                className="bg-[#448a33] h-full" 
              />
            </div>
            <div className="flex justify-between text-[10px] mt-1.5 text-gray-400 font-medium">
              <span>Customers</span>
              <span>Merchants</span>
            </div>
          </div>
        </div>
      </Card>

      {/* MWK Volume - Green (Primary) */}
      <Card className="hover:border-[#448a33]/30 transition-colors">
        <StatItem 
          label="Local Volume" 
          value={formatCurrency(data.volume.mwk.current, 'MWK')} 
          trend={data.volume.mwk.trend}
          icon={<CreditCard />}
          variant="primary"
          sublabel="Settlement Volume"
        />
      </Card>

      {/* CNY Volume - Blue (Secondary) */}
      <Card className="hover:border-[#3b5a65]/30 transition-colors relative">
        <StatItem 
          label="Cross-Border" 
          value={formatCurrency(data.volume.cny.current, 'CNY')} 
          trend={data.volume.cny.trend}
          icon={<Globe />}
          variant="secondary"
          sublabel={`Rate: 1 MWK = ${data.forex.rate} CNY`}
        />
        {/* FX Pulse Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-[#3b5a65] opacity-40"></span>
            <span className="relative rounded-full h-2 w-2 bg-[#3b5a65]"></span>
          </span>
        </div>
      </Card>
    </div>
  );
};