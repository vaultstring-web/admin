'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LineChart, TrendingUp, Globe, Layers, 
  ArrowUpRight, ShieldCheck, Zap, LayoutGrid,
  FileBarChart, DatabaseZap
} from 'lucide-react';
import { TransactionVolumeChart } from './TransactionVolumeChart';
import { UserGrowthByRegion } from './UserGrowthByRegion';
import { RevenueFromFees } from './RevenueFromFees';
import { TopMerchantsChart } from './TopMerchantsChart';
import { CurrencySpreadAnalysis } from './CurrencyConversionSpreadAnalysis';
import { CustomReportBuilder } from './CustomReportBuilder';
import { AnalyticsSummary } from './AnalyticsSummary';
import { DataExportPanel } from './DataExportPanel';
import { Badge } from '../ui/badge';

interface AnalyticsDashboardProps {
  metrics?: any;
  earnings?: any[];
}

export const AnalyticsDashboard = ({ metrics, earnings }: AnalyticsDashboardProps) => {
  return (
    <div className="space-y-8">
      {/* Note: We removed the Page Header here as it's now handled 
          by app/analytics/page.tsx. This component starts directly with the data. 
      */}

      <AnalyticsSummary metrics={metrics} />

      <Tabs defaultValue="prebuilt" className="w-full">
        <div className="flex items-center justify-between mb-6 px-1">
          <TabsList className="bg-muted/50 p-1 rounded-xl h-11 border border-border/40">
            <TabsTrigger 
              value="prebuilt" 
              className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold text-xs uppercase tracking-widest transition-all"
            >
              <FileBarChart className="h-3.5 w-3.5 mr-2" />
              PRE-BUILT REPORTS
            </TabsTrigger>
            <TabsTrigger 
              value="custom" 
              className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold text-xs uppercase tracking-widest transition-all"
            >
              <Zap className="h-3.5 w-3.5 mr-2" />
              CUSTOM REPORTS
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold text-xs uppercase tracking-widest transition-all"
            >
              <DatabaseZap className="h-3.5 w-3.5 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="prebuilt" className="mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            
            {/* Primary High-Volume Chart - Larger Span */}
            <div className="lg:col-span-4">
              <TransactionVolumeChart />
            </div>

            {/* Side Metric - Revenue */}
            <div className="lg:col-span-2">
              <RevenueFromFees earnings={earnings} />
            </div>

            {/* Row 2: Geospatial & Merchants */}
            <div className="lg:col-span-3">
              <UserGrowthByRegion />
            </div>
            
            <div className="lg:col-span-3">
              <TopMerchantsChart />
            </div>

            {/* Row 3: Specialized Analytics */}
            <div className="lg:col-span-4">
              <CurrencySpreadAnalysis />
            </div>

            <div className="lg:col-span-2">
              <Card className="h-full border border-border/50 bg-card/50 overflow-hidden group hover:border-primary/20 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold border-brand-green/30 text-brand-green bg-brand-green/5">
                      Compliant
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold mt-4">Risk Analytics</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Automated AML scoring and compliance threat monitoring for high-value nodes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-4">
                  <div className="space-y-3">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[88%] rounded-full" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground">
                      <span>Threat Index: Low</span>
                      <span className="text-primary">88/100</span>
                    </div>
                    <Button variant="secondary" className="w-full mt-4 rounded-xl text-xs font-bold gap-2">
                      Deep Audit Report
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-3xl border border-dashed border-border/60 p-8 bg-muted/10">
            <CustomReportBuilder />
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DataExportPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
