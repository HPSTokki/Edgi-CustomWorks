<script lang="ts">

  import { enhance } from "$app/forms";

  let email: string = $state("");
  let password: string = $state("");


</script>

<svelte:head>
  <title>Log In</title>
</svelte:head>

<div class="min-h-screen flex flex-col md:flex-row md:items-center md:justify-center bg-background-light dark:bg-background-dark">
  <div class="hidden md:flex md:flex-1 md:items-center md:justify-center md:h-screen bg-red-500">
    <div class="text-center text-white p-8 max-w-md">
      <div class="mb-8">
        <img
          alt="EdGi Custom Works logo"
          class="h-32 w-32 mx-auto mb-4 border border-slate-500 rounded-full"
          src="#"
        />
        <h1 class="font-display text-6xl uppercase tracking-wider font-bold text-zinc-800">EdGi</h1>
        <p class="text-lg uppercase tracking-widest text-zinc-800 mt-2">
          Custom Works
        </p>
      </div>
      <p class="text-xl font-light text-zinc-800">
        Airsofting It So Good
      </p>
    </div>
  </div>

  <div class="flex-1 w-full max-w-md mx-auto md:max-w-none md:mx-0 md:flex md:items-center md:justify-center md:h-screen">
    <div class="w-full max-w-md mx-auto flex flex-col md:max-w-lg md:scale-110">
      <header class="md:hidden relative w-full h-48 overflow-hidden bg-background-light dark:bg-background-dark">
        <div class="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[150%] aspect-square">
          <div class="w-full h-full rounded-b-full bg-red-500 flex items-center justify-center pt-[33%]">
            <svg
              class="w-full h-auto text-black/70 absolute bottom-0 left-0"
              viewBox="0 0 100 50"
            >
              <path
                d="M0 50 A 50 50 0 0 1 100 50"
                fill="none"
                stroke="currentColor"
                stroke-width="0.75"
              ></path>
              <path
                d="M50 0 V 50 M0 25 H 100"
                fill="none"
                stroke="currentColor"
                stroke-width="0.25"
              ></path>
              <path
                d="M50 5 L50 45 M5 25 H 95"
                fill="none"
                stroke="currentColor"
                stroke-width="0.1"
              ></path>
              <path
                d="M48 25 H 52 M50 23 V 27"
                fill="none"
                stroke="currentColor"
                stroke-width="0.5"
              ></path>
              <path
                d="M50 5 L 49 5 M50 10 L 49 10 M50 15 L 49 15 M50 20 L 49 20"
                stroke="currentColor"
                stroke-width="0.2"
              ></path>
              <path
                d="M50 30 L 49 30 M50 35 L 49 35 M50 40 L 49 40 M50 45 L 49 45"
                stroke="currentColor"
                stroke-width="0.2"
              ></path>
              <path
                d="M50 7.5 L 49.5 7.5 M50 12.5 L 49.5 12.5 M50 17.5 L 49.5 17.5"
                stroke="currentColor"
                stroke-width="0.2"
              ></path>
              <path
                d="M50 32.5 L 49.5 32.5 M50 37.5 L 49.5 37.5 M50 42.5 L 49.5 42.5"
                stroke="currentColor"
                stroke-width="0.2"
              ></path>
              <path
                d="M5 25 L 5 26 M10 25 L 10 26 M15 25 L 15 26 M20 25 L 20 26 M25 25 L 25 26 M30 25 L 30 26 M35 25 L 35 26 M40 25 L 40 26 M45 25 L 45 26"
                stroke="currentColor"
                stroke-width="0.2"
              ></path>
              <path
                d="M55 25 L 55 26 M60 25 L 60 26 M65 25 L 65 26 M70 25 L 70 26 M75 25 L 75 26 M80 25 L 80 26 M85 25 L 85 26 M90 25 L 90 26 M95 25 L 95 26"
                stroke="currentColor"
                stroke-width="0.2"
              ></path>
            </svg>
          </div>
        </div>
      </header>

      <main class="grow w-full px-6 z-10 md:mt-0 md:px-8 ">
        <!-- Mobile Branding -->
        <div class="md:hidden flex flex-col items-center mb-8">
          <div class="bg-background-light dark:bg-background-dark p-2 rounded-full mb-2 shadow-md">
            <img
              alt="EdGi Custom Works logo"
              class="h-16 w-16"
              src="#"
            />
          </div>
          <h1 class="font-display text-5xl uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            EdGi
          </h1>
          <p class="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
            Custom Works
          </p>
        </div>

        <!-- Login Form -->
        <div class="bg-slate-500/10 p-6 rounded-lg shadow-lg w-full md:shadow-xl md:p-8 text-zinc-900">
          <h2 class="text-3xl font-bold text-center mb-6 text-zinc-900">
            Log In
          </h2>
          <form class="space-y-6" method="POST" use:enhance>
            <div>
              <label class="block text-sm font-medium text-zinc-700" for="email">
                Email
              </label>
              <div class="mt-1">
                <input
                  autocomplete="email"
                  class="block w-full rounded-3xl border border-slate-600 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:ring-primary focus:border-primary py-3 px-4"
                  id="email"
                  name="email"
                  bind:value={email}
                  required
                  type="email"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-700" for="password">
                Password
              </label>
              <div class="mt-1 relative">
                <input
                  autocomplete="current-password"
                  class="block w-full rounded-3xl border border-slate-600 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:ring-primary focus:border-primary py-3 px-4"
                  id="password"
                  name="password"
                  bind:value={password}
                  required
                  type="password"
                />
              </div>
              <div class="text-right mt-2">
                <a class="text-sm font-medium text-zinc-900 hover:underline" href="/">
                  Forgot password?
                </a>
              </div>
            </div>
            <div>
              <button
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded shadow-sm text-base font-medium text-white bg-red-700/60 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-zinc-900 transition-colors"
                type="submit"
              >
                Log In
              </button>
            </div>
          </form>
        </div>
      </main>

      <!-- Footer -->
      <footer class="w-full px-6 py-8 text-center md:py-6">
        <p class="text-sm text-zinc-600 dark:text-zinc-400">
          Don't have an account? 
          <a class="font-medium text-zinc-900 hover:underline ml-1" href="/user/signup">
            Sign Up
          </a>
        </p>
      </footer>
    </div>
  </div>
</div>