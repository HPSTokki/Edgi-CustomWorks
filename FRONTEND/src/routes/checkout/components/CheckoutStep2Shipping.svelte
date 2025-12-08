<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Use $props() for component props
  const { paymentMethod: initialMethod, cardDetails: initialCardDetails } = $props<{
    paymentMethod: 'cash_on_delivery' | 'paymongo_gcash';
    cardDetails: {
      cardholderName: string;
      cardNumber: string;
      expiryDate: string;
      cvv: string;
    };
  }>();

  // Initialize state
  let paymentMethod = $state<'cash_on_delivery' | 'paymongo_gcash'>(initialMethod || 'cash_on_delivery');
  let cardDetails = $state({
    cardholderName: initialCardDetails?.cardholderName || '',
    cardNumber: initialCardDetails?.cardNumber || '',
    expiryDate: initialCardDetails?.expiryDate || '',
    cvv: initialCardDetails?.cvv || ''
  });

  const dispatch = createEventDispatcher();

  function handleNext() {
    dispatch('next', { paymentMethod, cardDetails });
  }

  function handlePrev() {
    dispatch('prev');
  }

  // Format card number as user types
  function formatCardNumber(value: string) {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : '';
  }

  // Format expiry date
  function formatExpiryDate(value: string) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + ' / ' + cleaned.slice(2, 4);
    }
    return cleaned;
  }

  // Handle radio button change
  function handlePaymentMethodChange(method: 'cash_on_delivery' | 'paymongo_gcash') {
    paymentMethod = method;
  }

  // Handle card details input changes
  function handleCardNumberInput(e: Event) {
    const target = e.target as HTMLInputElement;
    cardDetails.cardNumber = target.value.replace(/\D/g, ''); // Store only digits
  }

  function handleExpiryDateInput(e: Event) {
    const target = e.target as HTMLInputElement;
    cardDetails.expiryDate = target.value.replace(/\D/g, ''); // Store only digits
  }

  function handleCvvInput(e: Event) {
    const target = e.target as HTMLInputElement;
    cardDetails.cvv = target.value.replace(/\D/g, ''); // Store only digits
  }

  function handleCardholderNameInput(e: Event) {
    const target = e.target as HTMLInputElement;
    cardDetails.cardholderName = target.value;
  }

  // Use $derived for reactive values in Svelte 5
  const cardNumberFormatted = $derived(formatCardNumber(cardDetails.cardNumber));
  const expiryDateFormatted = $derived(formatExpiryDate(cardDetails.expiryDate));
</script>

