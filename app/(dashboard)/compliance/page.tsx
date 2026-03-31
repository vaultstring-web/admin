'use client';

import { useEffect, useState } from 'react';
import { Shield, UserCheck, AlertTriangle, CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
  updateKYCApplicationStatus,
  type KYCApplication as ApiKYCApplication,
  type AuditLog as ApiAuditLog,
  type ComplianceReport as ApiComplianceReport,
} from '@/lib/api';
import { API_BASE } from '@/lib/constants';
import { useSession } from '@/hooks/useSession';
import {
  KYCApplication,
  KYCStatus,
  RiskLevel,
  AuditLog,
  AuditAction,
  ComplianceReport,
  ReportType,
  ReportStatus,
} from '@/components/compliance/types';
import { safeDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { downloadCsv } from '@/lib/csv';

export default function CompliancePage() {
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const router = useRouter();
  const [, setActiveTab] = useState('kyc');
  const [showHistory, setShowHistory] = useState(false);
  const [flagged, setFlagged] = useState<ComplianceTx[]>([]);
  const [kycApplications, setKycApplications] = useState<KYCApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycLoading, setKycLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState<KYCApplication | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingDecision, setProcessingDecision] = useState(false);

  function handleReviewKYC(id: string): void {
    const app = kycApplications.find(a => a.id === id);
    if (app) {
      setSelectedApp(app);
      setRejectionReason('');
      setIsReviewOpen(true);
    }
  }

  async function handleReviewDecision(status: 'verified' | 'rejected') {
    if (!selectedApp) return;
    
    setProcessingDecision(true);
    try {
       const response = await updateKYCApplicationStatus(
         selectedApp.id, 
         status, 
         status === 'rejected' ? rejectionReason : undefined
       );

       if (response.error) {
         throw new Error(response.error);
       }
       
       // Optimistic update
       setKycApplications(prev => prev.filter(a => a.id !== selectedApp.id));
       toast.success(`Application ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
       setIsReviewOpen(false);
    } catch (err: unknown) {
      console.error('Failed to process application:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to process application';
      toast.error(message);
    } finally {
      setProcessingDecision(false);
    }
  }

  function handleInvestigateTransaction(id: string): void {
    console.log('Investigate transaction:', id);
    toast.info(`Investigation started for TX: ${id}`);

    // Mark as investigating in local state
    setFlagged(prev =>
      prev.map(tx =>
        tx.id === id ? { ...tx, status: 'investigating' as const } : tx
      )
    );

    // Deep-link into Transactions page focused on this transaction
    router.push(`/transactions?tx=${encodeURIComponent(id)}`);
  }

  useEffect(() => {
    if (sessionLoading || !isAuthenticated) {
      return;
    }

    const fetchKYCData = async () => {
      setKycLoading(true);
      try {
        const status = showHistory ? '' : 'pending';
        const kycRes = await getKYCApplications(status, 50, 0);
        if (kycRes.data?.applications) {
          const mappedApps: KYCApplication[] = kycRes.data.applications.map((app: ApiKYCApplication) => ({
            id: app.id,
            customerId: app.user_id,
            customerName: app.name || 'Unknown User',
            customerType: 'individual', // Default
            submittedAt: app.submitted_at,
            status: (app.status as KYCStatus) || KYCStatus.PENDING,
            riskLevel: RiskLevel.LOW, // Default
            riskScore: 25, // Default
            documents: app.documents?.map((doc) => ({
              type: doc.document_type || doc.type || 'ID',
              status: doc.verification_status || doc.status || 'pending',
              url: doc.front_image_url || doc.url
            })) || [],
            assignedTo: app.reviewer_id,
            lastReviewedAt: app.reviewed_at,
            email: app.email,
          }));
          setKycApplications(mappedApps);
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

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch audit logs
        const auditRes = await getAuditLogs(100, 0);
        if (auditRes.data?.logs) {
          const mappedLogs: AuditLog[] = auditRes.data.logs.map((log: ApiAuditLog) => ({
            id: log.id,
            userId: log.user_id || 'system',
            userEmail: log.user_email || 'Unknown',
            userRole: 'User', // Default
            action: (log.action as AuditAction) || AuditAction.VIEW,
            resourceType: log.entity_type || 'system',
            resourceId: log.entity_id || 'unknown',
            timestamp: log.created_at,
            ipAddress: log.ip_address || 'Unknown',
            userAgent: log.user_agent || 'Unknown',
            metadata: {
              status_code: log.status_code,
              error_message: log.error_message,
              request_id: log.request_id,
              old_values: log.old_values,
              new_values: log.new_values
            },
          }));
          setAuditLogs(mappedLogs);
        }

        // Fetch compliance reports
        const reportsRes = await getComplianceReports(50, 0);
        if (reportsRes.data?.reports) {
          const mappedReports: ComplianceReport[] = reportsRes.data.reports.map((r: ApiComplianceReport) => ({
            id: r.id,
            title: r.title,
            type: (r.type as ReportType) || ReportType.KYC_SUMMARY,
            period: { start: new Date().toISOString(), end: new Date().toISOString() }, // Default
            generatedAt: r.generated_at,
            generatedBy: 'System', // Default
            status: (r.status as ReportStatus) || 'generated',
            downloadUrl: r.url
          }));
          setComplianceReports(mappedReports);
        }

        // Fetch flagged transactions
        const txsRes = await getTransactions(100, 0, { status: 'flagged' });
        if (txsRes.data?.transactions) {
          const mapped: ComplianceTx[] = txsRes.data.transactions
            .slice(0, 20)
            .map((t) => {
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
              const timestamp = safeDate(t.created_at);
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
      } catch (err: unknown) {
        console.error('Failed to fetch compliance data:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to load compliance data';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [sessionLoading, isAuthenticated]);

  return (
    <ErrorBoundary>
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
            onExport={(startDate, endDate) => {
              const start = startDate ? new Date(startDate) : null;
              const end = endDate ? new Date(endDate) : null;
              const rows = auditLogs
                .filter((l) => {
                  const t = new Date(l.timestamp);
                  if (start && t < start) return false;
                  if (end) {
                    // include full end date
                    const eod = new Date(end);
                    eod.setHours(23, 59, 59, 999);
                    if (t > eod) return false;
                  }
                  return true;
                })
                .map((l) => ({
                  id: l.id,
                  action: l.action,
                  resource_type: l.resourceType,
                  resource_id: l.resourceId,
                  user_email: l.userEmail,
                  ip_address: l.ipAddress,
                  timestamp: l.timestamp,
                }));

              downloadCsv(
                rows,
                [
                  { key: 'id', header: 'ID' },
                  { key: 'action', header: 'Action' },
                  { key: 'resource_type', header: 'Entity type' },
                  { key: 'resource_id', header: 'Entity ID' },
                  { key: 'user_email', header: 'Actor email' },
                  { key: 'ip_address', header: 'IP address' },
                  { key: 'timestamp', header: 'Timestamp' },
                ],
                `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
              );
              toast.success('Audit log exported.');
            }}
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold px-1">Compliance Reporting</h3>
          <ComplianceReports
            reports={complianceReports}
            onGenerate={(type) => {
              toast.info(`Report generation queued: ${type}`);
            }}
            onDownload={(id) => {
              const report = complianceReports.find((r) => r.id === id);
              if (report?.downloadUrl) {
                window.open(report.downloadUrl, '_blank', 'noopener,noreferrer');
              } else {
                toast.error('No download URL available for this report.');
              }
            }}
          />
        </section>
      </div>

      {/* KYC Review Modal */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review KYC Application</DialogTitle>
            <DialogDescription>
              Review submitted documents and verify customer identity.
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {selectedApp.customerName?.[0] || 'U'}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{selectedApp.customerName || 'Unknown User'}</h4>
                  <p className="text-sm text-slate-500">{selectedApp.email || `User ID: ${selectedApp.customerId}`}</p>
                  <p className="text-xs text-slate-400 mt-1">Submitted: {new Date(selectedApp.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-sm font-medium text-slate-900">Submitted Documents</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {/* Mock documents if none exist */}
                   {(selectedApp.documents && selectedApp.documents.length > 0) ? (
                      selectedApp.documents.map((doc, i) => {
                        const filename = doc.url ? doc.url.split('/').pop() : `Document_${i+1}`;
                        const fullUrl = doc.url ? `${API_BASE}${doc.url.startsWith('/') ? '' : '/'}${doc.url}` : '#';
                        
                        return (
                        <a 
                          key={i} 
                          href={fullUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group no-underline"
                        >
                          <FileText className="text-indigo-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-slate-900">{filename}</p>
                            <p className="text-xs text-slate-500">{doc.type}</p>
                          </div>
                          <Download size={16} className="text-slate-400 group-hover:text-slate-600" />
                        </a>
                      )})
                   ) : (
                      <>
                        <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                          <FileText className="text-indigo-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">National_ID_Front.jpg</p>
                            <p className="text-xs text-slate-500">1.2 MB</p>
                          </div>
                          <Download size={16} className="text-slate-400 group-hover:text-slate-600" />
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                          <FileText className="text-indigo-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Utility_Bill.pdf</p>
                            <p className="text-xs text-slate-500">840 KB</p>
                          </div>
                          <Download size={16} className="text-slate-400 group-hover:text-slate-600" />
                        </div>
                      </>
                   )}
                </div>
              </div>

              <div className="space-y-3">
                 <Label>Rejection Reason (if rejecting)</Label>
                 <Textarea 
                   placeholder="Please provide a reason for rejection..." 
                   value={rejectionReason}
                   onChange={(e) => setRejectionReason(e.target.value)}
                   className="min-h-[80px]"
                 />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="destructive" 
                className="flex-1 sm:flex-none gap-2"
                onClick={() => handleReviewDecision('rejected')}
                disabled={processingDecision}
              >
                <XCircle size={16} /> Reject
              </Button>
              <Button 
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 gap-2"
                onClick={() => handleReviewDecision('verified')}
                disabled={processingDecision}
              >
                <CheckCircle size={16} /> Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
    </ErrorBoundary>
  );
}
