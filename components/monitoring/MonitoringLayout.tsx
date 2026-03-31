'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type MonitoringLayoutProps = {
  title: string;
  subtitle?: string;
  filters?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function MonitoringLayout({
  title,
  subtitle,
  filters,
  children,
  className,
}: MonitoringLayoutProps) {
  return (
    <div className={cn('flex-1 space-y-6 p-6 md:p-8 pt-6', className)}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>

      {filters ? <div className="space-y-4">{filters}</div> : null}

      <section className="min-w-0 space-y-4">{children}</section>
    </div>
  );
}

