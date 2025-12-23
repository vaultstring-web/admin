'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Download, Filter, FileText, Calendar as CalendarIcon, CheckCircle2, ChevronRight } from 'lucide-react';

export const CustomReportBuilder = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    currency: 'all',
    region: 'all',
    merchantType: 'all',
    includeInactive: false,
  });

  const availableMetrics = [
    { id: 'transactions', label: 'Transaction Volume', category: 'Volume' },
    { id: 'revenue', label: 'Revenue from Fees', category: 'Revenue' },
    { id: 'users', label: 'User Growth', category: 'Users' },
    { id: 'merchants', label: 'Merchant Activity', category: 'Merchants' },
    { id: 'conversions', label: 'Currency Conversions', category: 'Currency' },
    { id: 'risks', label: 'Risk Metrics', category: 'Compliance' },
    { id: 'geography', label: 'Geographic Distribution', category: 'Geography' },
    { id: 'time_series', label: 'Time Series Analysis', category: 'Trends' },
  ];

  const toggleMetric = (id: string) => {
    setSelectedMetrics(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  return (
    <Card className="border-none shadow-sm bg-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Filter className="h-5 w-5" />
              </div>
              Report Engine
            </CardTitle>
            <CardDescription>Configure and export proprietary data subsets</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-border hover:bg-muted">Save Template</Button>
            <Button className="bg-brand-green hover:bg-brand-green/90 text-white gap-2">
              <Download className="h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Main Configuration Area */}
          <div className="lg:col-span-3 p-6 space-y-8 border-r border-border/50">
            
            {/* 1. Date Context */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">01</span>
                <h3 className="font-bold text-sm uppercase tracking-wider">Date Context</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Reporting Period Start</Label>
                  <div className="relative">
                    <Input type="date" className="bg-background border-border focus:ring-primary/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase">Reporting Period End</Label>
                  <div className="relative">
                    <Input type="date" className="bg-background border-border focus:ring-primary/20" />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Global Filters */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">02</span>
                <h3 className="font-bold text-sm uppercase tracking-wider">Global Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['currency', 'region', 'merchantType'].map((filter) => (
                  <div key={filter} className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase">{filter.replace('Type', '')}</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All {filter.replace('Type', '')}s</SelectItem>
                        <SelectItem value="subset">Selected Subset</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Include Inactive Entities</Label>
                  <p className="text-xs text-muted-foreground">Show historical data for closed or dormant accounts</p>
                </div>
                <Switch checked={filters.includeInactive} onCheckedChange={(val) => setFilters({...filters, includeInactive: val})} />
              </div>
            </section>

            {/* 3. Metric Selection */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold">03</span>
                <h3 className="font-bold text-sm uppercase tracking-wider">Metric Selection</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {availableMetrics.map((metric) => {
                  const isSelected = selectedMetrics.includes(metric.id);
                  return (
                    <div 
                      key={metric.id}
                      onClick={() => toggleMetric(metric.id)}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
                        isSelected 
                          ? 'border-brand-green bg-brand-green/5 ring-1 ring-brand-green/20' 
                          : 'border-border bg-background hover:border-muted-foreground/30'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-brand-green" />}
                      <p className={`text-xs font-bold uppercase tracking-tighter ${isSelected ? 'text-brand-green' : 'text-muted-foreground'}`}>
                        {metric.category}
                      </p>
                      <p className="text-sm font-bold mt-1 leading-tight">{metric.label}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar: Export & Summary */}
          <div className="bg-muted/10 p-6 space-y-8">
            <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider">Export Format</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'pdf', label: 'Portable Document (PDF)', icon: FileText },
                  { id: 'csv', label: 'Spreadsheet (CSV)', icon: FileText },
                  { id: 'xlsx', label: 'Excel Workbook (XLSX)', icon: Download },
                ].map((format) => (
                  <button 
                    key={format.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <format.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-semibold">{format.label}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 space-y-4">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">Configuration Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Metrics</span>
                  <span className="font-bold">{selectedMetrics.length} selected</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-bold uppercase">{filters.currency}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Output</span>
                  <span className="font-bold">Encrypted PDF</span>
                </div>
              </div>
              <div className="h-px bg-secondary/10 w-full" />
              <p className="text-[10px] text-muted-foreground italic">
                * Final report will be delivered to your verified email within 2-5 minutes.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};