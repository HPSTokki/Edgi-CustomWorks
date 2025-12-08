<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";

  interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: string;
    customizations: any;
  }

  interface Order {
    id: number;
    orderNumber: string;
    status: string;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    shippingAddress: string;
    billingAddress: string | null;
    paymentMethod: string;
    paymentStatus: string;
    notes: string | null;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
  }

  console.log("DEBUG - Page params:", $page.params);
  console.log("DEBUG - Page params keys:", Object.keys($page.params));

  let order = $state<Order | null>(null);
  let isLoading = $state(true);
  let error = $state("");
  let showFullAddress = $state(false);
  let isProcessingPayment = $state(false);

  onMount(async () => {
    try {
      const orderNumber = $page.params.orderNumber;
      const response = await fetch(
        `http://localhost:3000/api/orderRouting/orders/${orderNumber}`
      );

      if (response.ok) {
        order = await response.json();
      } else if (response.status === 404) {
        error = "Order not found";
      } else {
        error = "Failed to load order details";
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
      error = "Failed to load order details. Please try again later.";
    } finally {
      isLoading = false;
    }
  });

  const formatPrice = (price: string | number) => {
    const amount = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(isNaN(amount) ? 0 : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
      case "paid":
        return "text-green-600 dark:text-green-400";
      case "pending":
      case "processing":
        return "text-yellow-600 dark:text-yellow-400";
      case "shipped":
        return "text-blue-600 dark:text-blue-400";
      case "cancelled":
      case "refunded":
        return "text-red-600 dark:text-red-400";
      case "awaiting_payment":
      case "payment_required":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "check_circle";
      case "pending":
        return "pending";
      case "processing":
        return "hourglass_empty";
      case "shipped":
        return "local_shipping";
      case "cancelled":
        return "cancel";
      case "paid":
        return "payments";
      case "awaiting_payment":
      case "payment_required":
        return "payment";
      default:
        return "receipt_long";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash_on_delivery":
        return "Cash on Delivery";
      case "paymongo_gcash":
        return "GCash (PayMongo)";
      default:
        return method?.replace(/_/g, " ") || "Unknown";
    }
  };

  // Check if payment button should be shown
  const shouldShowPaymentButton = $derived(() => {
    if (!order) return false;

    // Show button if:
    // 1. Payment method is GCash
    // 2. Payment status is not 'paid'
    // 3. AND order status is 'awaiting_payment' or 'payment_required'
    const isGCash = order.paymentMethod === "paymongo_gcash";
    const isNotPaid = order.paymentStatus !== "paid";
    const needsPayment =
      order.status === "awaiting_payment" ||
      order.status === "payment_required" ||
      order.status === "pending_payment";

    return isGCash && isNotPaid && needsPayment;
  });

  // Handle payment button click
  // Replace the handlePayment function in your order detail page
  async function handlePayment() {
    if (!order || !browser) return;

    // Redirect to payment page instead of integrating PayMongo directly
    if (browser) {
      window.location.href = `/payment/${order.orderNumber}`;
    }
  }

  // Refresh order data
  async function refreshOrder() {
    if (!order) return;

    isLoading = true;
    try {
      const response = await fetch(
        `http://localhost:3000/api/orderRouting/orders/${order.orderNumber}`
      );
      if (response.ok) {
        order = await response.json();
      }
    } catch (err) {
      console.error("Failed to refresh order:", err);
    } finally {
      isLoading = false;
    }
  }
  // Helper function to format customization display
  function formatCustomizationValue(customization: any): string {
    if (!customization) return "";

    if (typeof customization === "string") {
      return customization;
    }

    if (typeof customization === "object") {
      if (customization.value) {
        return customization.value;
      }
      if (customization.name) {
        return customization.name;
      }
      if (customization.label) {
        return customization.label;
      }
      return JSON.stringify(customization); // Fallback
    }

    return String(customization);
  }

  // Helper to get extra cost
  function getCustomizationCost(customization: any): number {
    if (!customization || typeof customization !== "object") return 0;

    return (
      customization.extraCost ||
      customization.price ||
      customization.additionalCost ||
      0
    );
  }

  // Helper to check if customization has cost
  function hasCustomizationCost(customization: any): boolean {
    return getCustomizationCost(customization) > 0;
  }
</script>

<svelte:head>
  <title
    >{order ? `Order #${order.orderNumber}` : "Order Details"} - EdGi Custom Works</title
  >
</svelte:head>

<div class="min-h-screen bg-background-light dark:bg-background-dark">
  <!-- Header -->
  <header
    class="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-[#e6dbdc] dark:border-white/10"
  >
    <div class="flex items-center p-4">
      <button
        onclick={() => browser && (window.location.href = "/orders")}
        class="flex size-12 shrink-0 items-center justify-center text-[#181111] hover:text-primary transition-colors"
        disabled={isLoading}
      >
        <span class="material-symbols-outlined text-2xl">arrow_back</span>
      </button>
      <h1
        class="text-[#181111] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center"
      >
        Order Details
      </h1>
      <div class="w-12"></div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="pb-8 px-4 max-w-2xl mx-auto">
    {#if isLoading}
      <!-- Loading State -->
      <div class="flex flex-col justify-center items-center py-16">
        <div
          class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"
        ></div>
        <p class="text-gray-600 dark:text-gray-400">Loading order details...</p>
      </div>
    {:else if error}
      <!-- Error State -->
      <div class="py-16 text-center">
        <div
          class="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span
            class="material-symbols-outlined text-red-600 dark:text-red-400 text-5xl"
          >
            error
          </span>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-3">
          Unable to Load Order
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {error}
        </p>
        <div class="space-y-3 max-w-xs mx-auto">
          <a
            href="/products"
            class="block w-full text-center py-3 px-6 rounded-lg border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors"
          >
            Continue Shopping
          </a>
          <a
            href="/orders"
            class="block w-full text-center py-3 px-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            View My Orders
          </a>
        </div>
      </div>
    {:else if order}
      <!-- Success State -->
      <div class="pt-6">
        <!-- Order Header -->
        <div class="text-center mb-8">
          <div
            class="w-24 h-24 {order.status === 'awaiting_payment' ||
            order.status === 'payment_required'
              ? 'bg-orange-100 dark:bg-orange-900/20'
              : 'bg-green-100 dark:bg-green-900/20'} rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <span
              class="material-symbols-outlined {order.status ===
                'awaiting_payment' || order.status === 'payment_required'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-green-600 dark:text-green-400'} text-5xl"
            >
              {getStatusIcon(order.status)}
            </span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            {order.status === "awaiting_payment" ||
            order.status === "payment_required"
              ? "Payment Required"
              : "Order Confirmed!"}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {order.status === "awaiting_payment" ||
            order.status === "payment_required"
              ? `Please complete your payment for order #${order.orderNumber}`
              : `Thank you for your purchase. We've received your order #${order.orderNumber}.`}
          </p>

          <!-- Order Status Badge -->
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 mb-4"
          >
            <span
              class="material-symbols-outlined text-lg {getStatusColor(
                order.status
              )}"
            >
              {getStatusIcon(order.status)}
            </span>
            <span class="font-medium capitalize {getStatusColor(order.status)}">
              {order.status.replace("_", " ")}
            </span>
          </div>

          <p class="text-sm text-gray-500 dark:text-gray-400">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <!-- Payment Button for GCash orders requiring payment -->
        {#if shouldShowPaymentButton()}
          <div class="mb-8">
            <div
              class="bg-linear-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 border border-green-200 dark:border-green-800 rounded-xl p-5 mb-4"
            >
              <div class="flex items-start gap-4">
                <div class="shrink-0">
                  <div
                    class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"
                  >
                    <span
                      class="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl"
                    >
                      payments
                    </span>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900 mb-2">
                    Complete Your Payment
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 mb-3">
                    Please complete your payment of {formatPrice(order.total)} using
                    GCash to proceed with your order.
                  </p>
                  <div class="flex flex-col sm:flex-row gap-3">
                    <button
                      onclick={handlePayment}
                      disabled={isProcessingPayment}
                      class="flex-1 bg-linear-to-r from-green-600 to-green-700 text-white font-bold py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {#if isProcessingPayment}
                        <div
                          class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                        ></div>
                        Processing...
                      {:else}
                        <span class="material-symbols-outlined">payments</span>
                        Pay with GCash Now
                      {/if}
                    </button>
                    <button
                      onclick={refreshOrder}
                      class="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Refresh Status
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Instructions -->
            <div
              class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
            >
              <div class="flex items-start gap-3">
                <span
                  class="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5"
                >
                  info
                </span>
                <div>
                  <p class="font-medium text-blue-800 dark:text-blue-300">
                    GCash Payment Instructions
                  </p>
                  <ul
                    class="text-sm text-blue-700 dark:text-blue-400 mt-1 space-y-1 list-disc pl-4"
                  >
                    <li>
                      Click "Pay with GCash Now" to be redirected to PayMongo
                    </li>
                    <li>Complete the payment using your GCash account</li>
                    <li>
                      After payment, return to this page and click "Refresh
                      Status"
                    </li>
                    <li>
                      Once payment is confirmed, your order will be processed
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- Order Summary -->
        <div
          class="bg-white dark:bg-background-dark/50 rounded-xl p-5 mb-6 border border-[#e6dbdc] dark:border-white/10"
        >
          <h3
            class="text-lg font-bold text-[#181111] mb-4 pb-3 border-b border-[#e6dbdc] dark:border-gray-700"
          >
            Order Summary
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span class="font-medium text-[#181111]"
                >{formatPrice(order.subtotal)}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Shipping</span>
              <span class="font-medium text-[#181111]"
                >{formatPrice(order.shipping)}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Tax</span>
              <span class="font-medium text-[#181111]"
                >{formatPrice(order.tax)}</span
              >
            </div>
            <div
              class="pt-3 border-t border-[#e6dbdc] dark:border-gray-700 mt-3"
            >
              <div class="flex justify-between text-lg">
                <span class="font-bold text-[#181111]">Total</span>
                <span class="font-bold text-red-600"
                  >{formatPrice(order.total)}</span
                >
              </div>
              {#if shouldShowPaymentButton()}
                <p class="text-sm text-orange-600 dark:text-orange-400 mt-2">
                  <span class="material-symbols-outlined align-middle text-base"
                    >warning</span
                  >
                  Payment required to proceed
                </p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div
          class="bg-white dark:bg-background-dark/50 rounded-xl p-5 mb-6 border border-[#e6dbdc] dark:border-white/10"
        >
          <h3
            class="text-lg font-bold text-[#181111] mb-4 pb-3 border-b border-[#e6dbdc] dark:border-gray-700"
          >
            Order Items ({order.items?.length || 0})
          </h3>
          <div class="space-y-4">
            {#each order.items || [] as item, index}
              <div
                class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors {index !==
                order.items.length - 1
                  ? 'border-b border-[#e6dbdc] dark:border-gray-700 pb-4'
                  : ''}"
              >
                <div
                  class="w-16 h-16 shrink-0 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                  <span
                    class="material-symbols-outlined text-gray-400 dark:text-gray-500"
                  >
                    inventory_2
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-[#181111] truncate">
                    {item.productName}
                  </h4>
                  <div class="flex items-center gap-4 mt-1">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity}
                    </span>
                    <span class="text-sm font-medium text-[#181111]">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  {#if item.customizations && Object.keys(item.customizations).length > 0}
                    <div class="mt-2">
                      <details class="group">
                        <summary
                          class="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 cursor-pointer list-none"
                        >
                          <span>View Customizations</span>
                          <span
                            class="material-symbols-outlined text-sm group-open:rotate-180 transition-transform"
                          >
                            expand_more
                          </span>
                        </summary>
                        <div
                          class="mt-2 pl-4 border-l border-gray-300 dark:border-gray-600 space-y-3"
                        >
                          {#each Object.entries(item.customizations) as [key, customization]}
                            {#if customization}
                              <div class="space-y-1">
                                <!-- Customization Header -->
                                <div class="flex items-start justify-between">
                                  <div>
                                    <span
                                      class="font-medium text-[#181111] capitalize"
                                    >
                                      {key.replace(/_/g, " ")}:
                                    </span>
                                  </div>

                                  <!-- Show extra cost if applicable -->
                                  {#if hasCustomizationCost(customization)}
                                    <span
                                      class="text-sm text-green-600 dark:text-green-400 font-medium ml-2"
                                    >
                                      +{formatPrice(
                                        getCustomizationCost(customization)
                                      )}
                                    </span>
                                  {/if}
                                </div>

                                <!-- Customization Value -->
                                <div
                                  class="text-gray-700 pl-2"
                                >
                                  {formatCustomizationValue(customization)}
                                </div>

                                <!-- Additional customization details -->
                                {#if typeof customization === "object"}
                                  <div class="pl-2 space-y-1">
                                    <!-- Show any additional properties (except value, extraCost, price) -->
                                    {#each Object.entries(customization) as [prop, propValue]}
                                      {#if !["value", "extraCost", "price", "additionalCost", "name", "label"].includes(prop) && propValue}
                                        <div
                                          class="text-xs text-gray-600 dark:text-gray-400"
                                        >
                                          <span class="capitalize">{prop}:</span
                                          >
                                          {String(propValue)}
                                        </div>
                                      {/if}
                                    {/each}
                                  </div>
                                {/if}
                              </div>
                            {/if}
                          {/each}
                        </div>
                      </details>
                    </div>
                  {/if}
                </div>
                <div class="text-right">
                  <p class="font-medium text-[#181111]">
                    {formatPrice(parseFloat(item.price) * item.quantity)}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Shipping & Payment -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Shipping Address -->
          <div
            class="bg-white dark:bg-background-dark/50 rounded-xl p-5 border border-[#e6dbdc] dark:border-white/10"
          >
            <div
              class="flex items-center gap-2 mb-4 pb-3 border-b border-[#e6dbdc] dark:border-gray-700"
            >
              <span
                class="material-symbols-outlined text-gray-600 dark:text-gray-400"
              >
                location_on
              </span>
              <h3 class="text-lg font-bold text-[#181111]">Shipping Address</h3>
            </div>
            <div class="space-y-1">
              {#each order.shippingAddress?.split("\n") || [] as line}
                {#if line.trim()}
                  <p class="text-gray-700 ">{line}</p>
                {/if}
              {/each}
            </div>
          </div>

          <!-- Payment Information -->
          <div
            class="bg-white dark:bg-background-dark/50 rounded-xl p-5 border border-[#e6dbdc] dark:border-white/10"
          >
            <div
              class="flex items-center gap-2 mb-4 pb-3 border-b border-[#e6dbdc] dark:border-gray-700"
            >
              <span
                class="material-symbols-outlined text-gray-600 dark:text-gray-400"
              >
                payments
              </span>
              <h3 class="text-lg font-bold text-[#181111]">
                Payment Information
              </h3>
            </div>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Payment Method
                </p>
                <p class="font-medium text-[#181111]">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Payment Status
                </p>
                <div class="flex items-center gap-2">
                  <span
                    class="material-symbols-outlined text-lg {getStatusColor(
                      order.paymentStatus
                    )}"
                  >
                    {getStatusIcon(order.paymentStatus)}
                  </span>
                  <span
                    class="font-medium capitalize {getStatusColor(
                      order.paymentStatus
                    )}"
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
              {#if shouldShowPaymentButton()}
                <div
                  class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700"
                >
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    This order requires payment to proceed.
                  </p>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Notes -->
        {#if order.notes}
          <div
            class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6"
          >
            <div class="flex items-center gap-2 mb-3">
              <span
                class="material-symbols-outlined text-blue-600 dark:text-blue-400"
              >
                notes
              </span>
              <h3 class="text-lg font-bold text-blue-900 dark:text-blue-300">
                Order Notes
              </h3>
            </div>
            <p class="text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
              {order.notes}
            </p>
          </div>
        {/if}

        <!-- Action Buttons -->
        <div
          class="space-y-3 mt-8 pt-6 border-t border-[#e6dbdc] dark:border-gray-700"
        >
          {#if !shouldShowPaymentButton}
            <a
              href="/products"
              class="block w-full text-center py-4 px-6 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors"
            >
              Continue Shopping
            </a>
          {/if}

          <a
            href="/orders"
            class="block w-full text-center py-4 px-6 rounded-xl {shouldShowPaymentButton()
              ? 'border-2 border-primary text-primary font-bold hover:bg-primary/5'
              : 'bg-primary text-white font-bold hover:bg-primary/90'} transition-colors"
          >
            View All Orders
          </a>

          {#if order.paymentMethod === "cash_on_delivery" && order.paymentStatus !== "paid"}
            <div
              class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl"
            >
              <div class="flex items-start gap-3">
                <span
                  class="material-symbols-outlined text-yellow-600 dark:text-yellow-400 mt-0.5"
                >
                  info
                </span>
                <div>
                  <p class="font-medium text-yellow-800 dark:text-yellow-300">
                    Cash on Delivery Reminder
                  </p>
                  <p class="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Please prepare cash for payment when your order arrives. The
                    total amount is {formatPrice(order.total)}.
                  </p>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </main>
</div>
