'use client';

import { FlaggedTransaction } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, User, Fingerprint, Clock, Search, ShieldAlert, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface FlaggedTransactionsProps {
  transactions: FlaggedTransaction[];
  onInvestigate: (id: string) => void;
  onResolve: (id: string, resolution: string) => void;
}

export const FlaggedTransactions: React.FC<FlaggedTransactionsProps> = ({
  transactions,
  onInvestigate,
}) => {
  // Utilizing the brand-blue and semantic variables from your CSS config
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_review: "bg-semantic-warning-light/10 text-semantic-warning-light border-semantic-warning-light/20",
      investigating: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
      resolved: "bg-primary/10 text-primary border-primary/20",
      escalated: "bg-semantic-error-light/10 text-semantic-error-light border-semantic-error-light/20",
    };
    return (
      <Badge variant="outline" className={`font-medium capitalize ${styles[status] || ""}`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const pendingTransactions = transactions.filter(tx => 
    tx.status === 'pending_review' || tx.status === 'investigating'
  );

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-6">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldAlert className="h-5 w-5 text-semantic-error-light" />
            Transaction Monitoring
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-semantic-error-light" />
            {pendingTransactions.length} anomalies detected in current cycle
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="h-9 border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5">
          Audit Log
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 pl-md">Origin/Entity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Flag Reason</TableHead>
                <TableHead>Exposure</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-md">Investigation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingTransactions.slice(0, 5).map((tx) => (
                <TableRow key={tx.id} className="group hover:bg-muted/5 transition-colors">
                  <TableCell className="py-4 pl-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/5 rounded-lg group-hover:bg-brand-blue/10 transition-colors">
                        <Fingerprint className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm leading-none mb-1">{tx.customerName}</div>
                        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-tight">
                          TXN: {tx.transactionId.slice(0, 12)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-bold text-foreground">
                      {formatAmount(tx.amount, tx.currency)}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(tx.timestamp), 'HH:mm:ss')}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-50">
                      <div className="text-sm font-medium truncate">{tx.flagReason}</div>
                      <div className="flex gap-1 mt-1">
                        {tx.riskFactors.slice(0, 1).map((factor, idx) => (
                          <span key={idx} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {factor}
                          </span>
                        ))}
                        {tx.riskFactors.length > 1 && (
                          <span className="text-[10px] text-brand-blue font-medium">
                            +{tx.riskFactors.length - 1} more
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            tx.riskScore > 70 ? 'bg-semantic-error-light' : 
                            tx.riskScore > 40 ? 'bg-semantic-warning-light' : 'bg-primary'
                          }`} 
                          style={{ width: `${tx.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold">{tx.riskScore}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(tx.status)}
                      {tx.assignedTo && (
                        <span className="text-[10px] text-muted-foreground pl-1">
                          Assignee: {tx.assignedTo}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right pr-md">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onInvestigate(tx.id)}
                      className="hover:bg-brand-blue hover:text-white group/btn h-8"
                    >
                      Analyze
                      <ChevronRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pendingTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 opacity-60">
            <div className="p-4 bg-muted rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">System Clear</p>
            <p className="text-xs text-muted-foreground">No flagged activities detected.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};