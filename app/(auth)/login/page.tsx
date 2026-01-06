'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { API_BASE } from '@/lib/constants';
import { Shield, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  // Redirect if already authenticated
  if (isAuthenticated && typeof window !== 'undefined') {
    router.push('/');
    return null;
  }

  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

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
        }),
      });

      if (!res.ok) {
        let errorMessage = 'Invalid email or password';
        try {
          const errorData = await res.json();
          errorMessage = (errorData as any)?.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = (await res.json()) as LoginResponse;

      const token = (data as LoginResponse).access_token;
      const user = (data as LoginResponse).user;

      if (!token) {
        throw new Error('Login response missing access token');
      }

      const userType = String(user?.user_type || '').toLowerCase();
      if (userType !== 'admin') {
        throw new Error('You are not authorized to access the admin dashboard');
      }

      // Use auth context to set auth state
      if (user) {
        login(token, user);
      }

      // Redirect to dashboard
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
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

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium" role="alert">
                    {error}
                  </p>
                </div>
              )}

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
