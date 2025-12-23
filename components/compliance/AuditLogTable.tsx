'use client';

import { AuditLog, AuditAction } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, History, FileText, ShieldCheck, Download, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface AuditLogTableProps {
  logs: AuditLog[];
  onExport: (startDate: string, endDate: string) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const getActionBadge = (action: AuditAction) => {
    // Using semantic brand colors instead of generic Tailwind colors
    const styles: Record<string, string> = {
      [AuditAction.CREATE]: 'bg-primary/10 text-primary border-primary/20',
      [AuditAction.UPDATE]: 'bg-semantic-warning-light/10 text-semantic-warning-light border-semantic-warning-light/20',
      [AuditAction.DELETE]: 'bg-semantic-error-light/10 text-semantic-error-light border-semantic-error-light/20',
      [AuditAction.APPROVE]: 'bg-primary text-white border-transparent',
      [AuditAction.REJECT]: 'bg-semantic-error-dark text-white border-transparent',
    };

    return (
      <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-bold ${styles[action] || 'bg-muted/50 text-muted-foreground'}`}>
        {action.replace('_', ' ')}
      </Badge>
    );
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const logDate = new Date(log.timestamp);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    return matchesSearch && (!startDate || logDate >= startDate) && (!endDate || logDate <= endDate);
  });

  return (
    <Card className="border-border/60 shadow-none bg-card">
      <CardHeader className="pb-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <History className="h-5 w-5 text-secondary" />
              System Audit Trail
            </CardTitle>
            <CardDescription className="text-xs">
              Immutable record of administrative operations and resource access.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Filter by user or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 w-full md:w-64 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport(dateRange.start, dateRange.end)}
              className="h-9 border-brand-blue/20 text-brand-blue hover:bg-brand-blue/5 font-semibold"
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Sleeker Filter Bar */}
        <div className="px-md py-sm border-y border-border/40 bg-muted/10 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="bg-transparent text-xs font-medium focus:outline-none"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <span className="text-muted-foreground text-xs">to</span>
              <input
                type="date"
                className="bg-transparent text-xs font-medium focus:outline-none"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
          {(dateRange.start || dateRange.end) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-semantic-error-light hover:bg-semantic-error-light/10"
              onClick={() => setDateRange({ start: '', end: '' })}
            >
              <X className="h-3 w-3 mr-1" /> Reset Period
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/5 hover:bg-transparent border-none">
                <TableHead className="w-45 text-[11px] uppercase tracking-wider font-bold">Event Timeline</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-bold">Actor</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-bold">Operation</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-bold">Resource Reference</TableHead>
                <TableHead className="text-right pr-md text-[11px] uppercase tracking-wider font-bold">Network Origin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.slice(0, 10).map((log) => (
                <TableRow key={log.id} className="group hover:bg-muted/10 transition-colors border-border/40">
                  <TableCell className="py-3">
                    <div className="font-semibold text-sm">
                      {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{log.userEmail}</span>
                      <span className="text-[10px] text-secondary font-semibold uppercase tracking-tighter">
                        {log.userRole}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-muted rounded">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold capitalize">{log.resourceType}</span>
                        <code className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                          {log.resourceId}
                        </code>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-md">
                    <span className="text-xs font-mono bg-muted/50 px-2 py-1 rounded text-muted-foreground group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors">
                      {log.ipAddress}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <ShieldCheck className="h-10 w-10 mb-2" />
            <p className="text-sm">No security logs recorded for this filter.</p>
          </div>
        )}

        {filteredLogs.length > 10 && (
          <div className="p-md border-t border-border/40 flex justify-center bg-muted/5">
            <Button variant="ghost" size="sm" className="text-xs font-bold text-secondary hover:bg-secondary/10">
              Fetch Older Records
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};