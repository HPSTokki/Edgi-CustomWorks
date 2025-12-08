<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores"; // ← Fix: Change from $app/state to $app/stores
  import { onMount } from 'svelte';
  import { cartActions } from '$lib/stores/cart';
  import CartIcon from '../components/CartIcon.svelte';
  import { browser } from '$app/environment';

  let searchValue = $state("");
  let isDropdownOpen = $state(false);

  async function getItem() {
    function formatter(searchValue: string): string {
      let formattedOutput = searchValue.toLowerCase().replace(/ /, "-");
      return formattedOutput;
    }

    const response = await fetch(`http://localhost:3000/api/products/${formatter(searchValue)}`);
    const data = await response.json();

    if (data) {
      console.log(data)
    } else {
      alert("No data found")
    }
  }

  function clearSearch() {
    searchValue = "";
  }

  $effect(() => {
    console.log('Full page data:', $page.data); // ← Fix: Use $page instead of page.data
    console.log('User data:', $page.data.user);
    console.log('Has token:', document.cookie.includes('token'));
  });

  onMount(async () => {
    if (browser) {
      // Ensure we have a sessionId in localStorage
      let sessionId = localStorage.getItem('sessionId');
      
      if (!sessionId) {
        try {
          const response = await fetch('http://localhost:3000/api/cartSessions/cart/guest', { // ← Fix: Add full URL
            method: 'GET'
          });
          
          if (response.ok) {
            const data = await response.json();
            sessionId = data.sessionId;
            if (sessionId) { // ← Fix: Add null check
              localStorage.setItem('sessionId', sessionId);
              console.log('Initialized guest session:', sessionId);
            }
          }
        } catch (error) {
          console.error('Failed to initialize guest session:', error);
        }
      }

      // If user is authenticated, store userId in localStorage
      if ($page.data.user) {
        localStorage.setItem('userId', $page.data.user.user?.id.toString() || '');
      }
    }
  });

  let { children } = $props();
</script>

