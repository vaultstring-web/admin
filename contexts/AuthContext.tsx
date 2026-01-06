'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, getToken, getUser, setAuth, clearAuth, validateSession, logout as logoutUtil, isAdmin } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const login = useCallback((newToken: string, newUser: User) => {
    setAuth(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await logoutUtil();
    setToken(null);
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const currentToken = getToken();
    const currentUser = getUser();
    
    if (!currentToken || !currentUser) {
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Set token and user immediately from storage (optimistic)
    setToken(currentToken);
    setUser(currentUser);
    setIsLoading(false);

    // Validate in background (non-blocking)
    try {
      const { valid, user: validatedUser } = await validateSession();
      if (valid && validatedUser) {
        // Update with validated user if available
        setUser(validatedUser);
      } else if (!valid) {
        // Only clear if we get a definitive invalid response
        // Check if it's a 401 (actual session expired)
        // For now, keep the session unless explicitly invalidated
        console.warn('Session validation returned invalid, but keeping session active');
      }
    } catch (error) {
      console.error('Session refresh error (non-critical):', error);
      // Don't clear session on validation errors - keep it active
    }
  }, [pathname, router]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      const currentToken = getToken();
      const currentUser = getUser();

      if (currentToken && currentUser) {
        // Set immediately from storage - don't wait for validation
        setToken(currentToken);
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
    if (!token) return;

    const interval = setInterval(() => {
      // Background validation - doesn't affect active session
      refreshSession().catch(err => {
        console.error('Auto-refresh validation failed:', err);
        // Keep session active
      });
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [token, refreshSession]);

  // Check admin access on protected routes (only redirect if definitely not authenticated)
  useEffect(() => {
    if (isLoading) return;
    
    if (pathname && !pathname.startsWith('/login')) {
      const currentToken = getToken();
      const currentUser = getUser();
      
      // Use stored values if context values aren't set yet
      const activeToken = token || currentToken;
      const activeUser = user || currentUser;
      
      if (!activeToken || !activeUser) {
        router.push('/login');
        return;
      }

      if (!isAdmin()) {
        router.push('/login');
        return;
      }
    }
  }, [token, user, isLoading, pathname, router]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user && isAdmin(),
    isLoading,
    login,
    logout,
    refreshSession,
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

