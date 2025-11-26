<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData } from "./$types";

    let { form } = $props<{ form?: ActionData }>(); // Use $props for form data

    let email: string = $state("");
    let password: string = $state("");
    let confirmPassword: string = $state("");
    let showPassword: boolean = $state(false);
    let showConfirmPassword: boolean = $state(false);

    function togglePassword() {
        showPassword = !showPassword;
    }

    function toggleConfirmPassword() {
        showConfirmPassword = !showConfirmPassword;
    }

    // Initialize form data if it exists (for error states)
    $effect(() => {
        if (form?.email) {
            email = form.email;
        }
    });
</script>

<svelte:head>
    <title>Sign Up</title>
</svelte:head>

<div class="min-h-screen flex flex-col md:flex-row md:items-center md:justify-center bg-background-light">
  <!-- Left side - Brand/Graphics (hidden on mobile, shown on desktop) -->
  <div class="hidden md:flex md:flex-1 md:items-center md:justify-center md:h-screen bg-red-600">
    <div class="text-center text-white p-8 max-w-md">
      <div class="mb-8">
        <div class="relative mx-auto mb-6">
            <img 
                src="/images/logo/edgi-logo.png" 
                alt="EdGi Logo" 
                class="h-32 w-32 mx-auto border-2 border-white rounded-full object-cover"
            />
        </div>
        <h1 class="font-display text-6xl uppercase tracking-wider font-bold mb-2">EdGi</h1>
        <p class="text-lg uppercase tracking-widest text-white/90">
          Custom Works
        </p>
      </div>
      <p class="text-xl font-light text-white/80">
        Create Your Custom Airsoft Gear
      </p>
    </div>
  </div>

  <div class="flex-1 w-full max-w-md mx-auto md:max-w-none md:mx-0 md:flex md:items-center md:justify-center md:h-screen">
    <div class="w-full max-w-md mx-auto flex flex-col md:max-w-lg md:scale-105">
      <div class="md:hidden relative w-full py-8 overflow-hidden bg-background-light">
        <div class="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-red-600/60 blur-3xl"></div>
        <div class="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-red-600/60 blur-3xl"></div>
        
        <div class="relative flex flex-col items-center justify-center z-10">
          <img 
            src="/images/logo/edgi-logo.png" 
            alt="EdGi Logo" 
            class="h-24 w-24 mx-auto mb-4 border-2 border-red-600 rounded-full object-cover"
          />
          <h2 class="text-center font-bold text-lg tracking-widest text-gray-900">EdGi Custom Works</h2>
        </div>
      </div>

      <main class="grow w-full px-6 pt-5 z-10 md:mt-0 md:px-8">
        <!-- Desktop Title (hidden on mobile) -->
        <h1 class="hidden md:block text-gray-900 text-3xl font-bold leading-tight text-center pb-6 mb-2">
          Create Your Account
        </h1>

        <!-- Mobile Title -->
        <h1 class="md:hidden text-gray-900 text-2xl font-bold leading-tight text-center pb-6">
          Create Your Account
        </h1>

        <!-- Error Message -->
        {#if form?.message}
          <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {form.message}
          </div>
        {/if}

        <!-- Signup Form -->
        <form method="POST" use:enhance class="flex w-full flex-col gap-4">
          <!-- Hidden fields to send data to server -->
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="password" value={password} />
          <input type="hidden" name="confirmPassword" value={confirmPassword} />
          <input type="hidden" name="role" value="0" />

          <label class="flex flex-col w-full">
            <p class="text-gray-700 text-base font-medium leading-normal pb-2">Email Address</p>
            <input 
              class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-red-600/50 border border-gray-300 bg-white focus:border-red-600 h-12 md:h-14 placeholder:text-gray-400 p-4 text-base font-normal leading-normal transition-colors duration-200" 
              placeholder="you@email.com" 
              type="email" 
              bind:value={email}
              required
            />
          </label>

          <label class="flex flex-col w-full">
            <p class="text-gray-700 text-base font-medium leading-normal pb-2">Password</p>
            <div class="flex w-full flex-1 items-stretch rounded-lg">
              <input 
                class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-red-600/50 border border-gray-300 bg-white focus:border-red-600 h-12 md:h-14 placeholder:text-gray-400 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal transition-colors duration-200" 
                placeholder="Enter your password" 
                type={showPassword ? "text" : "password"}
                bind:value={password}
                required
              />
              <button 
                aria-label="Toggle password visibility" 
                class="text-gray-400 flex border border-gray-300 bg-white items-center justify-center px-3 md:px-4 rounded-r-lg border-l-0 hover:text-gray-600 transition-colors" 
                type="button"
                onclick={() => togglePassword()}
              >
                <span class="material-symbols-outlined text-lg md:text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <label class="flex flex-col w-full">
            <p class="text-gray-700 text-base font-medium leading-normal pb-2">Confirm Password</p>
            <div class="flex w-full flex-1 items-stretch rounded-lg">
              <input 
                class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-red-600/50 border border-gray-300 bg-white focus:border-red-600 h-12 md:h-14 placeholder:text-gray-400 p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal transition-colors duration-200" 
                placeholder="Re-enter your password" 
                type={showConfirmPassword ? "text" : "password"}
                bind:value={confirmPassword}
                required
              />
              <button 
                aria-label="Toggle confirm password visibility" 
                class="text-gray-400 flex border border-gray-300 bg-white items-center justify-center px-3 md:px-4 rounded-r-lg border-l-0 hover:text-gray-600 transition-colors" 
                type="button"
                onclick={() => toggleConfirmPassword()}
              >
                <span class="material-symbols-outlined text-lg md:text-xl">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>

          <button 
            class="mt-4 flex h-12 md:h-14 w-full items-center justify-center rounded-lg bg-red-600 px-6 text-base font-bold text-white shadow-lg shadow-red-600/20 transition-transform duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-white" 
            type="submit"
          >
            Sign Up
          </button>
        </form>

        <!-- Footer Links -->
        <div class="mt-6 md:mt-8 flex w-full flex-col items-center gap-3 md:gap-4 text-center">
          <p class="text-sm text-gray-600">
            Already have an account? 
            <a class="font-semibold text-red-600 hover:text-red-700 underline ml-1" href="/user">
              Log In
            </a>
          </p>
          <p class="text-xs text-gray-500 max-w-xs">
            By signing up, you agree to our 
            <a class="underline hover:text-gray-700" href="/">
              Terms of Service & Privacy Policy
            </a>.
          </p>
        </div>
      </main>
    </div>
  </div>
</div>