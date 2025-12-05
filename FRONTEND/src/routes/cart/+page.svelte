<script lang="ts">
  import { onMount } from 'svelte';
  import { cart, cartActions } from '$lib/stores/cart';
  import CartItem from '../../components/CartItem.svelte';
  import type { CartData } from '$lib/types/cart';

  let isLoading: boolean = true;
  let error: string | null = null;
  const shippingCost: number = 25.00;

  onMount(async (): Promise<void> => {
    try {
      await cartActions.fetchCart();
    } catch (err) {
      error = 'Failed to load cart';
      console.error(err);
    } finally {
      isLoading = false;
    }
  });

  const handleQuantityChange = async (itemId: number, newQuantity: number): Promise<void> => {
    await cartActions.updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: number): Promise<void> => {
    await cartActions.removeItem(itemId);
  };

  const handleClearCart = async (): Promise<void> => {
    if (confirm('Are you sure you want to remove all items from your cart?')) {
      await cartActions.clearCart();
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  $: total = $cart.subtotal + shippingCost;
  $: isEmpty = $cart.items.length === 0;
</script>

<svelte:head>
  <title>Cart - Your Firearms Store</title>
  <meta name="description" content="Review your cart items and proceed to checkout" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-32">
  <!-- Header -->
  <header class="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-20">
    <div class="max-w-2xl mx-auto px-4 py-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">
        {#if isEmpty}
          Your cart is empty
        {:else}
          {$cart.items.length} {($cart.items.length === 1) ? 'item' : 'items'}
        {/if}
      </p>
    </div>
  </header>

  <main class="max-w-2xl mx-auto">
    {#if isLoading}
      <!-- Loading State -->
      <div class="p-4 space-y-4">
        {#each Array(2) as _, i}
          <div class="flex items-center gap-4 bg-white dark:bg-zinc-900 px-4 min-h-[72px] py-3 justify-between animate-pulse">
            <div class="flex items-center gap-4 flex-1">
              <div class="bg-gray-300 dark:bg-zinc-700 rounded-lg size-16 shrink-0"></div>
              <div class="flex flex-col justify-center space-y-2 flex-1">
                <div class="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-3/4"></div>
                <div class="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-1/2"></div>
              </div>
            </div>
            <div class="shrink-0">
              <div class="flex items-center gap-2">
                <div class="h-7 w-7 bg-gray-300 dark:bg-zinc-700 rounded-full"></div>
                <div class="h-4 w-4 bg-gray-300 dark:bg-zinc-700 rounded"></div>
                <div class="h-7 w-7 bg-gray-300 dark:bg-zinc-700 rounded-full"></div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else if error}
      <!-- Error State -->
      <div class="p-4">
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p class="text-red-800 dark:text-red-200">{error}</p>
          <button 
            on:click={() => cartActions.fetchCart()}
            class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    {:else if isEmpty}
      <!-- Empty Cart State -->
      <div class="p-8 text-center">
        <div class="max-w-md mx-auto">
          <div class="text-6xl mb-4">🛒</div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Start shopping to add items to your cart</p>
          <a 
            href="/products" 
            class="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    {:else}
      <!-- Cart Items -->
      <div class="divide-y divide-gray-100 dark:divide-zinc-800">
        {#each $cart.items as item (item.id)}
          <CartItem 
            {item} 
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
          />
        {/each}
      </div>

      <!-- Remove All Action -->
      <div class="flex items-center gap-4 bg-white dark:bg-zinc-900 px-4 min-h-14 justify-between border-t border-gray-100 dark:border-zinc-800 py-2 mt-4">
        <button 
          on:click={handleClearCart}
          class="flex items-center gap-4 w-full hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <div class="text-primary flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0 size-10">
            <span class="material-symbols-outlined text-lg">delete</span>
          </div>
          <p class="text-primary text-base font-medium leading-normal flex-1 truncate text-left">
            Remove All Items
          </p>
        </button>
      </div>
    {/if}
  </main>

  <!-- Checkout Section & CTA -->
  {#if !isEmpty && !isLoading && !error}
    <footer class="fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-gray-800">
      <div class="max-w-2xl mx-auto">
        <div class="p-4 space-y-3">
          <div class="flex justify-between gap-x-6 py-1">
            <p class="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">Subtotal</p>
            <p class="text-[#181111] dark:text-white text-sm font-medium leading-normal text-right">
              {formatPrice($cart.subtotal)}
            </p>
          </div>
          <div class="flex justify-between gap-x-6 py-1">
            <p class="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">Shipping</p>
            <p class="text-[#181111] dark:text-white text-sm font-medium leading-normal text-right">
              {formatPrice(shippingCost)}
            </p>
          </div>
          <div class="flex justify-between gap-x-6 py-1 border-t border-dashed border-gray-300 dark:border-gray-700 mt-2 pt-3">
            <p class="text-[#181111] dark:text-white text-base font-bold leading-normal">Total</p>
            <p class="text-[#181111] dark:text-white text-base font-bold leading-normal text-right">
              {formatPrice(total)}
            </p>
          </div>
        </div>
        <div class="px-4 pt-2 pb-4">
          <button 
            class="bg-primary text-white font-bold py-4 px-4 rounded-xl w-full text-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isEmpty}
          >
            Proceed to Checkout
          </button>
          <a 
            href="/products" 
            class="block text-center text-primary font-medium py-3 hover:text-primary/80 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </footer>
  {/if}
</div>