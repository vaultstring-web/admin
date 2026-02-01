'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_BASE } from '@/lib/constants';
import { User, getUser, setAuth, validateSession, logout as logoutUtil, isAdmin } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const login = useCallback((newUser: User) => {
    setAuth(newUser);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await logoutUtil();
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const currentUser = getUser();
    
    if (!currentUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Set user immediately from storage (optimistic)
    setUser(currentUser);
    setIsLoading(false);

    // Validate in background
    try {
      const { valid, user: validatedUser } = await validateSession();
      if (valid && validatedUser) {
        // Update with validated user if available
        setUser(validatedUser);
      } else if (!valid) {
        // Session invalid/expired - force logout
        setUser(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('Session refresh error (non-critical):', error);
      // Don't clear session on validation errors - keep it active
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      const currentUser = getUser();

      if (currentUser) {
        // Set immediately from storage - don't wait for validation
        setUser(currentUser);
        setIsLoading(false);
        
        // Validate in background (non-blocking, doesn't affect session)
        refreshSession().catch(err => {
          console.error('Background session validation failed:', err);
          // Keep session active even if validation fails
        });
      } else {
        setIsLoading(false);
        // Only redirect if not already on login page
        if (pathname && !pathname.startsWith('/login')) {
          router.push('/login');
        }
      }
    };

    initAuth();
  }, [pathname, router, refreshSession]);

  // Auto-refresh session every 15 minutes (less aggressive)
  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) return;

    const interval = setInterval(() => {
      // Background validation - doesn't affect active session
      refreshSession().catch(err => {
        console.error('Auto-refresh validation failed:', err);
        // Keep session active
      });
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [refreshSession]);

  // Check admin access on protected routes (only redirect if definitely not authenticated)
  useEffect(() => {
    if (isLoading) return;
    
    if (pathname && !pathname.startsWith('/login')) {
      const currentUser = getUser();
      
      // Use stored values if context values aren't set yet
      const activeUser = user || currentUser;
      
      if (!activeUser) {
        router.push('/login');
        return;
      }

      if (!isAdmin()) {
        router.push('/login');
        return;
      }
    }
  }, [user, isLoading, pathname, router]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vs_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const freshUser = data.user || data;
        setUser(freshUser);
        setAuth(freshUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && isAdmin(),
    isLoading,
    login,
    logout,
    refreshSession,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

