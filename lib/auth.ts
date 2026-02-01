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
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Cookie-based auth: tokens are httpOnly cookies; no local token storage

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

// Set user only (cookie carries the token)
export function setAuth(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('vs_user', JSON.stringify(user));
}

// Clear auth data
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('vs_user');
}

// Validate token with backend and handle definitive invalid sessions
export async function validateSession(): Promise<{ valid: boolean; user?: User }> {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    // Definitive 401 -> clear session
    if (response.status === 401) {
      // Do not clear immediately; allow local user cache as a fallback
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
  // Always clear local auth data first
  clearAuth();
  
  // Call backend logout endpoint if available (non-blocking)
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    }).catch(() => {});
  } catch (error) {}
}

// Check if user is admin
export function isAdmin(): boolean {
  const user = getUser();
  return user?.user_type?.toLowerCase() === 'admin';
}

