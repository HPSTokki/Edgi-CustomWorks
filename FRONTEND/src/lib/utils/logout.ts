// src/lib/utils/logout.ts (no changes needed, this is just TypeScript)
import { browser } from '$app/environment';

/**
 * Utility function to handle logout from anywhere in the app
 */
export const performLogout = async (options?: {
  redirectTo?: string;
  confirm?: boolean;
  apiBaseUrl?: string;
}): Promise<{ success: boolean; error?: string }> => {
  const {
    redirectTo = '/',
    confirm = true,
    apiBaseUrl = 'http://localhost:3000'
  } = options || {};

  if (confirm && browser && !window.confirm('Are you sure you want to logout?')) {
    return { success: false, error: 'Cancelled by user' };
  }

  try {
    // Get token from localStorage or cookies
    const getToken = () => {
      if (!browser) return null;
      
      const token = localStorage.getItem('token') || 
                    sessionStorage.getItem('token');
      
      if (!token) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'token') {
            return value;
          }
        }
      }
      
      return token;
    };

    const token = getToken();
    
    // Call Express logout endpoint
    const response = await fetch(`${apiBaseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include'
    });

    const data = await response.json();

    // Clear client-side data regardless of server response
    if (browser) {
      // Clear localStorage
      const authKeys = [
        'auth_token', 'user_id', 'user_email', 'user_role',
        'admin_token', 'admin_id', 'session_id', 'sessionId', 'userId'
      ];
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name.includes('token') || name.includes('session') || name.includes('auth')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    }

    if (data.success) {
      // Redirect if in browser
      if (browser && redirectTo) {
        window.location.href = redirectTo;
      }
      
      return { success: true };
    } else {
      return { 
        success: false, 
        error: data.message || 'Logout failed' 
      };
    }
  } catch (error) {
    console.error('Logout error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Quick logout without confirmation
 */
export const quickLogout = () => performLogout({ confirm: false });

/**
 * Admin-specific logout (can add admin-specific cleanup if needed)
 */
export const adminLogout = async () => {
  return performLogout({ 
    redirectTo: '/admin/login',
    confirm: true 
  });
};