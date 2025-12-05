<script lang="ts">
  import { cart } from '$lib/stores/cart';
  import { page } from '$app/stores';

  $: totalItems = $cart.items.reduce((sum, item) => sum + item.quantity, 0);
  $: isAuthenticated = $page.data.user !== null;
</script>

<a href="/cart" class="relative inline-flex items-center p-2 text-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-colors">
  <span class="material-symbols-outlined text-2xl">shopping_cart</span>
  
  {#if totalItems > 0}
    <span class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
      {totalItems > 99 ? '99+' : totalItems}
    </span>
  {/if}
  
  <span class="sr-only">Cart ({totalItems} items)</span>
</a>