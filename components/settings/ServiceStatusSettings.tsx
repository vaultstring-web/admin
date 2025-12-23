'use client';

import { useState } from 'react';
import { 
  AlertTriangle, CheckCircle, XCircle, Server, 
  CreditCard, Mail, Bell, Activity, RefreshCw, 
  Clock, ShieldAlert 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

export const ServiceStatusSettings = () => {
  const [services, setServices] = useState([
    {
      id: '1',
      name: 'Payment Processing',
      description: 'Customer deposits and withdrawals',
      icon: <CreditCard className="h-4 w-4" />,
      status: 'operational',
      enabled: true,
      lastUpdated: '14:30 UTC',
      uptime: 99.8
    },
    {
      id: '2',
      name: 'Email Service',
      description: 'Transaction notifications',
      icon: <Mail className="h-4 w-4" />,
      status: 'operational',
      enabled: true,
      lastUpdated: '12:15 UTC',
      uptime: 99.5
    },
    {
      id: '3',
      name: 'SMS Gateway',
      description: 'OTP & security alerts',
      icon: <Bell className="h-4 w-4" />,
      status: 'degraded',
      enabled: true,
      lastUpdated: '10:45 UTC',
      uptime: 95.2
    }
  ]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'degraded': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'maintenance': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'outage': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-muted/20 border-border';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-blue">
            <Activity className="h-3 w-3" />
            System Health
          </div>
          <h2 className="text-xl font-bold tracking-tight">Infrastructure Monitor</h2>
          <p className="text-sm text-muted-foreground">Real-time status of core fintech services.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl gap-2 h-10 border-border/60">
          <RefreshCw className="h-3.5 w-3.5" />
          Force Health Check
        </Button>
      </div>

      {/* High-Level Pulse Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Operational', count: 2, color: 'text-green-500', icon: CheckCircle },
          { label: 'Degraded', count: 1, color: 'text-amber-500', icon: AlertTriangle },
          { label: 'Maintenance', count: 0, color: 'text-blue-500', icon: Clock },
          { label: 'Total Outage', count: 0, color: 'text-red-500', icon: XCircle },
        ].map((stat) => (
          <div key={stat.label} className="bg-muted/20 border border-border/40 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* Detailed Service List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Service Registry</span>
          <span className="text-[10px] font-medium text-muted-foreground italic flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
            Live Monitoring Active
          </span>
        </div>

        <div className="space-y-3">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="group bg-card border border-border/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-blue/30 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue/10 transition-colors shrink-0">
                  {service.icon}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm tracking-tight">{service.name}</h4>
                    <Badge className={`border-none text-[9px] uppercase font-black px-1.5 py-0 ${getStatusStyles(service.status)}`}>
                      {service.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8">
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Availability</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="bg-brand-green h-full" style={{ width: `${service.uptime}%` }} />
                    </div>
                    <span className="text-xs font-mono font-bold">{service.uptime}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-l border-border/60 pl-6">
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Enabled</div>
                    <div className="text-xs font-medium italic text-muted-foreground">System bypass</div>
                  </div>
                  <Switch checked={service.enabled} className="data-[state=checked]:bg-brand-blue" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Maintenance Lockdown */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-lg tracking-tight">Maintenance Protocol</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Activating this mode triggers a global circuit breaker across all transactional gateways. Use only during scheduled windows or emergency patching.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch />
              <Label className="text-xs font-bold uppercase tracking-widest text-amber-600">Activate Mode</Label>
            </div>
          </div>

          <div className="md:w-2/3 space-y-3 bg-background/50 rounded-2xl p-5 border border-amber-500/10">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Broadcast Message to Users</Label>
            <Textarea 
              placeholder="Enter details..." 
              className="resize-none border-none bg-transparent focus-visible:ring-0 text-sm leading-relaxed p-0 h-24"
              defaultValue="We are currently upgrading our core ledger systems. Expected completion by 18:00 UTC. Payments will be queued and processed automatically afterward."
            />
            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" className="text-[10px] font-bold uppercase border-amber-500/20 text-amber-600 hover:bg-amber-500/10">
                Update Broadcast
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <p className="text-xs text-muted-foreground italic flex items-center gap-2">
          <Clock className="h-3 w-3" />
          Last snapshot taken {services[0].lastUpdated}
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest">Reset</Button>
          <Button className="bg-brand-blue hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 px-8 rounded-xl font-bold transition-all hover:scale-[1.02]">
            Commit Status
          </Button>
        </div>
      </div>
    </div>
  );
};