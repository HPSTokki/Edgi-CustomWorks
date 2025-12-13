<!-- src/lib/components/auth/LogoutButton.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';

  // Use $props() for component props in runes mode
  let {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    showIcon = true,
    loading = false,
    redirectTo = '/',
    confirmLogout = true,
    confirmMessage = 'Are you sure you want to logout?',
    apiBaseUrl = 'http://localhost:3000'
  } = $props<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    showIcon?: boolean;
    loading?: boolean;
    redirectTo?: string;
    confirmLogout?: boolean;
    confirmMessage?: string;
    apiBaseUrl?: string;
  }>();

  const dispatch = createEventDispatcher<{
    click: void;
    success: void;
    error: Error;
  }>();

  let isLoading = $state(loading);
  let error = $state<string | null>(null);

  // Function to get token from various sources
  const getToken = () => {
    if (!browser) return null;
    
    // Try to get token from localStorage
    const token = localStorage.getItem('auth_token') || 
                  sessionStorage.getItem('auth_token');
    
    // If not found, try to get from cookies (only works for non-httpOnly cookies)
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

  // Function to clear all client-side auth data
  const clearClientAuthData = () => {
    if (!browser) return;
    
    // Clear localStorage
    const authKeys = [
      'auth_token', 'user_id', 'user_email', 'user_role',
      'admin_token', 'admin_id', 'session_id'
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear all cookies (except httpOnly ones which are server-side only)
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      // Clear all potentially auth-related cookies
      if (name.includes('token') || name.includes('session') || name.includes('auth')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    // Clear service worker caches if any
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
  };

  const handleLogout = async () => {
    if (confirmLogout && !confirm(confirmMessage)) {
      return;
    }

    dispatch('click');
    isLoading = true;
    error = null;

    try {
      const token = getToken();
      
      // Call Express logout endpoint
      const response = await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include' // Important for cookies
      });

      const data = await response.json();

      if (data.success) {
        // Clear client-side data
        clearClientAuthData();
        
        dispatch('success');
        
        // Redirect to specified page
        await goto(redirectTo);
      } else {
        throw new Error(data.message || 'Failed to logout from server');
      }
    } catch (err) {
      // Even if server logout fails, clear client-side data
      clearClientAuthData();
      
      error = err instanceof Error ? err.message : 'An error occurred during logout';
      dispatch('error', err as Error);
      console.error('Logout error:', err);
      
      // Still redirect after clearing client data
      await goto(redirectTo);
    } finally {
      isLoading = false;
    }
  };

  // CSS classes based on props
  const buttonClasses = $derived(`
    inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'md' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'}
    ${
      variant === 'primary' 
        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
        : variant === 'secondary'
        ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
        : variant === 'danger'
        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
        : 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
    }
  `);
</script>

<div class="logout-button">
  <button
    type="button"
    class={buttonClasses}
    onclick={handleLogout}
    disabled={isLoading}
    aria-label="Logout"
  >
    {#if isLoading}
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      Logging out...
    {:else}
      {#if showIcon}
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      {/if}
      Logout
    {/if}
  </button>

  {#if error}
    <div class="mt-2 text-sm text-red-600">
      {error}
    </div>
  {/if}
</div>

<style>
  .logout-button {
    display: inline-block;
  }
  
  button:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
</style>