<header class="sticky top-0 z-50">
  <div class="drawer text-slate-600">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="navbar bg-[#f2f2f2] w-full gap-1">
        <div class="flex-none md:hidden">
          <label
            for="my-drawer-2"
            aria-label="open sidebar"
            class="btn btn-square btn-ghost"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block h-6 w-6 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </label>
        </div>
        <div class="mx-2 flex-1 px-2 hidden md:block">
          <a href="/">EdGi Custom Works</a>
        </div>
        <div class="hidden flex-none md:block">
          <ul class="menu menu-horizontal gap-2">
            <!-- Navbar Menu Content -->
            <li><a href="/products" class="hover:bg-red-600">Products</a></li>
            <li><a href="/orders" class="hover:bg-red-600">Orders</a></li>
            {#if $page.data.user} <!-- ← Fix: Use $page.data instead of page.data -->
              <li><a href="/profile" class="hover:bg-red-600">Profile</a></li>
              {:else}
              <li><a href="/user" class="hover:bg-red-600">Login</a></li>
            {/if}
            <CartIcon />
          </ul>
        </div>
        <div class="dropdown md:dropdown-end" onfocusout={() => clearSearch()}>
          <div
            role="button"
            tabindex="0"
            class="btn btn-ghost btn-circle text-[#333] hover:text-white"
            aria-label="open cart"
          >
            <span class="material-symbols-outlined w-6 h-6 fill"> search </span>
          </div>
          <div class="dropdown-content z-10">
            <div
              class="card w-52 md:w-96 bg-[#f2f2f2] shadow-xl transition-all duration-300"
            >
              <div class="form-control z-10 ">
                <input
                  type="text"
                  placeholder="Search something"
                  class="input input-lg w-full z-10 bg-white border-slate-500"
                  bind:value={searchValue}
                  oninput={() => getItem()}
                />
              </div>
            </div>
          </div>
        </div>
        <div class="dropdown md:dropdown-end">
          <div
            role="button"
            tabindex="0"
            class="btn btn-ghost btn-circle text-[#333] dark:hover:text-white"
            aria-label="open cart"
          >
            <span class="material-symbols-outlined w-6 h-6 fill">
              notifications
            </span>
          </div>
          <div class="dropdown-content z-1">
            <div
              class="card w-52 md:w-96 bg-base-100 shadow-xl transition-all duration-300"
            >
              <ul class="gap-1 menu p-2 w-full bg-white ">
                <li class="px-1 border-b-slate-500">Notification 1</li>
                <li class="px-1">Notification 1</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="drawer-side">
      <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"
      ></label>
      <ul
        class="menu p-2 text-3xl gap-3 w-80 min-h-full bg-[#f2f2f2] text-[#333]"
      >
        <h3 class="text-xl text-[#333] p-2">EdGi Custom Works</h3>
        <!-- Sidebar content here -->
        <li class="hover:bg-red-400 transition-colors duration-300 rounded-xl">
          <a
            class="flex h-12 items-center gap-4 rounded-lg px-4"
            href="/products"
          >
            <span class="material-symbols-outlined text-[#333] fill"
              >storefront</span
            >
            <p class="text-base text-[#333] font-semibold">Products</p>
          </a>
        </li>
        <li class="hover:bg-red-400 transition-colors duration-300 rounded-xl">
          <a class="flex h-12 items-center gap-4 rounded-lg px-4" href="/cart">
            <p class="text-base text-[#333] font-semibold">Cart</p>
          </a>
        </li>
        <li class="hover:bg-red-400 transition-colors duration-300 rounded-xl">
          <a href="/" class="flex h-12 items-center gap-4 rounded-lg px-4"
            ><span class="material-symbols-outlined text-[#333] fill"
              >receipt</span
            >
            <p class="text-base text-[#333] font-semibold">Orders</p></a
          >
        </li>
        {#if $page.data.user} <!-- ← Fix: Use $page.data instead of page.data -->
          <li class="hover:bg-red-400 transition-colors duration-300 rounded-xl">
          <a href="/profile" class="flex h-12 items-center gap-4 rounded-lg px-4"
            ><span class="material-symbols-outlined"> account_circle </span>
            <p class="text-base text-[#333] font-semibold">Profile</p></a
          >
        </li>
        {:else}
        <li class="hover:bg-red-400 transition-colors duration-300 rounded-xl">
          <a href="/user" class="flex h-12 items-center gap-4 rounded-lg px-4"
            ><span class="material-symbols-outlined"> account_circle </span>
            <p class="text-base text-[#333] font-semibold">Login</p></a
          >
        </li>
        {/if}
        <hr class="bg-gray-500" />
        <li class="bg-slate-800 rounded-xl my-2">
          <button class="flex h-12 items-center gap-4 rounded-lg px-4">
            <span class="material-symbols-outlined text-[#f2f2f2] fill"
              >smart_toy</span
            >
            <p class="text-base text-[#f2f2f2] font-semibold">Edgy Boy</p>
          </button>
        </li>
      </ul>
    </div>
  </div>
</header>

<!-- Main Content -->
      <main class="flex-1 bg-[#f2f2f2] w-full flex flex-col">
        {@render children?.()}
      </main>


<footer class="footer sm:footer-horizontal bg-base-300 text-base-content p-10">
  <nav>
    <h6 class="footer-title">Services</h6>
    <a class="link link-hover" href="/">Branding</a>
    <a class="link link-hover" href="/">Design</a>
    <a class="link link-hover" href="/">Marketing</a>
    <a class="link link-hover" href="/">Advertisement</a>
  </nav>
  <nav>
    <h6 class="footer-title">Company</h6>
    <a class="link link-hover" href="/">About us</a>
    <a class="link link-hover" href="/">Contact</a>
    <a class="link link-hover" href="/">Jobs</a>
    <a class="link link-hover" href="/">Press kit</a>
  </nav>
  <nav>
    <h6 class="footer-title">Social</h6>
    <div class="grid grid-flow-col gap-4">
      <a href="/" aria-label="twitter link">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="fill-current">
          <path
            d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
        </svg>
      </a>
      <a href="/" aria-label="youtube link">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="fill-current">
          <path
            d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
        </svg>
      </a>
      <a href="/" aria-label="facebook link">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="fill-current">
          <path
            d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
        </svg>
      </a>
    </div>
  </nav>
</footer>
