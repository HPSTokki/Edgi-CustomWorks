<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { goto, invalidateAll } from '$app/navigation';

  let email = '';
  let password = '';
  let isLoading = false;
  let showPassword = false;

  // Get guest session ID from localStorage for cart merging
  let guestSessionId = '';
  
  if (browser) {
    guestSessionId = localStorage.getItem('sessionId') || '';
  }

  // Handle form result
  $: if ($page.form?.success) {
    if (browser && $page.form.loginData) {
      localStorage.setItem('sessionId', $page.form.loginData.sessionId);
      localStorage.setItem('userId', $page.form.loginData.id.toString());
      
      // CRITICAL: Invalidate all data to force reload
      invalidateAll().then(() => {
        // Now navigate with fresh data
        if ($page.form?.loginData.role === 1) {
          goto('/admin');
        } else {
          goto('/products');
        }
      });
    }
  }

  // Toggle password visibility
  function togglePassword() {
    showPassword = !showPassword;
  }
</script>

<svelte:head>
  <title>Login - EdGi Custom Works</title>
  <!-- Google Material Icons -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        Sign in to your account
      </h2>
    </div>
    
    {#if $page.form && !$page.form.success && $page.form.message}
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
        <p class="text-red-800 dark:text-red-200 text-sm">{$page.form.message}</p>
      </div>
    {/if}

    <form method="POST" use:enhance={() => {
      isLoading = true;
      return async ({ update }) => {
        isLoading = false;
        await update();
      };
    }} class="mt-8 space-y-6">
      <input type="hidden" name="guestSessionId" value={guestSessionId} />
      
      <div class="space-y-6">
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white dark:bg-gray-800"
            placeholder="you@example.com"
            bind:value={email}
          />
        </div>
        
        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autocomplete="current-password"
              required
              class="relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white dark:bg-gray-800"
              placeholder="••••••••"
              bind:value={password}
            />
            <button
              type="button"
              on:click={togglePassword}
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              tabindex="-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {#if showPassword}
                <span class="material-icons text-xl">visibility_off</span>
              {:else}
                <span class="material-icons text-xl">visibility</span>
              {/if}
            </button>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if isLoading}
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </span>
          {/if}
          Sign in
        </button>
        Don't have an account?
        <div class="text-sm mt-2 text-center">
          <a href="/user/signup" class="font-medium text-red-600 hover:text-red-500">
            Register here
          </a>
      </div>
    </form>
  </div>
</div>