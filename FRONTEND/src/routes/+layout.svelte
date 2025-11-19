<script lang="ts">
  import "../app.css";

  let searchValue = $state("");
  let isDropdownOpen = $state(false);

  function clearSearch() {
    searchValue = "";
  }

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
            <li><a href="/" class="hover:bg-red-600">Cart</a></li>
            <li><a href="/" class="hover:bg-red-600">Orders</a></li>
            <li><a href="/" class="hover:bg-red-600">Profile</a></li>
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
          <div class="dropdown-content z-1">
            <div
              class="card w-52 md:w-96 bg-[#f2f2f2] shadow-xl transition-all duration-300"
            >
              <div class="form-control">
                <input
                  type="text"
                  placeholder="Search something"
                  class="input input-lg w-full"
                  bind:value={searchValue}
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
              <ul class="gap-1 menu p-2 w-full">
                <li class="px-1">Notification 1</li>
                <li class="px-1">Notification 1</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="bg-[#f2f2f2] min-h-screen">
        {@render children?.()}
      </main>
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
            href="/Products"
          >
            <span class="material-symbols-outlined text-[#333] fill"
              >storefront</span
            >
            <p class="text-base text-[#333] font-semibold">Products</p>
          </a>
        </li>
        <li class="hover:bg-red-400 transition-colors duration-300 rounded-xl">
          <a class="flex h-12 items-center gap-4 rounded-lg px-4" href="/">
            <span class="material-symbols-outlined text-[#333] fill"
              >shopping_cart</span
            >
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
        <li class="hover:bg-red-400 transition-colors duration-300 rounded-xl">
          <a href="/" class="flex h-12 items-center gap-4 rounded-lg px-4"
            ><span class="material-symbols-outlined"> account_circle </span>
            <p class="text-base text-[#333] font-semibold">Profile</p></a
          >
        </li>
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
