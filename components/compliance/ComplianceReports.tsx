'use client';

import { ComplianceReport, ReportType } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, User, BarChart3, Clock, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface ComplianceReportsProps {
  reports: ComplianceReport[];
  onGenerate: (type: ReportType) => void;
  onDownload: (id: string) => void;
}

export const ComplianceReports: React.FC<ComplianceReportsProps> = ({
  reports,
  onGenerate,
  onDownload
}) => {
  const getReportTypeLabel = (type: ReportType) => {
    const labels: Record<ReportType, string> = {
      [ReportType.KYC_SUMMARY]: 'KYC Summary',
      [ReportType.TRANSACTION_MONITORING]: 'Txn Monitoring',
      [ReportType.SAR_FILING]: 'SAR Filing',
      [ReportType.CTR_FILING]: 'CTR Filing',
      [ReportType.RISK_ASSESSMENT]: 'Risk Assessment',
      [ReportType.COMPLIANCE_REVIEW]: 'Compliance Review',
    };
    return labels[type];
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-muted text-muted-foreground border-transparent",
      generated: "bg-secondary/10 text-secondary border-secondary/20",
      submitted: "bg-primary/10 text-primary border-primary/20",
      archived: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    };
    return (
      <Badge variant="outline" className={`font-semibold capitalize ${styles[status]}`}>
        {status}
      </Badge>
    );
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/5 pb-6">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="h-5 w-5 text-primary" />
            Regulatory Reporting
          </CardTitle>
          <CardDescription>
            Audit-ready documents for KYC, AML, and risk governance.
          </CardDescription>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-none">
          <Plus className="h-4 w-4 mr-2" />
          Custom Report
        </Button>
      </CardHeader>

      <CardContent className="pt-6 space-y-8">
        {/* Quick Generate Section */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Generate New Report
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.values(ReportType).map((type) => (
              <button
                key={type}
                onClick={() => onGenerate(type)}
                className="group flex flex-col items-start p-3 rounded-xl border border-border/60 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
              >
                <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 mb-3 transition-colors">
                  <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="text-xs font-bold leading-tight group-hover:text-primary transition-colors">
                  {getReportTypeLabel(type)}
                </span>
                <ChevronRight className="h-3 w-3 mt-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            ))}
          </div>
        </section>

        {/* Recent Reports Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Recent Archives
            </h3>
            <Button variant="ghost" size="sm" className="text-xs text-secondary hover:bg-secondary/5 font-bold">
              View All History
            </Button>
          </div>
          
          <div className="rounded-lg border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-3 px-md">Report Title & Data</TableHead>
                  <TableHead>Filing Period</TableHead>
                  <TableHead>Entity/User</TableHead>
                  <TableHead>Filing Status</TableHead>
                  <TableHead className="text-right pr-md">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.slice(0, 5).map((report) => (
                  <TableRow key={report.id} className="group hover:bg-muted/10 transition-colors">
                    <TableCell className="py-4 px-md">
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {report.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(report.generatedAt), 'MMM d, HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-mono bg-muted/50 px-2 py-1 rounded-md inline-flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(report.period.start), 'MMM d')} - {format(new Date(report.period.end), 'MMM d, yy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center">
                           <User className="h-3 w-3 text-secondary" />
                        </div>
                        <span className="text-xs font-medium">{report.generatedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(report.status)}
                        {report.metrics && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground px-1">
                            <BarChart3 className="h-3 w-3" />
                            {Object.keys(report.metrics).length} Data Points
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-md">
                      {report.downloadUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                          onClick={() => onDownload(report.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {reports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-xl border border-dashed border-border">
            <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No reports generated for this period</p>
            <p className="text-xs text-muted-foreground/60">Select a report type above to begin.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};