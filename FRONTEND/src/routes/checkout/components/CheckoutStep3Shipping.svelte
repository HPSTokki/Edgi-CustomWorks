<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { cart } from '$lib/stores/cart';

  // Use $props() for component props
  const { checkoutData: initialData, subtotal: initialSubtotal, tax: initialTax, shipping: initialShipping, total: initialTotal } = $props<{
    checkoutData: any;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  }>();

  // Initialize state
  let checkoutData = $state(initialData || {});
  let subtotal = $state(initialSubtotal || 0);
  let tax = $state(initialTax || 0);
  let shipping = $state(initialShipping || 0);
  let total = $state(initialTotal || 0);

  const dispatch = createEventDispatcher();

  function handlePlaceOrder() {
    dispatch('place-order', { checkoutData, subtotal, tax, shipping, total });
  }

  function handleEditStep(step: number) {
    dispatch('edit-step', step);
  }

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };
</script>

<div class="px-4">
  <!-- Order Summary -->
  <section class="pt-6">
    <h2 class="text-[#181111] text-lg font-bold leading-tight tracking-[-0.015em] pb-3">
      Order Summary
    </h2>
    
    <div class="space-y-3">
      {#each $cart.items as item}
        <div class="flex gap-4 bg-white dark:bg-background-dark/50 rounded-lg p-3 justify-between">
          <div class="flex items-start gap-4">
            {#if item.images?.[0]}
              <div 
                class="bg-center bg-no-repeat aspect-square bg-cover rounded-md size-[70px]"
                style="background-image: url('{item.images[0]}')"
              ></div>
            {:else}
              <div class="aspect-square rounded-md size-[70px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span class="material-symbols-outlined text-gray-400">image</span>
              </div>
            {/if}
            
            <div class="flex flex-1 flex-col justify-center">
              <p class="text-[#181111] text-base font-medium leading-normal">
                {item.productName}
              </p>
              <p class="text-[#896163] dark:text-gray-400 text-sm font-normal leading-normal">
                Qty: {item.quantity}
              </p>
              {#if item.customizations && Object.keys(item.customizations).length > 0}
                <p class="text-[#896163] dark:text-gray-400 text-sm font-normal leading-normal">
                  {#each Object.entries(item.customizations) as [key, value], i}
                    {#if value?.value}
                      {key}: {value.value}{@const notLast = i < Object.keys(item.customizations).length - 1}{notLast ? ', ' : ''}
                    {/if}
                  {/each}
                </p>
              {/if}
            </div>
          </div>
          
          <div class="shrink-0">
            <p class="text-[#181111] text-base font-medium leading-normal">
              {formatPrice(item.itemTotal)}
            </p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Details Section -->
  <div class="mt-6 space-y-4">
    <!-- Shipping Address Card -->
    <div class="bg-white dark:bg-background-dark/50 rounded-lg p-4">
      <div class="flex justify-between items-center pb-2">
        <h3 class="text-base font-bold text-[#181111]">Shipping Address</h3>
        <button 
          onclick={() => handleEditStep(1)}
          class="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
        >
          Edit
        </button>
      </div>
      
      <div class="w-full h-px bg-[#e6dbdc] dark:bg-gray-700 my-2"></div>
      
      <div class="text-[#896163] dark:text-gray-300 text-sm space-y-1 pt-2">
        <p class="font-medium text-[#181111]">
          {checkoutData.shippingAddress?.fullName}
        </p>
        <p>{checkoutData.shippingAddress?.addressLine1}</p>
        {#if checkoutData.shippingAddress?.addressLine2}
          <p>{checkoutData.shippingAddress?.addressLine2}</p>
        {/if}
        <p>
          {checkoutData.shippingAddress?.city}, 
          {checkoutData.shippingAddress?.state} 
          {checkoutData.shippingAddress?.zipCode}
        </p>
        <p>{checkoutData.shippingAddress?.country}</p>
      </div>
    </div>

    <!-- Payment Method Card -->
    <div class="bg-white dark:bg-background-dark/50 rounded-lg p-4">
      <div class="flex justify-between items-center pb-2">
        <h3 class="text-base font-bold text-[#181111]">Payment Method</h3>
        <button 
          onclick={() => handleEditStep(2)}
          class="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
        >
          Edit
        </button>
      </div>
      
      <div class="w-full h-px bg-[#e6dbdc] dark:bg-gray-700 my-2"></div>
      
      <div class="flex items-center gap-3 pt-2">
        {#if checkoutData.paymentMethod === 'cash_on_delivery'}
          <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
            payments
          </span>
          <p class="text-[#181111] text-sm">Cash on Delivery</p>
        {:else}
          <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
            <span class="text-green-700 dark:text-green-400 font-bold text-xs">GCash</span>
          </div>
          <p class="text-[#181111] text-sm">PayMongo (GCash)</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Cost Breakdown -->
  <section class="mt-8">
    <div class="space-y-2">
      <div class="flex justify-between text-sm text-[#896163] dark:text-gray-400">
        <p>Subtotal</p>
        <p>{formatPrice(subtotal)}</p>
      </div>
      <div class="flex justify-between text-sm text-[#896163] dark:text-gray-400">
        <p>Shipping</p>
        <p>{formatPrice(shipping)}</p>
      </div>
      <div class="flex justify-between text-sm text-[#896163] dark:text-gray-400">
        <p>Taxes (10%)</p>
        <p>{formatPrice(tax)}</p>
      </div>
      
      <div class="w-full h-px bg-[#e6dbdc] dark:bg-gray-700 my-4"></div>
      
      <div class="flex justify-between text-lg font-bold text-[#181111]">
        <p>Grand Total</p>
        <p>{formatPrice(total)}</p>
      </div>
    </div>
  </section>
</div>

<!-- Sticky Footer -->
<footer class="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark border-t border-[#e6dbdc] dark:border-gray-800 p-4">
  <button 
    onclick={handlePlaceOrder}
    class="w-full bg-primary text-white font-bold py-4 px-6 rounded-lg text-base leading-6 text-center hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark transition-colors"
  >
    Place Order
  </button>
</footer>