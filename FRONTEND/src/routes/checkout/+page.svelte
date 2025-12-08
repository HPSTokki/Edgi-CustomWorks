<script lang="ts">
  import { onMount } from 'svelte';
  import { cart, cartActions } from '$lib/stores/cart';
  import { page } from '$app/stores';
  import CheckoutStep1Shipping from './components/CheckoutStep1Shipping.svelte';
  import CheckoutStep2Shipping from './components/CheckoutStep2Shipping.svelte';
  import CheckoutStep3Shipping from './components/CheckoutStep3Shipping.svelte';
  import { browser } from '$app/environment';

  // Step management
  const STEPS = {
    SHIPPING: 1,
    PAYMENT: 2,
    REVIEW: 3
  } as const;

  let currentStep = $state<1 | 2 | 3>(STEPS.SHIPPING);
  let isLoading = $state(true);
  let checkoutError = $state('');

  // Checkout data that will be collected across steps
  let checkoutData = $state({
    shippingAddress: {
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Philippines'
    },
    paymentMethod: 'cash_on_delivery' as 'cash_on_delivery' | 'paymongo_gcash',
    cardDetails: {
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    }
  });

  onMount(async () => {
    try {
      // Fetch cart data
      await cartActions.fetchCart();
      
      // Check if cart is empty
      if ($cart.items.length === 0) {
        if (browser) {
          window.location.href = '/cart';
        }
      }
    } catch (error) {
      console.error('Error loading checkout:', error);
      checkoutError = 'Failed to load checkout data';
    } finally {
      isLoading = false;
    }
  });

  // Navigation functions
  function goToStep(step: 1 | 2 | 3) {
    currentStep = step;
  }

  function nextStep() {
    if (currentStep < STEPS.REVIEW) {
      currentStep = (currentStep + 1) as 1 | 2 | 3;
    }
  }

  function prevStep() {
    if (currentStep > STEPS.SHIPPING) {
      currentStep = (currentStep - 1) as 1 | 2 | 3;
    }
  }

  // Calculate totals
  const subtotal = $derived($cart.subtotal || 0);
  const tax = $derived(subtotal * 0.1); // 10% tax
  const shipping = $derived(5.0); // Fixed shipping for now
  const total = $derived(subtotal + tax + shipping);

  // Helper function to get current user
  function getCurrentUser() {
    // Use the AuthResponse type from global App namespace
    const authData = $page.data?.user as App.AuthResponse | undefined;
    
    if (!authData || !authData.valid || !authData.user) {
      return null;
    }
    
    return authData.user;
  }
</script>

<svelte:head>
  <title>Checkout - EdGi Custom Works</title>
</svelte:head>

