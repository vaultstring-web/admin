'use client';

import React from 'react';
import { WalletAddress } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, Copy } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from '@/components/ui/button';

interface WalletTableProps {
  wallets: WalletAddress[];
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

export const WalletTable: React.FC<WalletTableProps> = ({ 
  wallets,
  page = 1,
  total = 0,
  limit = 10,
  onPageChange
}) => {
  const totalPages = Math.ceil(total / limit);

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-950 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-lg font-black tracking-tight uppercase">Active Wallets</CardTitle>
          </div>
          <CardDescription className="text-xs font-medium text-slate-500">
            Managed wallet addresses across supported networks
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider">Address</TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider">Network</TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider text-right">Balance</TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-sm text-slate-500">
                    No wallets found
                  </TableCell>
                </TableRow>
              ) : (
                wallets.map((wallet) => (
                  <TableRow 
                    key={wallet.id} 
                    className="group border-slate-100 dark:border-slate-800 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors"
                  >
                    <TableCell className="font-mono text-xs font-medium">
                      <div className="flex items-center gap-2">
                         <span className="truncate max-w-[200px]">{wallet.address}</span>
                         <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => navigator.clipboard.writeText(wallet.address)}>
                           <Copy className="h-3 w-3 text-slate-400" />
                         </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold bg-slate-50 text-slate-600 border-slate-200">
                        {wallet.network}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {wallet.balance?.toLocaleString()} {wallet.currency}
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-500">
                      {wallet.created_at ? new Date(wallet.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {onPageChange && total > 0 && (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500 font-medium">
                Showing {Math.min(limit, wallets.length)} of {total} wallets
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
        )}
      </CardContent>
    </Card>
  );
};
