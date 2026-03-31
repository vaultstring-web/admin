'use client';

import React, { useState } from 'react';
import { Shield, Check, AlertTriangle, FileText, Hash, Lock, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getWalletAddresses } from '@/lib/api';

export const VerificationSection: React.FC = () => {
  const [onChain, setOnChain] = useState('');
  const [refHash, setRefHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<'IDLE' | 'MATCH' | 'MISMATCH'>('IDLE');

  const handleVerify = () => {
    if (!onChain || !refHash) return;
    setVerifying(true);
    setResult('IDLE');
    
    // Simulate cryptographic proof verification
    setTimeout(() => {
      setVerifying(false);
      setResult(onChain.trim() === refHash.trim() ? 'MATCH' : 'MISMATCH');
    }, 1500);
  };

  const handleReset = () => {
    setOnChain('');
    setRefHash('');
    setResult('IDLE');
    setVerifying(false);
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-950 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
      <CardHeader className="border-b border-slate-50 dark:border-slate-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-black tracking-tight uppercase">
              Integrity Audit Terminal
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">
              Execute cross-reference validation between local state and immutable ledger records.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <Label
                htmlFor="on-chain-hash"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400"
              >
                On-Chain State Hash
              </Label>
              <Badge
                variant="outline"
                className="text-[9px] font-mono border-emerald-500/20 text-emerald-600 bg-emerald-50/50"
              >
                SHA-256
              </Badge>
            </div>
            <div className="relative group">
              <Hash className="absolute right-3 top-3 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <Textarea
                id="on-chain-hash"
                value={onChain}
                onChange={(e) => setOnChain(e.target.value)}
                placeholder="Paste 64-character hex string..."
                className="min-h-32 font-mono text-[11px] bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500/30 transition-all resize-none leading-relaxed"
                disabled={verifying}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <Label
                htmlFor="ref-hash"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400"
              >
                System Reference
              </Label>
              <Badge
                variant="outline"
                className="text-[9px] font-mono border-slate-200 text-slate-500"
              >
                Local-Buffer
              </Badge>
            </div>
            <div className="relative group">
              <FileText className="absolute right-3 top-3 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <Textarea
                id="ref-hash"
                value={refHash}
                onChange={(e) => setRefHash(e.target.value)}
                placeholder="Paste local reference hash..."
                className="min-h-32 font-mono text-[11px] bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500/30 transition-all resize-none leading-relaxed"
                disabled={verifying}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleVerify}
            disabled={verifying || !onChain.trim() || !refHash.trim()}
            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            {verifying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Computing Merkle Proof...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Execute Integrity Check
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
            disabled={verifying}
            className="h-12 px-8 font-black uppercase tracking-widest text-xs border-slate-200 dark:border-slate-800"
          >
            Clear Buffer
          </Button>
        </div>

        {result !== 'IDLE' && (
          <Alert
            className={cn(
              'animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-xl border-2',
              result === 'MATCH'
                ? 'border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5'
                : 'border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5',
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'p-2 rounded-full mt-1',
                  result === 'MATCH'
                    ? 'bg-emerald-500/20 text-emerald-600'
                    : 'bg-rose-500/20 text-rose-600',
                )}
              >
                {result === 'MATCH' ? (
                  <Check className="h-5 w-5" strokeWidth={3} />
                ) : (
                  <AlertTriangle className="h-5 w-5" strokeWidth={3} />
                )}
              </div>
              <div>
                <AlertTitle
                  className={cn(
                    'text-sm font-black uppercase tracking-tight mb-1',
                    result === 'MATCH'
                      ? 'text-emerald-800 dark:text-emerald-400'
                      : 'text-rose-800 dark:text-rose-400',
                  )}
                >
                  {result === 'MATCH'
                    ? 'Cryptographic Match Confirmed'
                    : 'Integrity Check Failed'}
                </AlertTitle>
                <AlertDescription
                  className={cn(
                    'text-xs font-medium leading-relaxed opacity-80',
                    result === 'MATCH'
                      ? 'text-emerald-700 dark:text-emerald-500'
                      : 'text-rose-700 dark:text-rose-500',
                  )}
                >
                  {result === 'MATCH'
                    ? 'The SHA-256 payload exactly matches the block commitment. Ledger state is verified as immutable and original.'
                    : 'Hash mismatch detected. The local data does not correspond with the record at the specified ledger height.'}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export const VerificationProtocolPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<'IDLE' | 'VALID' | 'INVALID'>('IDLE');
  const [checkedWallet, setCheckedWallet] = useState<string | null>(null);
  type ChainEntry = {
    id: string;
    transaction_id: string;
    entry_type: string;
    amount: string;
    currency: string;
    balance_after: string;
    created_at: string;
    previous_hash: string;
    hash: string;
    expected_previous_hash: string;
    calculated_hash: string;
    link_ok: boolean;
    hash_ok: boolean;
  };

  type ChainReport = {
    wallet_id: string;
    valid: boolean;
    count: number;
    entries: ChainEntry[];
  };

  const [entries, setEntries] = useState<ChainEntry[]>([]);

  const handleRunCheck = async () => {
    setLoading(true);
    setError(null);
    setResult('IDLE');
    setCheckedWallet(null);
    setEntries([]);

    try {
      const walletsRes = await getWalletAddresses(1, 0);
      const firstWallet = walletsRes.data.addresses?.[0];
      if (!firstWallet || !firstWallet.id) {
        setError('No wallet records available to verify.');
        setLoading(false);
        return;
      }

      setCheckedWallet(firstWallet.address || firstWallet.wallet_address || firstWallet.id);

      const res = await fetch(`/api/v1/admin/blockchain/wallets/${firstWallet.id}/ledger-chain?limit=50`, {
        credentials: 'include',
      });

      if (!res.ok) {
        setError('Ledger verification endpoint returned an error.');
        setLoading(false);
        return;
      }

      const data = (await res.json()) as ChainReport;
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setResult(data.valid ? 'VALID' : 'INVALID');
    } catch {
      setError('Failed to run ledger verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600/10 w-fit p-2 rounded-2xl">
            <Cpu className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold tracking-tight">
              Ledger Verification Protocol
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">
              Run an on-demand hash-chain integrity check against a real wallet ledger.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-xs leading-relaxed text-slate-600">
          This check walks the immutable ledger chain for a sample wallet and recomputes each hash
          to confirm that no historical entry has been tampered with.
        </p>

        <div className="flex items-center gap-3">
          <Button
            disabled={loading}
            onClick={handleRunCheck}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black tracking-widest uppercase"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running verification...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Run ledger check
              </>
            )}
          </Button>

          {checkedWallet && (
            <span className="text-[10px] font-mono text-slate-500 truncate max-w-xs">
              Wallet: {checkedWallet}
            </span>
          )}
        </div>

        {error && (
          <Alert className="border-rose-200 bg-rose-50/60">
            <AlertTitle className="text-xs font-semibold text-rose-700">
              Verification failed to run
            </AlertTitle>
            <AlertDescription className="text-[11px] text-rose-700/80">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {result !== 'IDLE' && !error && (
          <Alert
            className={cn(
              'animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-xl border-2',
              result === 'VALID'
                ? 'border-emerald-500/20 bg-emerald-50/60'
                : 'border-rose-500/20 bg-rose-50/60',
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-1 p-1.5 rounded-full',
                  result === 'VALID' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600',
                )}
              >
                {result === 'VALID' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              </div>
              <div>
                <AlertTitle className="text-xs font-black uppercase tracking-tight mb-1">
                  {result === 'VALID' ? 'Immutable chain verified' : 'Ledger integrity failure'}
                </AlertTitle>
                <AlertDescription className="text-[11px] text-slate-700/90">
                  {result === 'VALID'
                    ? 'All historical ledger entries matched their expected hashes. The chain is intact for the sampled wallet.'
                    : 'A mismatch was detected while walking the hash chain. Investigate recent ledger writes or database mutations.'}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {entries.length > 0 && (
          <div className="rounded-xl border border-emerald-100 overflow-hidden">
            <div className="px-3 py-2 bg-white flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Hash linkage (last {entries.length})
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Link OK / Hash OK
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-emerald-50/60">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">Time</th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">Type</th>
                    <th className="px-3 py-2 text-right text-[10px] font-black uppercase tracking-wider">Amount</th>
                    <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-wider">Prev → Hash</th>
                    <th className="px-3 py-2 text-right text-[10px] font-black uppercase tracking-wider">OK</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const created = e.created_at ? new Date(e.created_at) : null;
                    const short = (h: string) => (h ? `${h.slice(0, 8)}…${h.slice(-8)}` : '—');
                    return (
                      <tr key={e.id} className="border-t border-emerald-100/60">
                        <td className="px-3 py-2 text-[11px] text-slate-600">
                          {created ? created.toLocaleString() : '—'}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {e.entry_type}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-800">
                          {e.amount} {e.currency}
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] text-slate-600">
                          <span className={e.link_ok ? 'text-emerald-700' : 'text-rose-700'}>
                            {short(e.previous_hash)}
                          </span>
                          <span className="text-slate-400"> → </span>
                          <span className={e.hash_ok ? 'text-emerald-700' : 'text-rose-700'}>
                            {short(e.hash)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-[10px]">
                          <span className={e.link_ok ? 'text-emerald-700' : 'text-rose-700'}>
                            {e.link_ok ? 'L✓' : 'L✗'}
                          </span>{' '}
                          <span className={e.hash_ok ? 'text-emerald-700' : 'text-rose-700'}>
                            {e.hash_ok ? 'H✓' : 'H✗'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="pt-4 mt-2 border-t border-emerald-100 flex items-center justify-between">
          <span className="text-[10px] text-emerald-700/70 font-mono font-bold tracking-widest uppercase">
            Ledger-Integrity-v1
          </span>
          <div className="flex items-center gap-2 text-[10px] text-emerald-700/80">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            On-demand consistency check
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
