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
    <div className={cn('flex-1 space-y-6 p-8 pt-6', className)}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          {filters}
        </aside>
        <section className="min-w-0 space-y-4">{children}</section>
      </div>
    </div>
  );
}

