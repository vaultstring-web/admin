'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Search, ChevronRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { FailedTransaction } from './types';

interface FailedTransactionsProps {
  transactions: FailedTransaction[];
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

export const FailedTransactions: React.FC<FailedTransactionsProps> = ({ 
  transactions,
  page = 1,
  total = 0,
  limit = 5,
  onPageChange
}) => {
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-colors">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-destructive">Critical Exceptions</h2>
          <p className="text-sm text-muted-foreground mt-1">Actions required for recovery</p>
        </div>
        <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-xs font-bold text-destructive">{total || transactions.length}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {transactions.map((tx) => (
          <div 
            key={tx.id} 
            className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 space-y-3 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-foreground">Ref: {tx.ref}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{tx.timestamp}</p>
              </div>
              <span className="text-sm font-mono font-bold text-destructive">
                {tx.amount.toLocaleString()} {tx.currency}
              </span>
            </div>

            <div className="p-3 bg-background rounded border border-destructive/10">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={14} className="text-destructive" />
                <span className="text-xs font-bold text-destructive uppercase tracking-tighter">
                  {tx.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground italic">
                "{tx.diagnostic}"
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex-1 py-2 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <RefreshCw size={14} />
                Retry Process
              </button>
              <button className="flex-1 py-2 text-xs font-medium text-muted-foreground border border-border rounded-md hover:bg-muted transition-all flex items-center justify-center gap-1.5">
                <Search size={14} />
                Investigate
              </button>
            </div>
          </div>
        ))}

        {onPageChange && total > 0 && (
            <div className="flex items-center justify-center pt-2">
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
          )}

        {!onPageChange && (
          <button className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium py-2 mt-2">
            View all failed attempts
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};