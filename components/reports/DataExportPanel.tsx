'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Clock, CheckCircle2, AlertCircle, Loader2, MoreHorizontal } from 'lucide-react';

export const DataExportPanel = () => {
  const exportHistory = [
    { id: '1', name: 'Transaction Report Q4 2023', format: 'CSV', size: '4.2 MB', requested: '2024-01-15 10:30', status: 'completed' },
    { id: '2', name: 'User Analytics - December', format: 'PDF', size: '2.8 MB', requested: '2024-01-10 14:20', status: 'completed' },
    { id: '3', name: 'Merchant Performance', format: 'Excel', size: '5.1 MB', requested: '2024-01-05 09:15', status: 'completed' },
    { id: '4', name: 'Currency Conversion Analysis', format: 'CSV', size: '3.7 MB', requested: '2024-01-02 16:45', status: 'processing' },
    { id: '5', name: 'Risk Assessment Data', format: 'JSON', size: '6.3 MB', requested: '2023-12-28 11:30', status: 'failed' },
  ];

  const quickExports = [
    { name: 'Daily Transactions', category: 'Finance', color: 'var(--color-primary)' },
    { name: 'User Activity Log', category: 'Security', color: 'var(--color-secondary)' },
    { name: 'Merchant Statements', category: 'B2B', color: 'var(--color-chart-3)' },
    { name: 'Compliance Reports', category: 'Legal', color: 'var(--color-chart-4)' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Exports Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight">Quick Data Exports</h3>
            <p className="text-sm text-muted-foreground font-medium">One-tap generation for common datasets</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickExports.map((item, index) => (
            <Card key={index} className="group border-none shadow-sm hover:ring-2 ring-primary/20 transition-all bg-card overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.category}</p>
                  <h4 className="font-bold text-sm mt-1">{item.name}</h4>
                </div>
                <button className="w-full py-3 px-5 bg-muted/50 hover:bg-primary hover:text-white transition-colors flex items-center justify-between text-xs font-bold uppercase tracking-tight">
                  Generate CSV
                  <Download className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Export History */}
      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Export History</CardTitle>
            <CardDescription>Audit trail of generated reporting assets</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold border-border">
            Clear History
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Report Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Type</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">Size/Date</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exportHistory.map((item) => (
                  <TableRow key={item.id} className="border-border group transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm group-hover:text-primary transition-colors cursor-default">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {item.requested}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none font-bold text-[10px]">
                        {item.format}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.status === 'completed' && (
                        <div className="flex items-center gap-1.5 text-brand-green font-bold text-xs">
                          <CheckCircle2 className="h-4 w-4" />
                          Ready
                        </div>
                      )}
                      {item.status === 'processing' && (
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </div>
                      )}
                      {item.status === 'failed' && (
                        <div className="flex items-center gap-1.5 text-destructive font-bold text-xs">
                          <AlertCircle className="h-4 w-4" />
                          Failed
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-muted-foreground">{item.size}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === 'completed' ? (
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-brand-green/10 hover:text-brand-green transition-colors">
                          <Download className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" disabled>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};