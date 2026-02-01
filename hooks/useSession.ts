// Hook for checking session validity on pages
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useSession(redirectToLogin = true) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectToLogin) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, redirectToLogin, router]);

  return {
    isAuthenticated,
    isLoading,
    user,
  };
}

