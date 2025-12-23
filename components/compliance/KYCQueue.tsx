'use client';

import { KYCApplication, KYCStatus, RiskLevel } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Clock, FileStack, ArrowRight, UserCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface KYCQueueProps {
  applications: KYCApplication[];
  onReview: (id: string) => void;
  onAssign: (id: string, userId: string) => void;
}

export const KYCQueue: React.FC<KYCQueueProps> = ({ applications, onReview, onAssign }) => {
  // Mapping statuses to our new semantic brand variables
  const getStatusBadge = (status: KYCStatus) => {
    const styles: Record<KYCStatus, string> = {
      [KYCStatus.PENDING]: "bg-semantic-warning-light/10 text-semantic-warning-light border-semantic-warning-light/20",
      [KYCStatus.APPROVED]: "bg-primary/10 text-primary border-primary/20", // Brand Green
      [KYCStatus.REJECTED]: "bg-semantic-error-light/10 text-semantic-error-light border-semantic-error-light/20",
      [KYCStatus.UNDER_REVIEW]: "bg-secondary/10 text-secondary border-secondary/20", // Brand Blue
    };
    return (
      <Badge variant="outline" className={`font-medium ${styles[status]}`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getRiskBadge = (riskLevel: RiskLevel) => {
    const styles: Record<RiskLevel, string> = {
      [RiskLevel.LOW]: "bg-primary/10 text-primary",
      [RiskLevel.MEDIUM]: "bg-semantic-warning-light/10 text-semantic-warning-light",
      [RiskLevel.HIGH]: "bg-orange-500/10 text-orange-600",
      [RiskLevel.CRITICAL]: "bg-semantic-error-light text-white border-none",
    };
    return (
      <Badge className={`text-[10px] uppercase tracking-wider ${styles[riskLevel]}`}>
        {riskLevel}
      </Badge>
    );
  };

  const pendingApplications = applications.filter(app => app.status === KYCStatus.PENDING);

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight">KYC Verification</CardTitle>
          </div>
          <CardDescription className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-semantic-warning-light animate-pulse" />
            {pendingApplications.length} priority reviews outstanding
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="font-medium hover:bg-secondary hover:text-white transition-colors">
          History
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/20">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-4 px-md">Customer</TableHead>
              <TableHead>Risk Profile</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead>Assigned Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-md">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingApplications.slice(0, 5).map((app) => (
              <TableRow key={app.id} className="group transition-colors hover:bg-muted/10">
                <TableCell className="py-4 px-md">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                      {app.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {app.customerName}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono uppercase">
                        ID: {app.customerId.split('-')[0]}...
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    {getRiskBadge(app.riskLevel)}
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      Score: <span className="font-bold text-foreground">{app.riskScore}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{format(new Date(app.submittedAt), 'MMM dd')}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(app.submittedAt), 'HH:mm')}
                  </div>
                </TableCell>
                <TableCell>
                   {app.assignedTo ? (
                      <div className="flex items-center gap-2 text-sm">
                        <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                        {app.assignedTo}
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-secondary hover:bg-secondary/10">
                        Claim Task
                      </Button>
                    )}
                </TableCell>
                <TableCell>{getStatusBadge(app.status)}</TableCell>
                <TableCell className="text-right pr-md">
                  <Button 
                    size="sm" 
                    className="bg-brand-blue hover:bg-brand-blue/90 shadow-none px-4"
                    onClick={() => onReview(app.id)}
                  >
                    Review <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {pendingApplications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Queue Cleared</h3>
            <p className="text-muted-foreground max-w-62.5 mx-auto text-sm">
              All compliance checks are up to date.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};