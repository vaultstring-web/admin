'use client';

import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle2, XCircle, Hash, Box, Cpu, Fingerprint, Clock } from 'lucide-react';
import { Transaction } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface SearchSectionProps {
  onSearch: (hash: string) => void;
  result?: Transaction;
  error?: string;
  isLoading?: boolean;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ 
  onSearch, 
  result, 
  error,
  isLoading = false 
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'success' || s === 'valid') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400">
          <CheckCircle2 size={12} strokeWidth={3} />
          {status}
        </div>
      );
    }
    if (s === 'pending' || s === 'processing') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400">
          <AlertCircle size={12} strokeWidth={3} />
          {status}
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400">
        <XCircle size={12} strokeWidth={3} />
        {status}
      </div>
    );
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-950 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
      <CardHeader className="border-b border-slate-50 dark:border-slate-900 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Hash className="h-4 w-4 text-emerald-600" />
          </div>
          <CardTitle className="text-lg font-black tracking-tight uppercase">Transaction Lookup</CardTitle>
        </div>
        <CardDescription className="text-xs font-medium text-slate-500">
          Query the immutable ledger via Transaction Hash or Block Sequence Number.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-8 space-y-8">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="0x... or Block Height"
              className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50 transition-all font-mono text-xs"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!query.trim() || isLoading}
            className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            {isLoading ? 'Decrypting...' : 'Find Record'}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs font-black uppercase tracking-tight">Search Failed</AlertTitle>
            <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Top Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem icon={Fingerprint} label="Transaction Hash" value={result.txId} isMono />
              <DetailItem icon={AlertCircle} label="Finality Status" value={getStatusBadge(result.status)} isCustom />
              <DetailItem icon={Box} label="Block Sequence" value={`#${result.blockNumber.toLocaleString()}`} isMono />
              <DetailItem icon={Cpu} label="Creator MSP" value={result.creatorMsp} />
              <DetailItem icon={Clock} label="Confirmed At" value={formatTimestamp(result.timestamp)} />
              <DetailItem icon={Search} label="Smart Contract" value={result.chaincode} />
            </div>

            {/* Payload View */}
            {result.payload && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Payload Data</h4>
                  <Badge variant="outline" className="text-[9px] border-slate-200 dark:border-slate-800 font-mono">JSON_OBJECT</Badge>
                </div>
                <div className="relative rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  <pre className="p-5 text-[11px] font-mono text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(result.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type DetailItemProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode | string | number;
  isMono?: boolean;
  isCustom?: boolean;
};

const DetailItem = ({ icon: Icon, label, value, isMono, isCustom }: DetailItemProps) => (
  <div className="p-4 rounded-xl border border-slate-50 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 group hover:border-emerald-500/20 transition-all">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={12} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    {isCustom ? (
      <div className="pt-0.5">{value}</div>
    ) : (
      <span className={cn(
        "text-xs truncate block text-slate-900 dark:text-slate-100",
        isMono ? 'font-mono font-bold' : 'font-bold'
      )}>
        {value}
      </span>
    )}
  </div>
);
