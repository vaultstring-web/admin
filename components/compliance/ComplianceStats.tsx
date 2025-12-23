'use client';

import { Card, CardContent } from '@/components/ui/card';
import { KYCApplication, FlaggedTransaction } from './types';
import { ShieldAlert, UserCheck, Activity, Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface ComplianceStatsProps {
  kycApplications: KYCApplication[];
  flaggedTransactions: FlaggedTransaction[];
}

export const ComplianceStats: React.FC<ComplianceStatsProps> = ({
  kycApplications,
  flaggedTransactions
}) => {
  const stats = {
    pendingKYC: kycApplications.filter(app => app.status === 'pending').length,
    highRiskKYC: kycApplications.filter(app => app.riskLevel === 'high' || app.riskLevel === 'critical').length,
    pendingInvestigations: flaggedTransactions.filter(tx => 
      tx.status === 'pending_review' || tx.status === 'investigating'
    ).length,
    criticalFlags: flaggedTransactions.filter(tx => tx.riskScore > 80).length,
  };

  const statConfig = [
    {
      label: 'KYC Backlog',
      value: stats.pendingKYC,
      icon: UserCheck,
      color: 'text-secondary', // Brand Blue
      bg: 'bg-secondary/10',
      trend: '+12% from yesterday'
    },
    {
      label: 'High Risk KYC',
      value: stats.highRiskKYC,
      icon: ShieldAlert,
      color: 'text-semantic-error-light',
      bg: 'bg-semantic-error-light/10',
      trend: 'Action required'
    },
    {
      label: 'Active Inquiries',
      value: stats.pendingInvestigations,
      icon: Activity,
      color: 'text-primary', // Brand Green
      bg: 'bg-primary/10',
      trend: '8 resolved today'
    },
    {
      label: 'Critical Flags',
      value: stats.criticalFlags,
      icon: Zap,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      trend: 'Priority 1'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map((stat, index) => (
        <Card key={index} className="border-border/40 bg-card/50 backdrop-blur-sm shadow-none group transition-all hover:border-primary/30">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} transition-colors group-hover:bg-opacity-20`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                {stat.label === 'High Risk KYC' && stats.highRiskKYC > 0 && (
                  <span className="flex h-2 w-2 rounded-full bg-semantic-error-light animate-pulse" />
                )}
              </div>
              
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-1">
                {stat.label === 'KYC Backlog' ? (
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-[10px] font-medium text-muted-foreground">
                  {stat.trend}
                </span>
              </div>
            </div>
          </CardContent>
          
          {/* Subtle accent bar at the bottom */}
          <div className={`h-1 w-full opacity-10 ${stat.bg.replace('bg-', 'bg-')}`} />
        </Card>
      ))}
    </div>
  );
};