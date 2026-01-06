'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Smartphone, Shield, CreditCard, Cpu, Save, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    security: true,
    payments: true,
    verifications: false,
    system: true,
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-950 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
      <CardHeader className="border-b border-slate-50 dark:border-slate-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
            <Settings2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-black tracking-tight uppercase">Control Center</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">
              Configure delivery protocols and alert priority levels.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8 space-y-8">
        {/* Delivery Channels */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-1">Delivery Channels</h4>
          <div className="grid gap-4">
            <PreferenceItem 
              id="email-notifications"
              icon={Mail}
              label="SMTP Relay"
              description="Critical summaries sent to registered email"
              checked={preferences.email}
              onCheckedChange={() => togglePreference('email')}
            />
            <PreferenceItem 
              id="push-notifications"
              icon={Smartphone}
              label="Real-time Push"
              description="WebSocket-based browser & mobile alerts"
              checked={preferences.push}
              onCheckedChange={() => togglePreference('push')}
            />
          </div>
        </section>

        <div className="h-px bg-slate-100 dark:bg-slate-900" />

        {/* Protocol Alerts */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-1">Protocol Alerts</h4>
          <div className="grid gap-4">
            <PreferenceItem 
              id="security-notifications"
              icon={Shield}
              label="Security Firewall"
              description="Alerts on unauthorized access or hash mismatches"
              checked={preferences.security}
              onCheckedChange={() => togglePreference('security')}
              activeColor="rose"
            />
            <PreferenceItem 
              id="payment-notifications"
              icon={CreditCard}
              label="Settlement Logic"
              description="Batch completions and transaction finality"
              checked={preferences.payments}
              onCheckedChange={() => togglePreference('payments')}
            />
            <PreferenceItem 
              id="system-notifications"
              icon={Cpu}
              label="Node Topology"
              description="System health and peer synchronization status"
              checked={preferences.system}
              onCheckedChange={() => togglePreference('system')}
            />
          </div>
        </section>

        <Button className="w-full h-12 bg-slate-900 dark:bg-white dark:text-slate-950 font-black uppercase tracking-widest text-[11px] shadow-lg transition-all active:scale-[0.98] mt-4">
          <Save className="h-4 w-4 mr-2" />
          Commit Changes to Profile
        </Button>
      </CardContent>
    </Card>
  );
};

interface PreferenceItemProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: () => void;
  activeColor?: 'emerald' | 'rose';
}

const PreferenceItem = ({ id, icon: Icon, label, description, checked, onCheckedChange, activeColor = 'emerald' }: PreferenceItemProps) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-50 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/30 transition-all hover:border-slate-200 dark:hover:border-slate-800">
    <div className="flex items-center gap-4">
      <div className={cn(
        "p-2.5 rounded-lg shrink-0",
        checked ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-black tracking-tight cursor-pointer uppercase">
          {label}
        </Label>
        <p className="text-[11px] font-medium text-slate-500 leading-none italic">
          {description}
        </p>
      </div>
    </div>
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "data-[state=checked]:bg-emerald-500",
        activeColor === 'rose' && "data-[state=checked]:bg-rose-500"
      )}
    />
  </div>
);
