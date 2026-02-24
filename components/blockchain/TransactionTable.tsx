'use client';

import React from 'react';
import { BlockchainTransaction } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Box, Database, ArrowRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface TransactionTableProps {
  transactions: BlockchainTransaction[];
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions,
  page = 1,
  total = 0,
  limit = 10,
  onPageChange
}) => {
  const formatTxId = (id: string) => {
    if (id.length <= 16) return id;
    return `${id.slice(0, 8)}...${id.slice(-6)}`;
  };

  const totalPages = Math.ceil(total / limit)

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-950 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-lg font-black tracking-tight uppercase">Recent Transactions</CardTitle>
          </div>
          <CardDescription className="text-xs font-medium text-slate-500">
            Live stream of blockchain transactions
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Live
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider">Tx ID</TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Timestamp
                  </div>
                </TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider text-center">Block</TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider text-center">Status</TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow 
                  key={tx.tx_id} 
                  className="group border-slate-100 dark:border-slate-800 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500 transition-colors" />
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-black text-slate-900 dark:text-slate-100 leading-none">
                          {formatTxId(tx.tx_id)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{tx.channel || 'default'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour12: false })}
                      <span className="text-[10px] ml-1 opacity-50">UTC</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-600">
                      <Box className="h-3 w-3" />
                      <span className="text-xs font-mono">{tx.block_number}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        tx.blockchain_status === 'confirmed'
                          ? 'default'
                          : tx.blockchain_status === 'failed'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="text-[10px] font-black px-2 py-0 h-5"
                    >
                      {tx.blockchain_status ?? tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      Inspect
                      <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {onPageChange && total > 0 ? (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500 font-medium">
                Showing {Math.min(limit, transactions.length)} of {total} transactions
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) onPageChange(page - 1);
                      }}
                      className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) onPageChange(page + 1);
                      }}
                      className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
