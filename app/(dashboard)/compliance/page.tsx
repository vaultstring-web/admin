'use client';

import { useEffect, useState } from 'react';
import { Shield, UserCheck, AlertTriangle, ListFilter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Existing Imports
import { ComplianceStats } from '@/components/compliance/ComplianceStats';
import { KYCQueue } from '@/components/compliance/KYCQueue';
import { FlaggedTransactions } from '@/components/compliance/FlaggedTransactions';
import { AuditLogTable } from '@/components/compliance/AuditLogTable';
import { ComplianceReports } from '@/components/compliance/ComplianceReports';
import type { FlaggedTransaction as ComplianceTx } from '@/components/compliance/types';
import { KYCStatus } from '@/components/compliance/types';
import {
  getKYCApplications,
  getAuditLogs,
  getComplianceReports,
  getTransactions,
  type KYCApplication,
  type AuditLog,
  type ComplianceReport,
} from '@/lib/api';
import { useSession } from '@/hooks/useSession';

export default function CompliancePage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const [activeTab, setActiveTab] = useState('kyc');
  const [showHistory, setShowHistory] = useState(false);
  const [flagged, setFlagged] = useState<ComplianceTx[]>([]);
  const [kycApplications, setKycApplications] = useState<KYCApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycLoading, setKycLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleReviewKYC(id: string): void {
    // Implementation for reviewing KYC
    console.log('Review KYC:', id);
  }

  function handleInvestigateTransaction(id: string): void {
    // Implementation for investigating transaction
    console.log('Investigate transaction:', id);
  }

  useEffect(() => {
    if (sessionLoading || !isAuthenticated) {
      return;
    }

    const fetchKYCData = async () => {
      setKycLoading(true);
      try {
        // If showHistory is false, fetch 'pending'. If true, fetch all (or processed).
        // Let's assume history means everything or non-pending.
        // For now, let's fetch 'pending' for queue, and 'verified' + 'rejected' for history if possible,
        // or just all for history.
        // Based on typical queue logic: Queue = Pending. History = All others.
        // My backend supports single status. If I want multiple for history, I might need to make two calls or update backend.
        // Let's just use empty status (All) for history for now, which includes pending, but user can filter client side if needed.
        // Or better: fetch 'pending' for queue. Fetch empty (all) for history.
        const status = showHistory ? '' : 'pending';
        const kycRes = await getKYCApplications(status, 50, 0);
        if (kycRes.data?.applications) {
          setKycApplications(kycRes.data.applications);
        }
      } catch (err) {
        console.error("Failed to fetch KYC applications", err);
      } finally {
        setKycLoading(false);
      }
    };

    fetchKYCData();
  }, [showHistory, sessionLoading, isAuthenticated]);

  useEffect(() => {
    if (sessionLoading || !isAuthenticated) return;

    const fetchOtherData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch audit logs
        const auditRes = await getAuditLogs(100, 0);
        if (auditRes.data?.logs) {
          setAuditLogs(auditRes.data.logs);
        }

        // Fetch compliance reports
        const reportsRes = await getComplianceReports(50, 0);
        if (reportsRes.data?.reports) {
          setComplianceReports(reportsRes.data.reports);
        }

        // Fetch flagged transactions
        const txsRes = await getTransactions(100, 0, { status: 'failed' });
        if (txsRes.data?.transactions) {
          const mapped: ComplianceTx[] = txsRes.data.transactions
            .slice(0, 20)
            .map((t: any) => {
              const rawAmount =
                t.amount && typeof t.amount === 'object'
                  ? parseFloat(t.amount.amount || 0)
                  : typeof t.amount === 'string'
                  ? parseFloat(t.amount)
                  : typeof t.amount === 'number'
                  ? t.amount
                  : 0;
              const currency =
                t.amount && typeof t.amount === 'object'
                  ? String(t.amount.currency || 'MWK')
                  : String(t.currency || 'MWK');
              const id = String(t.id || t.reference || '').trim() || `TX-${Date.now()}`;
              const transactionId = String(t.reference || id);
              const customerId = String(t.sender_id || '');
              const customerName =
                t.sender_name || t.sender_email || (customerId ? `User-${customerId.slice(0, 8)}` : 'Unknown');
              const timestamp = String(t.created_at || new Date().toISOString());
              const reason = String(t.status_reason || 'Review required');
              const factors: string[] = [];
              if (reason.toLowerCase().includes('kyc')) factors.push('KYC');
              if (reason.toLowerCase().includes('sanction')) factors.push('Sanctions');
              if (reason.toLowerCase().includes('timeout')) factors.push('API Timeout');
              if (factors.length === 0) factors.push('System');
              const riskScore = factors.includes('Sanctions') ? 85 : factors.includes('KYC') ? 70 : 55;
              return {
                id,
                transactionId,
                customerId,
                customerName,
                amount: rawAmount,
                currency,
                timestamp,
                flagReason: reason,
                riskScore,
                riskFactors: factors,
                status: 'pending_review',
                auditTrail: [],
              } as ComplianceTx;
            });
          setFlagged(mapped);
        }
      } catch (err: any) {
        console.error('Failed to fetch compliance data:', err);
        setError(err?.message || 'Failed to load compliance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [sessionLoading, isAuthenticated]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Compliance & Risk Management
        </h1>
        <p className="text-muted-foreground">
          Monitor KYC verifications, investigate suspicious activities, and maintain regulatory compliance
        </p>
      </div>

      {sessionLoading || loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#448a33] mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading compliance data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
        </div>
      ) : (
        <>
      {/* 2. Key Metrics: High Contrast */}
      <ComplianceStats 
        kycApplications={kycApplications}
        flaggedTransactions={flagged}
      />

      {/* 3. The Toggleable Table Section */}
      <Tabs defaultValue="kyc" className="w-full space-y-6" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Sleek Segmented Control */}
          <TabsList className="relative h-11 w-full max-w-100 grid grid-cols-2 items-center justify-center rounded-xl bg-muted/50 p-1 text-muted-foreground border border-border/50">
            
            <TabsTrigger 
              value="kyc" 
              className="z-10 h-full rounded-lg px-3 py-1.5 text-sm font-medium transition-all 
                        data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                        hover:text-foreground/80"
            >
              <div className="flex items-center justify-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>KYC Queue</span>
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-green/10 text-[10px] text-brand-green font-bold">
                  {kycApplications.length}
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger 
              value="fraud" 
              className="z-10 h-full rounded-lg px-3 py-1.5 text-sm font-medium transition-all 
                        data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                        hover:text-foreground/80"
            >
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Flagged</span>
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-[10px] text-destructive font-bold">
                  {flagged.length}
                </span>
              </div>
            </TabsTrigger>
            
          </TabsList>

          {/* Dynamic Metadata Badge */}
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="h-4 w-px bg-border hidden sm:block" />
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
              </span>
              Live Monitoring Active
            </p>
          </div>
        </div>

        {/* Content Areas with Smooth Transitions */}
        <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <TabsContent value="kyc" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <KYCQueue
              applications={kycApplications}
              onReview={handleReviewKYC}
              onAssign={(id, userId) => console.log('Assign:', id, userId)}
              showHistory={showHistory}
              onToggleHistory={setShowHistory}
              isLoading={kycLoading}
            />
          </TabsContent>
          <TabsContent value="fraud" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <FlaggedTransactions
              transactions={flagged}
              onInvestigate={handleInvestigateTransaction}
              onResolve={(id, resolution) => console.log('Resolve:', id, resolution)}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* 4. Secondary Sections: Grouped in an Accordion or clean stacks */}
      <div className="grid grid-cols-1 gap-10">
        <section className="space-y-4">
          <h3 className="text-lg font-semibold px-1">Global Audit Log</h3>
          <AuditLogTable
            logs={auditLogs}
            onExport={(s, e) => console.log('Export:', s, e)}
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold px-1">Compliance Reporting</h3>
          <ComplianceReports
            reports={complianceReports}
            onGenerate={(type) => console.log('Generate:', type)}
            onDownload={(id) => console.log('Download:', id)}
          />
        </section>
      </div>
        </>
      )}
    </div>
  );
}
