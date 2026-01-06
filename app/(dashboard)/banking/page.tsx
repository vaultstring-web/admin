// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { SummaryHeader } from '@/components/banking/Header';
import { IntegrationsSection } from '@/components/banking/IntegrationSection';
import { SettlementActivity } from '@/components/banking/SettlementActivity';
import { FailedTransactions } from '@/components/banking/FailedTransactions';
import { ReconciliationOverview } from '@/components/banking/ReconciliationOverview';
import type { FailedTransaction as FailedTx, BankIntegration, SettlementBatch } from '@/components/banking/types';
import { HealthStatus, Corridor } from '@/components/banking/types';
import {
  getBankAccounts,
  getPaymentGateways,
  getSettlements,
  getTransactions,
  type BankAccount,
  type PaymentGateway,
  type Settlement,
} from '@/lib/api';
import { useSession } from '@/hooks/useSession';

export default function BankingPage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const [failedTxs, setFailedTxs] = useState<FailedTx[]>([]);
  const [integrations, setIntegrations] = useState<BankIntegration[]>([]);
  const [settlements, setSettlements] = useState<SettlementBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading || !isAuthenticated) {
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch failed transactions
        const txsRes = await getTransactions(100, 0, { status: 'failed' });
        if (txsRes.data?.transactions) {
          const mapped: FailedTx[] = txsRes.data.transactions
            .slice(0, 10)
            .map((t) => {
              const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : typeof t.amount === 'number' ? t.amount : 0;
              const currency = String(t.currency || 'USD');
              const ref = String(t.reference || t.id || '').trim() || 'TX-UNKNOWN';
              const timestamp = String(t.created_at || new Date().toISOString());
              const reason = String(t.status_reason || 'Processing error');
              return {
                id: String(t.id || ref),
                ref,
                amount,
                currency,
                type: String(t.transaction_type || 'Payout'),
                category: reason.includes('timeout')
                  ? 'API Timeout'
                  : reason.includes('kyc')
                  ? 'KYC Verification'
                  : reason.includes('insufficient')
                  ? 'Insufficient Funds'
                  : 'System Error',
                timestamp,
                diagnostic: reason,
              } as FailedTx;
            });
          setFailedTxs(mapped);
        }

        // Fetch bank accounts and gateways to build integrations
        const [accountsRes, gatewaysRes] = await Promise.all([
          getBankAccounts(),
          getPaymentGateways(),
        ]);

        const integrationsList: BankIntegration[] = [];
        
        if (accountsRes.data?.accounts) {
          accountsRes.data.accounts.forEach((acc: BankAccount) => {
            integrationsList.push({
              id: acc.id,
              name: acc.bank_name,
              provider: 'Bank',
              corridor: acc.currency === 'MWK' ? Corridor.MALAWI : Corridor.CHINA,
              status: acc.status === 'active' ? HealthStatus.HEALTHY : HealthStatus.OFFLINE,
              lastSync: acc.connected_at ? new Date(acc.connected_at).toLocaleString() : 'Never',
              availability: acc.status === 'active' ? 99.9 : 0,
              endpoint: `Bank Account: ${acc.account_number}`,
              lastChecked: acc.connected_at || new Date().toISOString(),
              latency: 120,
            });
          });
        }

        if (gatewaysRes.data?.gateways) {
          gatewaysRes.data.gateways.forEach((gw: PaymentGateway) => {
            integrationsList.push({
              id: gw.id,
              name: gw.name,
              provider: gw.provider || 'Gateway',
              corridor: gw.name.includes('MW') || gw.name.includes('Malawi') ? Corridor.MALAWI : Corridor.CHINA,
              status: gw.status === 'active' ? HealthStatus.HEALTHY : HealthStatus.OFFLINE,
              lastSync: gw.last_sync ? new Date(gw.last_sync).toLocaleString() : 'Never',
              availability: gw.status === 'active' ? 99.5 : 0,
              endpoint: gw.webhook_url || 'N/A',
              lastChecked: gw.last_sync || new Date().toISOString(),
              latency: 150,
            });
          });
        }

        setIntegrations(integrationsList);

        // Fetch settlements
        const settlementsRes = await getSettlements(50, 0);
        if (settlementsRes.data?.settlements) {
          const mapped: SettlementBatch[] = settlementsRes.data.settlements.map((s: Settlement) => ({
            id: s.id || s.batch_id || `SETTLE-${Date.now()}`,
            date: new Date(s.created_at).toISOString().split('T')[0],
            corridor: s.currency === 'MWK' ? Corridor.MALAWI : Corridor.CHINA,
            volume: typeof s.amount === 'number' ? s.amount : parseFloat(String(s.amount || 0)),
            currency: s.currency,
            status: s.status === 'completed' ? 'Completed' : s.status === 'pending' ? 'Pending' : 'Failed',
            transactionsCount: s.transaction_count || 0,
            processedAt: s.completed_at || s.created_at,
          }));
          setSettlements(mapped);
        }
      } catch (err: any) {
        console.error('Failed to fetch banking data:', err);
        setError(err?.message || 'Failed to load banking data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [sessionLoading, isAuthenticated]);

  if (sessionLoading || loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#448a33] mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading banking data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  const activeIntegrations = integrations.filter(
    (i) => i.status === HealthStatus.HEALTHY || i.status === HealthStatus.DEGRADED
  ).length;

  const completedSettlements = settlements.filter((s) => s.status === 'Completed');
  const settlementHealth = settlements.length > 0
    ? (completedSettlements.length / settlements.length) * 100
    : 100;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Operations Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time monitoring of cross-border payment operations
        </p>
      </div>

      <SummaryHeader
        activeIntegrations={activeIntegrations}
        settlementHealth={settlementHealth}
        reconHealth={99.2}
        failedCount={failedTxs.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <IntegrationsSection integrations={integrations.length > 0 ? integrations : []} />
          <SettlementActivity batches={settlements.length > 0 ? settlements : []} />
        </div>
        
        <div className="space-y-6">
          <ReconciliationOverview />
          <FailedTransactions transactions={failedTxs} />
        </div>
      </div>
    </div>
  );
}
