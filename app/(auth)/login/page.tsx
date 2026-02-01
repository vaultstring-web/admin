'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { API_BASE } from '@/lib/constants';
import { Shield, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_type?: string;
  };
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login, isAuthenticated, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [verifyingMfa, setVerifyingMfa] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Please log in again."
      });
    } else if (searchParams.get('logout') === 'true') {
      toast({
        title: "Logged Out",
        description: "Successfully logged out.",
        variant: "default"
      });
    }
  }, [searchParams, toast]);

  // If authenticated, show loader while redirecting
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    setInfo(null);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          totp_code: mfaRequired ? mfaCode.replace(/\D/g, '') : undefined,
        }),
      });

      if (!res.ok) {
        // Handle TOTP requirement
        try {
          const errorData = await res.json();
          const err = (errorData as any)?.error;
          if (res.status === 401 && err === 'totp_required') {
            setMfaRequired(true);
            setInfo('Enter the 6-digit code from your authenticator app');
            setSubmitting(false);
            return;
          }
          throw new Error(err || `Server error: ${res.status} ${res.statusText}`);
        } catch {
          throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }
      }

      const data = (await res.json()) as LoginResponse;

      const user = (data as LoginResponse).user;

      const userType = String(user?.user_type || '').toLowerCase();
      if (userType !== 'admin') {
        throw new Error('You are not authorized to access the admin dashboard');
      }

      // Use auth context to set auth state
      if (user) {
        login(user);
        await refreshUser();
      }

      toast({
        title: "Login Successful",
        description: "Welcome back to VaultString Admin",
        variant: "default"
      });

      // Redirect to dashboard
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Login failed. Please try again.');
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err?.message || 'Login failed. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setVerifyingMfa(true);
    try {
      if (!mfaCode || mfaCode.replace(/\D/g, '').length < 6) {
        throw new Error('Please enter a valid 6-digit code');
      }
      // Re-submit login with TOTP code
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          totp_code: mfaCode.replace(/\D/g, ''),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.error || `Server error: ${res.status} ${res.statusText}`);
      }
      const data = (await res.json()) as LoginResponse;
      const user = data.user;
      if (!user) {
        throw new Error('Login response missing user');
      }
      const userType = String(user?.user_type || '').toLowerCase();
      if (userType !== 'admin') {
        throw new Error('You are not authorized to access the admin dashboard');
      }
      login(user);
      await refreshUser();
      toast({
        title: "Login Successful",
        description: "Welcome back to VaultString Admin",
        variant: "default"
      });
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Verification failed. Please try again.');
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: err?.message || 'Verification failed. Please try again.'
      });
    } finally {
      setVerifyingMfa(false);
    }
  }

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-2 sm:p-4">
        <div className="w-full max-w-xl min-w-[390px] flex flex-col items-center justify-center gap-6" style={{minWidth: 390}}>
        {/* Logo/Brand Section */}
        <div className="flex flex-col items-center mb-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#448a33] to-[#66b354] shadow-2xl mb-3">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1">
            VaultString Dashboard
          </h1>
          <p className="text-base font-medium text-gray-600 dark:text-gray-400">
            FinTech Admin Portal
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full p-10 sm:p-12 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 min-w-[380px]">
          <div className="space-y-7">
            <div className="mb-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight text-center">
                Sign in to your account
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your credentials to access the admin dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7 px-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="pl-11 h-12 w-full border-gray-300 dark:border-gray-700 focus:border-[#448a33] focus:ring-2 focus:ring-[#448a33] bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-base font-normal"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 pr-10 h-12 w-full border-gray-300 dark:border-gray-700 focus:border-[#448a33] focus:ring-2 focus:ring-[#448a33] bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-base font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs font-medium z-10"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {mfaRequired && (
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    MFA Code
                  </Label>
                  <div className="flex items-center gap-3">
                    <InputOTP
                      maxLength={6}
                      value={mfaCode}
                      onChange={setMfaCode}
                      containerClassName="gap-2"
                      className="text-base"
                    >
                      <InputOTPGroup>
                        {[0,1,2,3,4,5].map((i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium" role="alert">
                    {error}
                  </p>
                </div>
              )}
              {info && !error && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                    {info}
                  </p>
                </div>
              )}

              {!mfaRequired ? (
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#448a33] to-[#66b354] hover:from-[#3a7a2b] hover:to-[#5a9f44] text-white font-bold text-base shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              ) : (
                <Button 
                  type="button"
                  onClick={handleVerifyMfa}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#448a33] to-[#66b354] hover:from-[#3a7a2b] hover:to-[#5a9f44] text-white font-bold text-base shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2" 
                  disabled={verifyingMfa}
                >
                  {verifyingMfa ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify Code'
                  )}
                </Button>
              )}
            </form>

            <details className="w-full bg-gradient-to-r from-[#f4fef2] to-[#eafdee] border border-dashed border-[#b9ddb2] rounded-md p-3 px-4 mt-2 text-xs text-gray-700 dark:bg-[#244a1a] dark:from-[#244a1a] dark:to-[#192d16] dark:text-gray-300 cursor-pointer select-none group" open={false}>
              <summary className="font-semibold text-[#448a33] dark:text-[#66b354] focus:outline-none cursor-pointer mb-1">Need default admin credentials?</summary>
              <span className="block font-mono text-[#448a33] dark:text-[#66b354] font-bold">
                admin@example.com / Password123
              </span>
            </details>
          </div>
        </Card>
      </div>
    </div>
    <div className="w-full flex justify-center mt-10 mb-3 select-none">
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 opacity-85">
        © 2024 VaultString. All rights reserved.
      </p>
    </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
