<script lang="ts">
  import { cart, cartActions, isEmpty, total } from '$lib/stores/cart';
  import CartItem from '../../components/CartItem.svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let isLoading = $state(true);
  let error = $state<string | null>(null);

  // Derived values from stores
  const shippingCost = $derived(25.00);
  const cartTotal = $derived($total);

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

  const proceedToCheckout = async (): Promise<void> => {
    try {
      if ($isEmpty) {
        alert('Your cart is empty. Add items to your cart before checking out.');
        return;
      }

      // Validate we have a cartId (important for checkout)
      if (!$cart.cartId) {
        error = 'Cart ID not found. Please refresh your cart.';
        await cartActions.fetchCart(); // Try to refresh
        if (!$cart.cartId) {
          alert('Unable to proceed to checkout. Please try again.');
          return;
        }
      }

      if (browser) {
        await goto('/checkout');
      }
    } catch (err) {
      console.error('Error proceeding to checkout:', err);
      error = 'Failed to proceed to checkout. Please try again.';
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };
</script>

<svelte:head>
  <title>Cart - EdGi Custom Works</title>
  <meta name="description" content="Review your cart items and proceed to checkout" />
</svelte:head>

<div class="min-h-screen bg-background-light dark:bg-background-dark pb-32">
  <!-- Header -->
  <header class="bg-white dark:bg-background-dark/80 border-b border-[#e6dbdc] dark:border-white/10 sticky top-0 z-20">
    <div class="max-w-2xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p class="text-gray-500 mt-1">
            {#if $isEmpty}
              Your cart is empty
            {:else}
              {$cart.items.length} {($cart.items.length === 1) ? 'item' : 'items'}
            {/if}
          </p>
        </div>
        {#if !$isEmpty && !isLoading}
          <button
            onclick={proceedToCheckout}
            class="md:hidden px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Checkout
          </button>
        {/if}
      </div>
    </div>
  </header>

  <main class="max-w-2xl mx-auto p-2">
    {#if isLoading}
      <!-- Loading State -->
      <div class="p-4 space-y-4">
        {#each Array(2) as _, i}
          <div class="flex items-center gap-4 bg-white dark:bg-background-dark/50 px-4 min-h-[72px] py-3 justify-between animate-pulse rounded-lg">
            <div class="flex items-center gap-4 flex-1">
              <div class="bg-gray-300 dark:bg-gray-700 rounded-lg size-16 shrink-0"></div>
              <div class="flex flex-col justify-center space-y-2 flex-1">
                <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div class="shrink-0">
              <div class="flex items-center gap-2">
                <div class="h-7 w-7 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div class="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div class="h-7 w-7 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
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
            onclick={() => cartActions.fetchCart()}
            class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    {:else if $isEmpty}
      <!-- Empty Cart State -->
      <div class="p-8 text-center">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-5xl">
              shopping_cart
            </span>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p class="text-gray-500 mb-6">Start shopping to add items to your cart</p>
          <a 
            href="/products" 
            class="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            <span class="material-symbols-outlined">storefront</span>
            Browse Products
          </a>
        </div>
      </div>
    {:else}
      <!-- Cart Items -->
      <div class="divide-y divide-[#e6dbdc] dark:divide-gray-700">
        {#each $cart.items as item (item.id)}
          <CartItem 
            {item} 
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
          />
        {/each}
      </div>

      <!-- Remove All Action -->
      <div class="mt-6 px-4">
        <button 
          onclick={handleClearCart}
          class="flex items-center justify-center gap-3 w-full p-4 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <span class="material-symbols-outlined">delete</span>
          <span class="font-medium">Remove All Items</span>
        </button>
      </div>
    {/if}
  </main>

  <!-- Checkout Section & CTA -->
  {#if !$isEmpty && !isLoading && !error}
    <footer class="fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-background-dark border-t border-[#e6dbdc] dark:border-white/10 shadow-lg">
      <div class="max-w-2xl mx-auto">
        <div class="p-4 space-y-4">
          <!-- Order Summary -->
          <div class="space-y-3">
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
            <div class="flex justify-between gap-x-6 py-1 border-t border-dashed border-[#e6dbdc] dark:border-gray-700 mt-2 pt-3">
              <p class="text-[#181111] dark:text-white text-base font-bold leading-normal">Total</p>
              <p class="text-[#181111] dark:text-white text-base font-bold leading-normal text-right">
                {formatPrice(cartTotal)}
              </p>
            </div>
          </div>

          <!-- Proceed to Checkout Button -->
          <div class="space-y-3">
            <button 
              onclick={proceedToCheckout}
              class="w-full bg-red-600 text-white font-bold py-4 px-4 rounded-xl text-center hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <span class="material-symbols-outlined">shopping_bag</span>
              Proceed to Checkout
            </button>
            
            <!-- Continue Shopping Link -->
            <a 
              href="/products" 
              class="flex items-center justify-center gap-2 text-red-600 font-medium py-3 hover:text-red-700 transition-colors"
            >
              <span class="material-symbols-outlined text-lg">arrow_back</span>
              Continue Shopping
            </a>
          </div>

          <!-- Security & Trust Badges -->
          <div class="pt-4 border-t border-[#e6dbdc] dark:border-gray-700">
            <div class="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-base">lock</span>
                <span>Secure Checkout</span>
              </div>
              <div class="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-base">verified</span>
                <span>Guaranteed Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  {/if}
</div>