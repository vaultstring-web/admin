'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Key, Globe, Plus, Trash2, Save, LockKeyhole, Copy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { API_BASE } from '@/lib/constants';

export const SecuritySettings = () => {
  const [totpUrl, setTotpUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  async function loadStatus() {
    setStatusLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/totp/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setTotpEnabled(Boolean(data?.enabled));
      }
    } finally {
      setStatusLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function setupTOTP() {
    setTotpError(null);
    setTotpLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/totp/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to setup TOTP');
      }
      const data = await res.json();
      setTotpUrl(data?.otp_url || null);
    } catch (e: unknown) {
      setTotpError(e instanceof Error ? e.message : 'TOTP setup failed');
    } finally {
      setTotpLoading(false);
    }
  }

  async function verifyTOTP() {
    setTotpError(null);
    setTotpLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/totp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code: totpCode.replace(/\D/g, '') }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Invalid code');
      }
      setTotpEnabled(true);
      setTotpUrl(null);
      setTotpCode('');
    } catch (e: unknown) {
      setTotpError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setTotpLoading(false);
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-3 duration-700">
      {/* Section 0: Admin 2FA (TOTP) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-green font-semibold uppercase tracking-tighter text-[10px]">
            <LockKeyhole className="h-3 w-3" />
            Two-Factor
          </div>
          <h3 className="text-lg font-bold">Admin TOTP Verification</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Protect admin access with an authenticator app. Generate a setup link, scan it, and verify your 6-digit code.
          </p>
        </div>
        <div className="lg:col-span-2 space-y-6 bg-muted/20 p-6 rounded-2xl border border-border/40">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-xs text-muted-foreground">{statusLoading ? 'Loading…' : (totpEnabled ? 'Enabled' : 'Disabled')}</p>
            </div>
            <Button
              onClick={setupTOTP}
              disabled={totpLoading || totpEnabled}
              className="bg-brand-green hover:bg-brand-green/90"
            >
              {totpLoading ? 'Generating…' : (totpEnabled ? 'Already Enabled' : 'Generate Setup Link')}
            </Button>
          </div>
          {totpError && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
              {totpError}
            </div>
          )}
          {totpUrl && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Provisioning URL
              </Label>
              <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-border/40">
                <code className="text-xs font-mono break-all">{totpUrl}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(totpUrl)}
                  className="h-8 w-8"
                  title="Copy URL"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Open your authenticator app and add an account using this link. Then enter the 6-digit code below.
              </p>
              <div className="space-y-4">
                <InputOTP
                  maxLength={6}
                  value={totpCode}
                  onChange={setTotpCode}
                  className="justify-start"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={verifyTOTP}
                    disabled={totpLoading || totpCode.replace(/\D/g, '').length !== 6}
                    className="bg-brand-blue hover:bg-brand-blue/90"
                  >
                    Verify Code
                  </Button>
                  {totpEnabled && (
                    <span className="text-xs font-medium text-brand-green">Enabled</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Section 1: Session & JWT */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-green font-semibold uppercase tracking-tighter text-[10px]">
            <Key className="h-3 w-3" />
            Authentication
          </div>
          <h3 className="text-lg font-bold">Session Security</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Manage how long users stay authenticated and how tokens behave upon credential changes.
          </p>
        </div>
        
        <div className="lg:col-span-2 space-y-6 bg-muted/20 p-6 rounded-2xl border border-border/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">JWT Expiry</Label>
              <Select defaultValue="24">
                <SelectTrigger className="bg-background border-none shadow-sm focus:ring-brand-green/20">
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Refresh Policy</Label>
              <Select defaultValue="720">
                <SelectTrigger className="bg-background border-none shadow-sm">
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720">30 days</SelectItem>
                  <SelectItem value="2160">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator className="bg-border/40" />
          <div className="flex items-center justify-between group">
            <div className="space-y-0.5">
              <Label htmlFor="force-logout" className="text-sm font-medium">Session Invalidation</Label>
              <p className="text-xs text-muted-foreground italic">Force logout on password updates</p>
            </div>
            <Switch id="force-logout" defaultChecked className="data-[state=checked]:bg-brand-green" />
          </div>
        </div>
      </section>

      {/* Section 2: Password Policies */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-blue font-semibold uppercase tracking-tighter text-[10px]">
            <Shield className="h-3 w-3" />
            Complexity
          </div>
          <h3 className="text-lg font-bold">Password Policies</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Set requirements for user passwords to ensure maximum entropy and account safety.
          </p>
        </div>
        
        <div className="lg:col-span-2 space-y-5 bg-card border border-border/60 p-6 rounded-2xl shadow-sm">
          {[
            { id: "upper", label: "Require Uppercase Letters", desc: "A-Z characters required" },
            { id: "nums", label: "Require Numbers", desc: "0-9 characters required" },
            { id: "symb", label: "Require Special Characters", desc: "Symbols like !@#$" },
          ].map((policy) => (
            <div key={policy.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={policy.id} className="text-sm font-medium">{policy.label}</Label>
                <p className="text-xs text-muted-foreground">{policy.desc}</p>
              </div>
              <Switch id={policy.id} defaultChecked className="data-[state=checked]:bg-brand-blue" />
            </div>
          ))}
          <Separator className="bg-border/40" />
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Min Length</Label>
              <Input type="number" defaultValue={8} className="bg-muted/30 border-none h-9 focus-visible:ring-brand-blue/30" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Max Attempts</Label>
              <Input type="number" defaultValue={5} className="bg-muted/30 border-none h-9" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: IP Access */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 font-semibold uppercase tracking-tighter text-[10px]">
            <Globe className="h-3 w-3" />
            Networking
          </div>
          <h3 className="text-lg font-bold">Access Whitelist</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Lock administrative access to specific geographic or network-based IP ranges.
          </p>
        </div>
        
        <div className="lg:col-span-2 space-y-6 bg-muted/20 p-6 rounded-2xl border border-border/40">
          <div className="flex items-center justify-between mb-2">
            <Label className="font-semibold">Enable Restrictive Access</Label>
            <Switch id="enable-whitelist" />
          </div>
          
          <div className="space-y-3">
            {['192.168.1.0/24', '10.0.0.1'].map((ip, index) => (
              <div key={index} className="flex items-center justify-between bg-background p-3 rounded-xl border border-border/40 shadow-xs">
                <code className="text-xs font-mono text-brand-blue font-bold tracking-tight">{ip}</code>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 p-1 bg-background rounded-xl border border-border/40 focus-within:ring-2 focus-within:ring-brand-blue/10 transition-all">
            <Input 
              placeholder="Add IP address range..." 
              className="border-none shadow-none focus-visible:ring-0 h-10 text-sm"
            />
            <Button size="sm" className="bg-brand-blue hover:bg-brand-blue/90 h-10 px-4 rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </section>

      {/* Floating Action Bar Effect */}
      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <p className="text-xs text-muted-foreground italic">Last updated: Today at 12:44 PM</p>
        <Button className="bg-brand-green hover:bg-brand-green/90 shadow-lg shadow-brand-green/10 px-8 py-6 rounded-xl text-md font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Save className="h-5 w-5 mr-2" />
          Commit Changes
        </Button>
      </div>
    </div>
  );
};