<div>
  <!-- Payment Method Selection -->
  <div class="px-4 py-6">
    <h2 class="text-[#181111] text-lg font-bold mb-4">Payment Method</h2>
    
    <div class="space-y-4">
      <!-- Cash on Delivery -->
      <label class="flex items-center gap-4 p-4 bg-white dark:bg-background-dark/50 rounded-lg border-2 cursor-pointer hover:border-primary transition-colors {paymentMethod === 'cash_on_delivery' ? 'border-primary' : 'border-[#e6dbdc] dark:border-white/20'}"
        onclick={() => handlePaymentMethodChange('cash_on_delivery')}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="cash_on_delivery"
          checked={paymentMethod === 'cash_on_delivery'}
          class="sr-only"
        />
        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center {paymentMethod === 'cash_on_delivery' ? 'border-primary' : 'border-[#e6dbdc] dark:border-white/20'}"
        >
          {#if paymentMethod === 'cash_on_delivery'}
            <div class="w-3 h-3 rounded-full bg-primary"></div>
          {/if}
        </div>
        <div class="flex-1">
          <p class="text-[#181111] font-medium">Cash on Delivery</p>
          <p class="text-[#896163] dark:text-gray-400 text-sm">Pay when you receive your order</p>
        </div>
        <span class="material-symbols-outlined text-[#896163] dark:text-gray-400">
          payments
        </span>
      </label>

      <!-- PayMongo (GCash) -->
      <label class="flex items-center gap-4 p-4 bg-white dark:bg-background-dark/50 rounded-lg border-2 cursor-pointer hover:border-primary transition-colors {paymentMethod === 'paymongo_gcash' ? 'border-primary' : 'border-[#e6dbdc] dark:border-white/20'}"
        onclick={() => handlePaymentMethodChange('paymongo_gcash')}
      >
        <input
          type="radio"
          name="paymentMethod"
          value="paymongo_gcash"
          checked={paymentMethod === 'paymongo_gcash'}
          class="sr-only"
        />
        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center {paymentMethod === 'paymongo_gcash' ? 'border-primary' : 'border-[#e6dbdc] dark:border-white/20'}"
        >
          {#if paymentMethod === 'paymongo_gcash'}
            <div class="w-3 h-3 rounded-full bg-primary"></div>
          {/if}
        </div>
        <div class="flex-1">
          <p class="text-[#181111] font-medium">PayMongo (GCash)</p>
          <p class="text-[#896163] dark:text-gray-400 text-sm">Pay via GCash</p>
        </div>
        <div class="w-12 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
          <span class="text-green-700 dark:text-green-400 font-bold text-sm">GCash</span>
        </div>
      </label>
    </div>

    <!-- Card Details (for future credit card integration) -->
    {#if false} <!-- Hidden for now, but ready for future implementation -->
      <div class="mt-8 space-y-4">
        <h3 class="text-[#181111] font-medium">Card Details</h3>
        
        <!-- Cardholder Name -->
        <div>
          <label class="block text-[#181111]/90 text-base font-medium mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            class="w-full px-4 py-3 rounded-lg border border-[#e6dbdc] dark:border-white/20 bg-white dark:bg-background-dark text-[#181111] focus:outline-none focus:border-primary"
            placeholder="e.g., John Doe"
            value={cardDetails.cardholderName}
            oninput={handleCardholderNameInput}
          />
        </div>

        <!-- Card Number -->
        <div>
          <label class="block text-[#181111]/90 text-base font-medium mb-2">
            Card Number
          </label>
          <div class="flex">
            <input
              type="text"
              class="flex-1 px-4 py-3 rounded-l-lg border border-r-0 border-[#e6dbdc] dark:border-white/20 bg-white dark:bg-background-dark text-[#181111] focus:outline-none focus:border-primary"
              placeholder="0000 0000 0000 0000"
              value={cardNumberFormatted}
              oninput={handleCardNumberInput}
              maxlength="19"
            />
            <div class="px-4 py-3 border border-l-0 border-[#e6dbdc] dark:border-white/20 bg-white dark:bg-background-dark rounded-r-lg flex items-center">
              <span class="material-symbols-outlined text-[#896163] dark:text-gray-400">
                credit_card
              </span>
            </div>
          </div>
        </div>

        <!-- Expiry and CVV -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[#181111]/90 text-base font-medium mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              class="w-full px-4 py-3 rounded-lg border border-[#e6dbdc] dark:border-white/20 bg-white dark:bg-background-dark text-[#181111] focus:outline-none focus:border-primary"
              placeholder="MM / YY"
              value={expiryDateFormatted}
              oninput={handleExpiryDateInput}
              maxlength="7"
            />
          </div>
          <div>
            <label class="block text-[#181111]/90 text-base font-medium mb-2">
              CVV
            </label>
            <input
              type="text"
              class="w-full px-4 py-3 rounded-lg border border-[#e6dbdc] dark:border-white/20 bg-white dark:bg-background-dark text-[#181111] focus:outline-none focus:border-primary"
              placeholder="123"
              value={cardDetails.cvv}
              oninput={handleCvvInput}
              maxlength="3"
            />
          </div>
        </div>

        <!-- Secure Payment Info -->
        <div class="flex items-center justify-center gap-2 pt-4 text-sm text-[#896163] dark:text-gray-400">
          <span class="material-symbols-outlined text-base">lock</span>
          <p>Your payment information is secure.</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Footer with Back and Continue buttons -->
<footer class="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark/80 backdrop-blur-sm p-4 border-t border-[#e6dbdc] dark:border-white/10">
  <div class="flex gap-3">
    <button
      onclick={handlePrev}
      class="flex-1 h-14 flex items-center justify-center rounded-lg border-2 border-[#e6dbdc] dark:border-white/20 text-[#181111] text-base font-medium transition-colors hover:border-primary"
    >
      Back
    </button>
    <button
      onclick={handleNext}
      class="flex-1 h-14 flex items-center justify-center rounded-lg bg-primary text-white text-base font-bold transition-colors hover:bg-primary/90"
    >
      Continue to Review
    </button>
  </div>
</footer>