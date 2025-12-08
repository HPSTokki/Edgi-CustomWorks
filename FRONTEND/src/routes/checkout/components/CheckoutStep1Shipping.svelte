<script lang="ts">
  import { enhance } from '$app/forms';
  import { createEventDispatcher } from 'svelte';

  // Use $props() instead of export let in Svelte 5
  const { shippingAddress: initialAddress } = $props<{
    shippingAddress: {
      fullName: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }>();

  // Initialize state with prop value
  let shippingAddress = $state({
    fullName: initialAddress?.fullName || '',
    addressLine1: initialAddress?.addressLine1 || '',
    addressLine2: initialAddress?.addressLine2 || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    zipCode: initialAddress?.zipCode || '',
    country: initialAddress?.country || 'Philippines'
  });

  const dispatch = createEventDispatcher();

  function handleNext() {
    // Basic validation
    if (!shippingAddress.fullName.trim() || 
        !shippingAddress.addressLine1.trim() || 
        !shippingAddress.city.trim() || 
        !shippingAddress.state.trim() || 
        !shippingAddress.zipCode.trim()) {
      return; // You could add error messages here
    }
    dispatch('next', { shippingAddress });
  }
</script>

<div>
  <!-- Headline Text -->
  <h1 class="text-[#181111] tracking-light text-[32px] font-bold leading-tight px-4 text-left pb-3 pt-6">
    Shipping Address
  </h1>

  <form onsubmit={handleNext} class="space-y-4 px-4">
    <!-- Full Name -->
    <div class="flex max-w-[480px] flex-wrap items-end gap-4 py-1">
      <label class="flex flex-col min-w-40 flex-1">
        <p class="text-[#181111]/90 text-base font-medium leading-normal pb-2">
          Full Name *
        </p>
        <input
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181111] dark:bg-background-dark focus:outline-0 focus:ring-0 border border-[#e6dbdc] dark:border-white/20 bg-white focus:border-primary h-14 placeholder:text-[#896163] p-[15px] text-base font-normal leading-normal"
          placeholder="Enter your full name"
          bind:value={shippingAddress.fullName}
          required
        />
      </label>
    </div>

    <!-- Address Line 1 -->
    <div class="flex max-w-[480px] flex-wrap items-end gap-4 py-1">
      <label class="flex flex-col min-w-40 flex-1">
        <p class="text-[#181111]/90 text-base font-medium leading-normal pb-2">
          Address Line 1 *
        </p>
        <input
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181111] dark:bg-background-dark focus:outline-0 focus:ring-0 border border-[#e6dbdc] dark:border-white/20 bg-white focus:border-primary h-14 placeholder:text-[#896163] p-[15px] text-base font-normal leading-normal"
          placeholder="Enter your street address"
          bind:value={shippingAddress.addressLine1}
          required
        />
      </label>
    </div>

    <!-- Address Line 2 -->
    <div class="flex max-w-[480px] flex-wrap items-end gap-4 py-1">
      <label class="flex flex-col min-w-40 flex-1">
        <div class="flex justify-between items-center pb-2">
          <p class="text-[#181111]/90 text-base font-medium leading-normal">
            Address Line 2
          </p>
          <p class="text-[#896163]/50 text-sm font-normal">Optional</p>
        </div>
        <input
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181111] dark:bg-background-dark focus:outline-0 focus:ring-0 border border-[#e6dbdc] dark:border-white/20 bg-white focus:border-primary h-14 placeholder:text-[#896163] p-[15px] text-base font-normal leading-normal"
          placeholder="Apt, suite, building, etc."
          bind:value={shippingAddress.addressLine2}
        />
      </label>
    </div>

    <!-- City -->
    <div class="flex max-w-[480px] flex-wrap items-end gap-4 py-1">
      <label class="flex flex-col min-w-40 flex-1">
        <p class="text-[#181111]/90 text-base font-medium leading-normal pb-2">
          City *
        </p>
        <input
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181111] dark:bg-background-dark focus:outline-0 focus:ring-0 border border-[#e6dbdc] dark:border-white/20 bg-white focus:border-primary h-14 placeholder:text-[#896163] p-[15px] text-base font-normal leading-normal"
          placeholder="Enter your city"
          bind:value={shippingAddress.city}
          required
        />
      </label>
    </div>

    <!-- State / Province & ZIP / Postal Code -->
    <div class="flex max-w-[480px] flex-wrap items-start gap-4 py-1">
      <label class="flex flex-col min-w-0 flex-1">
        <p class="text-[#181111]/90 text-base font-medium leading-normal pb-2">
          State / Province *
        </p>
        <input
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181111] dark:bg-background-dark focus:outline-0 focus:ring-0 border border-[#e6dbdc] dark:border-white/20 bg-white focus:border-primary h-14 placeholder:text-[#896163] p-[15px] text-base font-normal leading-normal"
          placeholder="State"
          bind:value={shippingAddress.state}
          required
        />
      </label>
      <label class="flex flex-col min-w-0 flex-1">
        <p class="text-[#181111]/90 text-base font-medium leading-normal pb-2">
          ZIP / Postal Code *
        </p>
        <input
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181111] dark:bg-background-dark focus:outline-0 focus:ring-0 border border-[#e6dbdc] dark:border-white/20 bg-white focus:border-primary h-14 placeholder:text-[#896163] p-[15px] text-base font-normal leading-normal"
          placeholder="ZIP Code"
          bind:value={shippingAddress.zipCode}
          required
        />
      </label>
    </div>

    <!-- Country -->
    <div class="flex max-w-[480px] flex-wrap items-end gap-4 py-1">
      <label class="flex flex-col min-w-40 flex-1">
        <p class="text-[#181111]/90 text-base font-medium leading-normal pb-2">
          Country *
        </p>
        <div class="relative w-full">
          <select
            class="form-select appearance-none w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181111] dark:bg-background-dark focus:outline-0 focus:ring-0 border border-[#e6dbdc] dark:border-white/20 bg-white focus:border-primary h-14 p-[15px] text-base font-normal leading-normal"
            bind:value={shippingAddress.country}
          >
            <option>United States</option>
            <option>Canada</option>
            <option>Mexico</option>
            <option>Philippines</option>
          </select>
          <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#181111]/80 pointer-events-none">
            expand_more
          </span>
        </div>
      </label>
    </div>
  </form>
</div>

<!-- Bottom Action Bar -->
<footer class="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark/80 backdrop-blur-sm p-4 border-t border-[#e6dbdc] dark:border-white/10">
  <button
    onclick={handleNext}
    class="flex h-14 w-full items-center justify-center rounded-lg bg-primary text-white text-base font-bold leading-normal transition-colors hover:bg-primary/90"
    disabled={!shippingAddress.fullName.trim() || 
              !shippingAddress.addressLine1.trim() || 
              !shippingAddress.city.trim() || 
              !shippingAddress.state.trim() || 
              !shippingAddress.zipCode.trim()}
  >
    Continue to Payment
  </button>
</footer>