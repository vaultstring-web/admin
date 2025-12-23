// components/summary/SummaryHeader.tsx
'use client';

import React from 'react';
import { Database, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  activeIntegrations: number;
  settlementHealth: number;
  reconHealth: number;
  failedCount: number;
}

export const SummaryHeader: React.FC<HeaderProps> = ({
  activeIntegrations,
  settlementHealth,
  reconHealth,
  failedCount,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Active Integrations"
        value={activeIntegrations.toString()}
        icon={<Database className="text-blue-500" size={18} />}
        sub="All corridors operational"
        color="blue"
      />
      <StatCard
        label="Settlement Success"
        value={`${settlementHealth}%`}
        icon={<ShieldCheck className="text-green-500" size={18} />}
        sub="Last 24 hours"
        color="green"
      />
      <StatCard
        label="Reconciliation"
        value={`${reconHealth}%`}
        icon={<RefreshCw className="text-blue-500" size={18} />}
        sub="Platform sync health"
        color="blue"
      />
      <StatCard
        label="Failed Exceptions"
        value={failedCount.toString()}
        icon={
          <AlertTriangle
            className={failedCount > 0 ? 'text-red-500' : 'text-gray-400'}
            size={18}
          />
        }
        sub="Requires attention"
        color="red"
        alert={failedCount > 0}
      />
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
  color: 'blue' | 'green' | 'red' | 'yellow';
  alert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  sub,
  color,
  alert,
}) => {
  const colorClasses = {
    blue: {
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
    },
    green: {
      border: 'border-green-200 dark:border-green-800',
      bg: 'bg-green-50 dark:bg-green-950/20',
    },
    red: {
      border: 'border-red-200 dark:border-red-800',
      bg: 'bg-red-50 dark:bg-red-950/20',
    },
    yellow: {
      border: 'border-yellow-200 dark:border-yellow-800',
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    },
  };

  return (
    <Card
      className={`border ${
        alert
          ? `${colorClasses[color].border} ${colorClasses[color].bg}`
          : 'border-border'
      } transition-colors shadow-sm`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          <span className="text-xs text-muted-foreground mt-1">{sub}</span>
        </div>
        {alert && (
          <Badge
            variant="destructive"
            className="mt-2 text-xs px-2 py-0.5 w-fit"
          >
            Attention Required
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};