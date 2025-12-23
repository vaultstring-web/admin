'use client';

import React from 'react';
import { Block } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ExternalLink, Box, Database, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockTableProps {
  blocks: Block[];
}

export const BlockTable: React.FC<BlockTableProps> = ({ blocks }) => {
  const formatBlockHash = (hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-950 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-lg font-black tracking-tight uppercase">Block Explorer</CardTitle>
          </div>
          <CardDescription className="text-xs font-medium text-slate-500">
            Live monitoring of the Hyperledger immutable state
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Node Sync: Active
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider">Height</TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Commited At
                  </div>
                </TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider text-center">Load</TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider">Block Fingerprint</TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-wider text-right">Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((block) => (
                <TableRow 
                  key={block.blockNumber} 
                  className="group border-slate-100 dark:border-slate-800 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500 transition-colors" />
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-black text-slate-900 dark:text-slate-100 leading-none">
                          #{block.blockNumber.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Sequence</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                      {new Date().toLocaleTimeString([], { hour12: false })}
                      <span className="text-[10px] ml-1 opacity-50">UTC</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-slate-900 text-white dark:bg-slate-100 dark:text-black text-[10px] font-black px-2 py-0 h-5">
                      {block.txCount} TX
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 group/hash cursor-pointer">
                      <Box className="h-3 w-3 text-slate-300 group-hover/hash:text-emerald-500 transition-colors" />
                      <code className="text-[11px] font-mono font-bold text-slate-500 group-hover/hash:text-emerald-600 transition-colors">
                        {formatBlockHash(block.blockHash)}
                      </code>
                    </div>
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

        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="outline" 
            className="w-full text-[10px] font-black uppercase tracking-[0.2em] h-10 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-950 shadow-sm"
          >
            Fetch Historical Sequence
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};