// app/dashboard/page.tsx
'use client';

import { SummaryHeader } from '@/components/banking/Header';
import { IntegrationsSection } from '@/components/banking/IntegrationSection';
import { SettlementActivity } from '@/components/banking/SettlementActivity';
import { FailedTransactions } from '@/components/banking/FailedTransactions';
import { ReconciliationOverview } from '@/components/banking/ReconciliationOverview';
import {
  DASHBOARD_STATS,
  MOCK_INTEGRATIONS,
  MOCK_SETTLEMENTS,
  MOCK_FAILED_TRANSACTIONS,
} from '@/components/banking/constants';

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Operations Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time monitoring of cross-border payment operations
        </p>
      </div>

      <SummaryHeader
        activeIntegrations={DASHBOARD_STATS.activeIntegrations}
        settlementHealth={DASHBOARD_STATS.settlementHealth}
        reconHealth={DASHBOARD_STATS.reconHealth}
        failedCount={DASHBOARD_STATS.failedCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <IntegrationsSection integrations={MOCK_INTEGRATIONS} />
          <SettlementActivity batches={MOCK_SETTLEMENTS} />
        </div>
        
        <div className="space-y-6">
          <ReconciliationOverview />
          <FailedTransactions transactions={MOCK_FAILED_TRANSACTIONS} />
        </div>
      </div>
    </div>
  );
}