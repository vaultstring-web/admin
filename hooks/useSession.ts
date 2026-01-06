// Hook for checking session validity on pages
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function useSession(redirectToLogin = true) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setIsChecking(true);
      return;
    }

    setIsChecking(false);

    if (!isAuthenticated && redirectToLogin) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, redirectToLogin, router]);

  return {
    isAuthenticated,
    isLoading: isLoading || isChecking,
    user,
  };
}

