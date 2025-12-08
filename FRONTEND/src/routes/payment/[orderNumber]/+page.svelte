<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';

  interface Order {
    id: number;
    orderNumber: string;
    total: string;
    paymentMethod: string;
    paymentStatus: string;
  }

  type AuthResponse = {
    valid: boolean;
    user: {
      id: number | string;
      email: string;
      role: number | string;
    } | null;
    message: string;
  };

  let order = $state<Order | null>(null);
  let isLoading = $state(true);
  let error = $state('');
  
  // Payment form state
  let amountPaid = $state<string>('');
  let isProcessing = $state(false);
  let paymentSuccess = $state(false);
  let paymentError = $state('');
  
  // Timer for fake processing
  let countdown = $state(3);

  onMount(async () => {
    try {
      const orderNumber = $page.params.orderNumber;
      const response = await fetch(`http://localhost:3000/api/orderRouting/orders/${orderNumber}`);
      
      if (response.ok) {
        const orderData = await response.json();
        order = {
          id: orderData.id,
          orderNumber: orderData.orderNumber,
          total: orderData.total,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus
        };
        
        // Pre-fill amount with order total
        amountPaid = parseFloat(orderData.total).toFixed(2);
      } else if (response.status === 404) {
        error = 'Order not found';
      } else {
        error = 'Failed to load order details';
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
      error = 'Failed to load order details. Please try again later.';
    } finally {
      isLoading = false;
    }
  });

  const formatPrice = (price: string | number) => {
    const amount = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(isNaN(amount) ? 0 : amount);
  };

  const handleAmountChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    
    // Only allow numbers and one decimal point
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === '') {
      amountPaid = value;
    }
  };

  const validatePayment = (): boolean => {
    if (!amountPaid || amountPaid === '') {
      paymentError = 'Please enter the payment amount';
      return false;
    }

    const paid = parseFloat(amountPaid);
    const total = order ? parseFloat(order.total) : 0;

    if (isNaN(paid) || paid <= 0) {
      paymentError = 'Please enter a valid amount';
      return false;
    }

    if (paid < total) {
      paymentError = `Amount must be at least ${formatPrice(total)}`;
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    if (!order || !validatePayment()) {
      return;
    }

    isProcessing = true;
    paymentError = '';

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update order payment status
      const response = await fetch(`http://localhost:3000/api/orderRouting/orders/${order.orderNumber}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amountPaid),
          paymentMethod: 'paymongo_gcash',
          transactionId: `GCASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        })
      });

      if (response.ok) {
        paymentSuccess = true;
        
        // Start countdown for redirect
        const interval = setInterval(() => {
          countdown--;
          if (countdown <= 0) {
            clearInterval(interval);
            if (browser) {
              goto(`/orders/${order?.orderNumber}`);
            }
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        paymentError = errorData.error || 'Payment failed. Please try again.';
      }
    } catch (err) {
      console.error('Payment error:', err);
      paymentError = 'An error occurred. Please try again.';
    } finally {
      isProcessing = false;
    }
  };

  const simulateQuickPay = () => {
    if (order) {
      amountPaid = parseFloat(order.total).toFixed(2);
      processPayment();
    }
  };

  const goBack = () => {
    if (browser) {
      window.history.back();
    }
  };
</script>

<svelte:head>
  <title>GCash Payment - {order ? `Order #${order.orderNumber}` : 'Payment'}</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
  <!-- Header -->
  <header class="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
    <div class="flex items-center p-4 max-w-4xl mx-auto">
      <button 
        onclick={goBack}
        class="flex size-12 shrink-0 items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
        disabled={isProcessing || paymentSuccess}
      >
        <span class="material-symbols-outlined text-2xl">arrow_back</span>
      </button>
      <h1 class="text-lg font-bold text-gray-900 dark:text-white flex-1 text-center">
        GCash Payment
      </h1>
      <div class="w-12"></div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-md mx-auto p-4">
    {#if isLoading}
      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center py-16">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading payment details...</p>
      </div>
    {:else if error}
      <!-- Error State -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="material-symbols-outlined text-red-600 dark:text-red-400 text-4xl">
            error
          </span>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Payment Error</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <div class="space-y-3">
          <button 
            onclick={goBack}
            class="w-full py-3 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    {:else if order}
      <!-- Payment Interface -->
      <div class="space-y-6">
        <!-- Order Info Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                payments
              </span>
            </div>
            <div>
              <h2 class="font-bold text-gray-900 dark:text-white text-lg">Order #{order.orderNumber}</h2>
              <p class="text-gray-600 dark:text-gray-400 text-sm">Complete your payment using GCash</p>
            </div>
          </div>

          <!-- Amount Due -->
          <div class="mb-6">
            <div class="text-center mb-4">
              <p class="text-gray-600 dark:text-gray-400 text-sm mb-1">Amount Due</p>
              <p class="text-4xl font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
            </div>
            <div class="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span class="material-symbols-outlined text-base">verified</span>
              <span>Secure payment powered by PayMongo</span>
            </div>
          </div>

          <!-- Payment Status -->
          {#if order.paymentStatus === 'paid'}
            <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-green-600 dark:text-green-400">
                  check_circle
                </span>
                <div>
                  <p class="font-medium text-green-800 dark:text-green-300">Payment Already Processed</p>
                  <p class="text-sm text-green-700 dark:text-green-400 mt-1">
                    This order has already been paid. No further payment is required.
                  </p>
                </div>
              </div>
            </div>
          {:else}
            <!-- Payment Form -->
            <div class="space-y-6">
              <!-- Amount Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter Payment Amount
                </label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg">$</span>
                  <input
                    type="text"
                    bind:value={amountPaid}
                    oninput={handleAmountChange}
                    placeholder="0.00"
                    class="w-full pl-10 pr-4 py-4 text-2xl font-bold text-center bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    disabled={isProcessing || paymentSuccess}
                  />
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Minimum amount: {formatPrice(order.total)}
                </p>
              </div>

              <!-- Quick Pay Button -->
              <button
                onclick={simulateQuickPay}
                disabled={isProcessing || paymentSuccess}
                class="w-full py-4 px-6 bg-linear-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <span class="material-symbols-outlined">bolt</span>
                Quick Pay: {formatPrice(order.total)}
              </button>

              <!-- Or Divider -->
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
                </div>
              </div>

              <!-- Process Payment Button -->
              <button
                onclick={processPayment}
                disabled={isProcessing || paymentSuccess}
                class="w-full py-4 px-6 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {#if isProcessing}
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing Payment...
                {:else}
                  <span class="material-symbols-outlined">payments</span>
                  Process Payment
                {/if}
              </button>
            </div>
          {/if}

          <!-- Payment Error -->
          {#if paymentError}
            <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-red-600 dark:text-red-400">
                  error
                </span>
                <p class="text-red-700 dark:text-red-300 text-sm">{paymentError}</p>
              </div>
            </div>
          {/if}
        </div>

        <!-- Payment Success -->
        {#if paymentSuccess}
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div class="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-5xl">
                check_circle
              </span>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Payment Successful!</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-2">
              Thank you for your payment of {formatPrice(amountPaid)}
            </p>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Order #{order.orderNumber} is now being processed.
            </p>
            
            <div class="space-y-4">
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p class="text-sm text-blue-700 dark:text-blue-400">
                  Redirecting to order details in {countdown} seconds...
                </p>
              </div>
              
              <button
                onclick={() => goto(`/orders/${order?.orderNumber}`)}
                class="w-full py-3 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
              >
                View Order Now
              </button>
            </div>
          </div>
        {/if}

        <!-- Payment Instructions -->
        {#if !paymentSuccess && order.paymentStatus !== 'paid'}
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined">info</span>
              How to Pay with GCash
            </h3>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                  <span class="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Enter the payment amount (minimum {formatPrice(order.total)})
                </p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                  <span class="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Click "Quick Pay" for exact amount or "Process Payment" to enter custom amount
                </p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                  <span class="text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Payment will be processed and order status updated automatically
                </p>
              </div>
            </div>
          </div>
        {/if}

        <!-- Security Badges -->
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl mb-2">
              lock
            </span>
            <p class="text-xs font-medium text-gray-700 dark:text-gray-300">Secure</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl mb-2">
              verified
            </span>
            <p class="text-xs font-medium text-gray-700 dark:text-gray-300">Verified</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl mb-2">
              shield
            </span>
            <p class="text-xs font-medium text-gray-700 dark:text-gray-300">Protected</p>
          </div>
        </div>
      </div>
    {/if}
  </main>
</div>