{#if isLoading}
  <!-- Loading State -->
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
{:else if $cart.items.length === 0}
  <!-- Empty Cart Redirect -->
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
    <div class="text-center">
      <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">shopping_cart</span>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">Add items to your cart before checking out</p>
      <a href="/products" class="text-primary hover:text-primary/80 font-medium">Browse Products</a>
    </div>
  </div>
{:else}
  <!-- Checkout Flow -->
  <div class="min-h-screen bg-background-light dark:bg-background-dark">
    <!-- Progress Indicator -->
    <div class="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-[#e6dbdc] dark:border-white/10">
      <div class="flex items-center p-4">
        <button
          onclick={() => {
            if (currentStep === STEPS.SHIPPING) {
              if (browser) window.history.back();
            } else {
              prevStep();
            }
          }}
          class="flex size-12 shrink-0 items-center justify-center text-[#181111]"
        >
          <span class="material-symbols-outlined text-2xl">
            {currentStep === STEPS.SHIPPING ? 'arrow_back_ios_new' : 'arrow_back'}
          </span>
        </button>
        
        <h2 class="text-[#181111] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          {#if currentStep === STEPS.SHIPPING}
            Checkout
          {:else if currentStep === STEPS.PAYMENT}
            Payment
          {:else}
            Review
          {/if}
        </h2>
        
        <div class="w-12"></div>
      </div>

      <!-- Progress Steps -->
      <div class="flex w-full flex-row items-center justify-center gap-2 px-4 pb-4">
        {#each [STEPS.SHIPPING, STEPS.PAYMENT, STEPS.REVIEW] as step}
          <div class="flex flex-col items-center gap-2 w-28">
            <div 
              class="h-2 w-full rounded-full transition-colors {currentStep >= step ? 'bg-primary' : 'bg-[#e6dbdc] dark:bg-white/20'}"
            ></div>
            <p 
              class="text-xs font-medium transition-colors {currentStep >= step ? 'text-primary' : 'text-[#896163]/50'}"
            >
              {#if step === STEPS.SHIPPING}
                Shipping
              {:else if step === STEPS.PAYMENT}
                Payment
              {:else}
                Confirm
              {/if}
            </p>
          </div>
        {/each}
      </div>
    </div>

    <!-- Main Content -->
    <main class="pb-32">
      {#if checkoutError}
        <div class="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-red-800 dark:text-red-200 text-sm">{checkoutError}</p>
        </div>
      {/if}

      {#if currentStep === STEPS.SHIPPING}
        <CheckoutStep1Shipping 
          shippingAddress={checkoutData.shippingAddress}
          on:next={(e) => {
            if (e.detail?.shippingAddress) {
              checkoutData.shippingAddress = e.detail.shippingAddress;
            }
            nextStep();
          }}
        />
      {:else if currentStep === STEPS.PAYMENT}
        <CheckoutStep2Shipping 
          paymentMethod={checkoutData.paymentMethod}
          cardDetails={checkoutData.cardDetails}
          on:next={(e) => {
            if (e.detail?.paymentMethod) {
              checkoutData.paymentMethod = e.detail.paymentMethod;
            }
            if (e.detail?.cardDetails) {
              checkoutData.cardDetails = e.detail.cardDetails;
            }
            nextStep();
          }}
          on:prev={prevStep}
        />
      {:else}
        <CheckoutStep3Shipping 
          checkoutData={checkoutData}
          {subtotal}
          {tax}
          {shipping}
          {total}
          on:place-order={async () => {
            try {
              console.log('=== Starting checkout process ===');
              
              // Get current user using helper function
              const user = getCurrentUser();
              console.log('User data:', user);
              
              if (!user) {
                checkoutError = 'You must be logged in to place an order';
                console.error('No valid user found');
                return;
              }

              if (!user.id) {
                checkoutError = 'User ID not found. Please log in again.';
                console.error('User has no id:', user);
                return;
              }

              // Check if cart exists
              console.log('Cart store:', $cart);
              console.log('Cart ID:', $cart.cartId);
              console.log('Cart items count:', $cart.items.length);
              
              const cartId = $cart.cartId;
              if (!cartId) {
                checkoutError = 'Cart ID not found. Please try refreshing your cart.';
                console.error('Cart ID is null or undefined');
                
                // Try to refresh the cart
                await cartActions.fetchCart();
                if (!$cart.cartId) {
                  checkoutError = 'Unable to proceed. Please add items to cart again.';
                  return;
                }
              }

              // Validate shipping address
              console.log('Shipping address data:', checkoutData.shippingAddress);
              
              // Direct field-by-field validation (type-safe)
              const missingFields: string[] = [];

              if (!checkoutData.shippingAddress.fullName.trim()) {
                missingFields.push('Full Name');
              }
              if (!checkoutData.shippingAddress.addressLine1.trim()) {
                missingFields.push('Address Line 1');
              }
              if (!checkoutData.shippingAddress.city.trim()) {
                missingFields.push('City');
              }
              if (!checkoutData.shippingAddress.state.trim()) {
                missingFields.push('State');
              }
              if (!checkoutData.shippingAddress.zipCode.trim()) {
                missingFields.push('ZIP Code');
              }

              if (missingFields.length > 0) {
                checkoutError = `Please fill in: ${missingFields.join(', ')}`;
                console.error('Missing shipping fields:', missingFields);
                return;
              }

              // Validate payment method
              if (!checkoutData.paymentMethod) {
                checkoutError = 'Please select a payment method';
                return;
              }

              // Combine shipping address into a single string
              const shippingAddress = `
${checkoutData.shippingAddress.fullName}
${checkoutData.shippingAddress.addressLine1}
${checkoutData.shippingAddress.addressLine2 ? checkoutData.shippingAddress.addressLine2 + '\n' : ''}
${checkoutData.shippingAddress.city}, ${checkoutData.shippingAddress.state} ${checkoutData.shippingAddress.zipCode}
${checkoutData.shippingAddress.country}
              `.trim();

              console.log('Formatted shipping address:', shippingAddress);
              console.log('Payment method:', checkoutData.paymentMethod);

              // Prepare request body
              const requestBody = {
                cartId: cartId,
                userId: user.id,
                shippingAddress,
                billingAddress: shippingAddress,
                paymentMethod: checkoutData.paymentMethod,
                notes: ''
              };

              console.log('Request body:', requestBody);
              console.log('Sending request to:', 'http://localhost:3000/api/orderRouting/orders/checkout');

              const response = await fetch('http://localhost:3000/api/orderRouting/orders/checkout', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
              });

              console.log('Response status:', response.status);

              if (response.ok) {
                const order = await response.json();
                console.log('Order created:', order);
                
                // Clear the cart after successful order
                await cartActions.clearCart();
                
                // Redirect to order confirmation
                if (browser) {
                  window.location.href = `/orders/${order.orderNumber}`;
                }
              } else {
                let errorData;
                try {
                  errorData = await response.json();
                  console.error('Error response:', errorData);
                } catch (parseError) {
                  console.error('Failed to parse error response:', parseError);
                  errorData = { error: `Server error: ${response.status}` };
                }
                
                checkoutError = errorData.error || `Failed to place order (${response.status})`;
                
                // Handle specific error cases
                if (response.status === 400) {
                  if (errorData.error?.includes('Cart is empty')) {
                    checkoutError = 'Your cart is empty. Please add items to your cart.';
                  } else if (errorData.error?.includes('Missing required fields')) {
                    checkoutError = errorData.error;
                  }
                } else if (response.status === 404) {
                  checkoutError = 'Cart not found. Please try adding items again.';
                } else if (response.status === 500) {
                  checkoutError = 'Server error. Please try again later.';
                }
              }
            } catch (error) {
              console.error('Checkout error:', error);
              checkoutError = 'An error occurred while placing your order. Please try again.';
              
              if (error instanceof Error) {
                console.error('Error details:', error.message, error.stack);
              }
            }
          }}
          on:edit-step={(e) => {
            const step = e.detail;
            if (typeof step === 'number') {
              goToStep(step as 1 | 2);
            }
          }}
        />
      {/if}
    </main>
  </div>
{/if}