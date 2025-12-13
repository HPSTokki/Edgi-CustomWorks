<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';

  type AuthResponse = {
    valid: boolean;
    user: {
      id: number | string;
      email: string;
      role: number | string;
    } | null;
    message: string;
  };

  interface Order {
    id: number;
    orderNumber: string;
    status: string | null;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    shippingAddress: string;
    billingAddress: string | null;
    paymentMethod: string;
    paymentStatus: string | null;
    notes: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  }

  let orders = $state<Order[]>([]);
  let isLoading = $state(true);
  let error = $state('');

  onMount(async () => {
    try {
      const authData = $page.data?.user as AuthResponse | undefined;
      
      console.log('Auth data for orders:', authData);
      
      if (!authData || !authData.valid || !authData.user) {
        error = 'You must be logged in to view your orders';
        isLoading = false;
        return;
      }

      const userId = authData.user.id;
      console.log('Fetching orders for user ID:', userId);
      
      const response = await fetch(`http://localhost:3000/api/orderRouting/orders?userId=${userId}`);
      
      console.log('Orders API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Orders data received:', data);
        orders = data;
      } else {
        const errorText = await response.text();
        console.error('Failed to load orders:', response.status, errorText);
        error = `Failed to load your orders (${response.status})`;
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      error = 'Failed to load orders. Please try again later.';
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

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-900';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      case 'awaiting_payment':
      case 'payment_required':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string | null) => {
    if (!status) return 'receipt_long';
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'check_circle';
      case 'pending':
        return 'pending';
      case 'processing':
        return 'hourglass_empty';
      case 'shipped':
        return 'local_shipping';
      case 'cancelled':
        return 'cancel';
      case 'paid':
        return 'payments';
      case 'awaiting_payment':
      case 'payment_required':
        return 'payment';
      default:
        return 'receipt_long';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      case 'paymongo_gcash':
        return 'GCash (PayMongo)';
      default:
        return method?.replace(/_/g, ' ') || 'Unknown';
    }
  };

  const viewOrderDetails = (orderNumber: string) => {
    if (browser) {
      goto(`/orders/${orderNumber}`);
    }
  };

  const goBack = () => {
    if (browser) {
      window.history.back();
    }
  };

  // Check if order needs payment
  const needsPayment = (order: Order) => {
    const isGCash = order.paymentMethod === 'paymongo_gcash';
    const isNotPaid = order.paymentStatus !== 'paid';
    const needsPaymentStatus = order.status === 'awaiting_payment' || 
                               order.status === 'payment_required' ||
                               order.status === 'pending_payment';
    
    return isGCash && isNotPaid && needsPaymentStatus;
  };
</script>

<svelte:head>
  <title>My Orders - EdGi Custom Works</title>
</svelte:head>

<div class="min-h-screen bg-background-light dark:bg-background-dark">
  <!-- Header -->
  <header class="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-[#e6dbdc] dark:border-white/10">
    <div class="flex items-center p-4">
      <button 
        onclick={goBack}
        class="flex size-12 shrink-0 items-center justify-center text-[#181111]  hover:text-primary transition-colors"
      >
        <span class="material-symbols-outlined text-2xl">arrow_back</span>
      </button>
      <h1 class="text-[#181111]  text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
        My Orders
      </h1>
      <div class="w-12"></div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="pb-8 px-4 max-w-2xl mx-auto">
    {#if isLoading}
      <!-- Loading State -->
      <div class="flex flex-col justify-center items-center py-16">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading your orders...</p>
      </div>
    {:else if error}
      <!-- Error State -->
      <div class="py-16 text-center">
        <div class="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="material-symbols-outlined text-red-600 dark:text-red-400 text-5xl">
            error
          </span>
        </div>
        <h2 class="text-2xl font-bold text-gray-900  mb-3">Unable to Load Orders</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
        <div class="space-y-3 max-w-xs mx-auto">
          <a 
            href="/products" 
            class="block w-full text-center py-3 px-6 rounded-lg border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors"
          >
            Continue Shopping
          </a>
          <a 
            href="/" 
            class="block w-full text-center py-3 px-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    {:else if orders.length === 0}
      <!-- No Orders State -->
      <div class="py-16 text-center">
        <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-5xl">
            shopping_bag
          </span>
        </div>
        <h2 class="text-2xl font-bold text-gray-900  mb-3">No Orders Yet</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          You haven't placed any orders yet. Start shopping to create your first order!
        </p>
        <div class="space-y-3 max-w-xs mx-auto">
          <a 
            href="/products" 
            class="block w-full text-center py-3 px-6 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
          >
            Browse Products
          </a>
        </div>
      </div>
    {:else}
      <!-- Orders List -->
      <div class="pt-6 space-y-4">
        <h2 class="text-lg font-bold text-[#181111] ">
          Order History ({orders.length})
        </h2>
        
        {#each orders as order (order.id)}
          <div 
            onclick={() => viewOrderDetails(order.orderNumber)}
            class="bg-white dark:bg-background-dark/50 rounded-xl p-5 border border-[#e6dbdc] dark:border-white/10 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all cursor-pointer {needsPayment(order) ? 'border-l-4 border-l-orange-500' : ''}"
          >
            <!-- Order Header with Payment Alert -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-[#181111] ">Order #{order.orderNumber}</h3>
                  {#if needsPayment(order)}
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                      <span class="material-symbols-outlined text-xs">warning</span>
                      Payment Required
                    </span>
                  {/if}
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold text-primary">{formatPrice(order.total)}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </p>
              </div>
            </div>

            <!-- Order Status & Payment -->
            <div class="flex flex-wrap gap-3 mb-4">
              <div class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium {getStatusColor(order.status)}">
                <span class="material-symbols-outlined text-sm">
                  {getStatusIcon(order.status)}
                </span>
                <span class="capitalize">{(order.status || 'pending').replace(/_/g, ' ')}</span>
              </div>
              
              <div class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                <span class="material-symbols-outlined text-sm">
                  payments
                </span>
                <span class="capitalize">{(order.paymentStatus || 'pending').replace(/_/g, ' ')}</span>
              </div>
            </div>

            <!-- Payment Required Message -->
            {#if needsPayment(order)}
              <div class="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-orange-600 dark:text-orange-400">
                    payments
                  </span>
                  <p class="text-sm text-orange-700 dark:text-orange-400">
                    Payment required to process this order. Click to complete payment.
                  </p>
                </div>
              </div>
            {/if}

            <!-- Action -->
            <div class="flex items-center justify-between pt-4 border-t border-[#e6dbdc] dark:border-gray-700">
              <span class="text-primary font-medium text-sm">
                {needsPayment(order) ? 'Complete Payment' : 'View Details'}
              </span>
              <span class="material-symbols-outlined text-primary text-lg">
                arrow_forward
              </span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>