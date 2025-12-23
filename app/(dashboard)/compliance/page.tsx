'use client';

import { useState } from 'react';
import { Shield, UserCheck, AlertTriangle, ListFilter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Existing Imports
import { ComplianceStats } from '@/components/compliance/ComplianceStats';
import { KYCQueue } from '@/components/compliance/KYCQueue';
import { FlaggedTransactions } from '@/components/compliance/FlaggedTransactions';
import { AuditLogTable } from '@/components/compliance/AuditLogTable';
import { ComplianceReports } from '@/components/compliance/ComplianceReports';
import {
  MOCK_KYC_APPLICATIONS,
  MOCK_FLAGGED_TRANSACTIONS,
  MOCK_AUDIT_LOGS,
  MOCK_COMPLIANCE_REPORTS
} from '@/components/compliance/constants';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('kyc');

  function handleReviewKYC(id: string): void {
    throw new Error('Function not implemented.');
  }

  function handleInvestigateTransaction(id: string): void {
    throw new Error('Function not implemented.');
  }

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

      {/* 2. Key Metrics: High Contrast */}
      <ComplianceStats 
        kycApplications={MOCK_KYC_APPLICATIONS}
        flaggedTransactions={MOCK_FLAGGED_TRANSACTIONS}
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
                  {MOCK_KYC_APPLICATIONS.length}
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
                  {MOCK_FLAGGED_TRANSACTIONS.length}
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
              applications={MOCK_KYC_APPLICATIONS}
              onReview={handleReviewKYC}
              onAssign={(id, userId) => console.log('Assign:', id, userId)}
            />
          </TabsContent>
          <TabsContent value="fraud" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <FlaggedTransactions
              transactions={MOCK_FLAGGED_TRANSACTIONS}
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
            logs={MOCK_AUDIT_LOGS}
            onExport={(s, e) => console.log('Export:', s, e)}
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold px-1">Compliance Reporting</h3>
          <ComplianceReports
            reports={MOCK_COMPLIANCE_REPORTS}
            onGenerate={(type) => console.log('Generate:', type)}
            onDownload={(id) => console.log('Download:', id)}
          />
        </section>
      </div>
    </div>
  );
}