<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  let email = '';
  let password = '';
  let isLoading = false;

  // Get guest session ID from localStorage for cart merging
  let guestSessionId = '';
  
  if (browser) {
    guestSessionId = localStorage.getItem('sessionId') || '';
  }

  // Handle form result
  $: if ($page.form?.success) {
    // Store sessionId and userId in localStorage
    if (browser && $page.form.loginData) {
      localStorage.setItem('sessionId', $page.form.loginData.sessionId);
      localStorage.setItem('userId', $page.form.loginData.id.toString());
      
      // Redirect to home page after successful login
      window.location.href = '/';
    }
  }
</script>

<svelte:head>
  <title>Login - EdGi Custom Works</title>
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
      
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
            placeholder="Email address"
            bind:value={email}
          />
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
            placeholder="Password"
            bind:value={password}
          />
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
      </div>
    </form>
  </div>
</div>