// Authentication and session management utilities
import { API_BASE } from './constants';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_type?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vs_token');
}

// Get user from localStorage
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('vs_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

// Set token and user
export function setAuth(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('vs_token', token);
  localStorage.setItem('vs_user', JSON.stringify(user));
  // Also set cookie for middleware
  document.cookie = `vs_token=${token}; Path=/; SameSite=Lax; Max-Age=86400`;
}

// Clear auth data
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('vs_token');
  localStorage.removeItem('vs_user');
  // Clear cookie
  document.cookie = 'vs_token=; Path=/; SameSite=Lax; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

// Validate token with backend (non-destructive - only clears on definitive 401)
export async function validateSession(): Promise<{ valid: boolean; user?: User }> {
  const token = getToken();
  if (!token) {
    return { valid: false };
  }

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // Only clear auth on definitive 401 Unauthorized
    if (response.status === 401) {
      // Don't clear here - let the caller decide
      return { valid: false };
    }

    if (!response.ok) {
      // For other errors, assume session is still valid (might be temporary network issue)
      // Return the stored user as valid
      const storedUser = getUser();
      if (storedUser) {
        return { valid: true, user: storedUser };
      }
      return { valid: false };
    }

    const data = await response.json();
    const user = data.user || data;
    
    // Update stored user info
    if (user) {
      localStorage.setItem('vs_user', JSON.stringify(user));
    }

    return { valid: true, user };
  } catch (error) {
    console.error('Session validation error:', error);
    // On network errors, assume session is still valid (don't clear auth)
    // Return stored user as valid
    const storedUser = getUser();
    if (storedUser) {
      return { valid: true, user: storedUser };
    }
    return { valid: false };
  }
}

// Logout function - only called when user explicitly clicks logout
export async function logout(): Promise<void> {
  const token = getToken();
  
  // Always clear local auth data first
  clearAuth();
  
  // Call backend logout endpoint if available (non-blocking)
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }).catch(() => {
        // Ignore errors - we've already cleared local auth
      });
    } catch (error) {
      // Ignore errors - we've already cleared local auth
    }
  }
}

// Check if user is admin
export function isAdmin(): boolean {
  const user = getUser();
  return user?.user_type?.toLowerCase() === 'admin';
}

