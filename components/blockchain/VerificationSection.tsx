'use client';

import React, { useState } from 'react';
import { Shield, Check, AlertTriangle, FileText, Hash, Lock, RefreshCw, Cpu, Fingerprint, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Verification Card */}
      <Card className="lg:col-span-3 border-none shadow-sm bg-white dark:bg-slate-950 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
        <CardHeader className="border-b border-slate-50 dark:border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight uppercase">Integrity Audit Terminal</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">
                Execute cross-reference validation between local state and immutable ledger records.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8 space-y-8">
          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="on-chain-hash" className="text-[10px] font-black uppercase tracking-widest text-slate-400">On-Chain State Hash</Label>
                <Badge variant="outline" className="text-[9px] font-mono border-emerald-500/20 text-emerald-600 bg-emerald-50/50">SHA-256</Badge>
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
                <Label htmlFor="ref-hash" className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Reference</Label>
                <Badge variant="outline" className="text-[9px] font-mono border-slate-200 text-slate-500">Local-Buffer</Badge>
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

          {/* Action Buttons */}
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

          {/* Verification Result */}
          {result !== 'IDLE' && (
            <Alert 
              className={cn(
                "animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-xl border-2",
                result === 'MATCH' 
                  ? 'border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5'
                  : 'border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2 rounded-full mt-1",
                  result === 'MATCH' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'
                )}>
                  {result === 'MATCH' ? <Check className="h-5 w-5" strokeWidth={3} /> : <AlertTriangle className="h-5 w-5" strokeWidth={3} />}
                </div>
                <div>
                  <AlertTitle className={cn(
                    "text-sm font-black uppercase tracking-tight mb-1",
                    result === 'MATCH' ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400'
                  )}>
                    {result === 'MATCH' ? 'Cryptographic Match Confirmed' : 'Integrity Check Failed'}
                  </AlertTitle>
                  <AlertDescription className={cn(
                    "text-xs font-medium leading-relaxed opacity-80",
                    result === 'MATCH' ? 'text-emerald-700 dark:text-emerald-500' : 'text-rose-700 dark:text-rose-500'
                  )}>
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

      {/* Information Sidebar */}
      <Card className="border-none bg-emerald-600 dark:bg-emerald-950 shadow-xl shadow-emerald-600/10">
        <CardContent className="p-6 h-full flex flex-col justify-between">
          <div className="space-y-8">
            <div className="bg-white/20 dark:bg-emerald-500/20 w-fit p-3 rounded-2xl backdrop-blur-md">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tighter">Verification Protocol</h3>
              <p className="text-emerald-50 text-xs leading-relaxed font-medium opacity-80">
                Hyperledger Fabric blocks are linked via SHA-256 hash chains. Every transaction payload is hashed and included in the block’s data commitment.
              </p>
            </div>

            <div className="space-y-4">
              <ProtocolStep icon={Fingerprint} text="SHA-256 Hashing" />
              <ProtocolStep icon={Lock} text="Merkle Tree Proof" />
              <ProtocolStep icon={Shield} text="Consensus Validation" />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-[9px] text-emerald-200/50 font-mono font-bold tracking-widest uppercase">Sec-Protocol-v4</span>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProtocolStep = ({ icon: Icon, text }: { icon: any, text: string }) => (
  <div className="flex items-center gap-3 text-emerald-50 group">
    <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
      <Icon className="h-3 w-3 text-white" />
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wide">{text}</span>
  </div>
);