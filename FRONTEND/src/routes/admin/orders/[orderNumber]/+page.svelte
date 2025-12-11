<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  // Types
  interface OrderItem {
    id: number;
    quantity: number;
    price: string;
    productName: string;
    productSlug: string;
    productImages: string[];
    customizations: any;
  }

  interface Order {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    shippingAddress: string;
    billingAddress: string | null;
    paymentMethod: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    items?: OrderItem[];
  }

  // State
  let order: Order | null = null;
  let loading = true;
  let error: string | null = null;
  let successMessage: string | null = null;

  // Form states
  let statusUpdate = {
    status: "",
    notes: "",
  };

  let paymentStatusUpdate = {
    paymentStatus: "",
  };

  // Options
  let statusOptions: string[] = [];
  let paymentStatusOptions: string[] = [];

  // Fetch order details
  async function fetchOrder() {
    loading = true;
    error = null;

    try {
      const orderNumber = $page.params.orderNumber;
      if (!orderNumber) {
        throw new Error("Order number is required");
      }

      const response = await fetch(
        `http://localhost:3000/api/admin/orders/${orderNumber}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || "No order data received");
      }

      const orderData = result.data as Order;

      // Validate required fields
      if (!orderData.orderNumber || !orderData.id) {
        throw new Error("Invalid order data structure");
      }

      order = orderData;
      statusUpdate.status = orderData.status || "";
      statusUpdate.notes = orderData.notes || "";
      paymentStatusUpdate.paymentStatus = orderData.paymentStatus || "";
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Failed to load order details";
      console.error("Error fetching order:", err);

      // If it's a 404, redirect back to orders list
      if (error.includes("404") || error.includes("not found")) {
        setTimeout(() => goto("/admin/orders"), 2000);
      }
    } finally {
      loading = false;
    }
  }

  async function fetchOptions() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/admin/orders/filters/options"
      );
      const result = await response.json();

      if (result.success) {
        statusOptions = result.data.status.filter(
          (opt: string) => opt !== "all"
        );
        paymentStatusOptions = result.data.paymentStatus.filter(
          (opt: string) => opt !== "all"
        );
      }
    } catch (err) {
      console.error("Failed to load options:", err);
    }
  }

  // Initialize
  onMount(async () => {
    await Promise.all([fetchOrder(), fetchOptions()]);
  });

  // Status badge color
  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  function getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  // Format currency
  function formatCurrency(amount: string | number): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(num);
  }

  // Format date
  function formatDateTime(date: Date): string {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Format address (basic)
  function formatAddress(address: string): string {
    try {
      const parsed = JSON.parse(address);
      return `${parsed.street}, ${parsed.city}, ${parsed.state} ${parsed.zipCode}, ${parsed.country}`;
    } catch {
      return address;
    }
  }

  // Update order status
  async function updateStatus() {
    if (!order) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/orders/${order.orderNumber}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(statusUpdate),
        }
      );

      const result = await response.json();

      if (result.success) {
        successMessage = "Order status updated successfully";
        order = result.data;

        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage = null;
        }, 3000);
      } else {
        error = result.message;
      }
    } catch (err) {
      error = "Failed to update order status";
      console.error(err);
    }
  }

  // Update payment status
  async function updatePaymentStatus() {
    if (!order) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/orders/${order.orderNumber}/payment-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentStatusUpdate),
        }
      );

      const result = await response.json();

      if (result.success) {
        successMessage = "Payment status updated successfully";
        order = result.data;

        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage = null;
        }, 3000);
      } else {
        error = result.message;
      }
    } catch (err) {
      error = "Failed to update payment status";
      console.error(err);
    }
  }

  // Delete order
  async function deleteOrder() {
    if (!order) return;

    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/orders/${order.orderNumber}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        goto("/admin/orders");
      } else {
        error = result.message;
      }
    } catch (err) {
      error = "Failed to delete order";
      console.error(err);
    }
  }

  // Copy order number
  function copyOrderNumber() {
    if (!order) return;

    navigator.clipboard.writeText(order.orderNumber).then(() => {
      successMessage = "Order number copied to clipboard";
      setTimeout(() => {
        successMessage = null;
      }, 2000);
    });
  }

  function formatStatus(status: string): string {
    if (!status) return "Unknown";

    const statusMap: Record<string, string> = {
      pending: "Pending",
      pending_payment: "Pending Payment",
      awaiting_payment: "Awaiting Payment",
      payment_required: "Payment Required",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
      paid: "Paid",
      refunded: "Refunded",
    };

    return (
      statusMap[status] ||
      status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  }

  function formatPaymentStatus(status: string): string {
    if (!status) return "Unknown";

    const statusMap: Record<string, string> = {
      pending: "Pending",
      paid: "Paid",
      failed: "Failed",
      refunded: "Refunded",
      cancelled: "Cancelled",
      processing: "Processing",
    };

    return (
      statusMap[status] ||
      status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  }
</script>

<svelte:head>
  <title>{order ? `Order ${order.orderNumber}` : "Order Details"} - Admin</title
  >
</svelte:head>

<div class="min-h-screen bg-gray-50 p-2">
  <!-- Header -->
  <div class="bg-white shadow">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="py-6">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <a
                href="/admin/orders"
                class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <svg
                  class="mr-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Orders
              </a>
            </div>

            <div class="mt-2 flex items-center justify-between">
              <div>
                {#if loading && !order}
                  <div class="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                {:else if order}
                  <div class="flex items-center space-x-3">
                    <h1 class="text-2xl font-bold text-gray-900">
                      Order {order.orderNumber}
                    </h1>
                    <button
                      on:click={copyOrderNumber}
                      class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                      title="Copy order number"
                    >
                      <svg
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div class="mt-1 flex items-center space-x-4">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(
                        order.status
                      )}"
                    >
                      {formatStatus(order.status)}
                    </span>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getPaymentStatusColor(
                        order.paymentStatus
                      )}"
                    >
                      {formatPaymentStatus(order.paymentStatus)}
                    </span>
                    <span class="text-sm text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                {/if}
              </div>

              <div class="flex space-x-3">
                <button
                  on:click={deleteOrder}
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg
                    class="-ml-1 mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="mt-8 px-4 sm:px-6 lg:px-8">
    <!-- Messages -->
    {#if error}
      <div class="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
        <div class="flex">
          <div class="shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    {/if}

    {#if successMessage}
      <div class="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
        <div class="flex">
          <div class="shrink-0">
            <svg
              class="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Loading State -->
    {#if loading && !order}
      <div class="text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <p class="mt-4 text-sm text-gray-500">Loading order details...</p>
      </div>
    {:else if order}
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Left Column: Order Items & Updates -->
        <div class="lg:col-span-2">
          <!-- Order Items -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Order Items ({order.items?.length || 0})
              </h3>
            </div>
            <div class="border-t border-gray-200">
              {#if order.items && order.items.length > 0}
                <ul class="divide-y divide-gray-200">
                  {#each order.items as item}
                    <li class="px-4 py-4 sm:px-6">
                      <div class="flex items-center">
                        {#if item.productImages && item.productImages.length > 0}
                          <div class="shrink-0 h-16 w-16">
                            <img
                              src={item.productImages[0]}
                              alt={item.productName}
                              class="h-16 w-16 rounded-md object-cover"
                            />
                          </div>
                        {:else}
                          <div
                            class="shrink-0 h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center"
                          >
                            <svg
                              class="h-8 w-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        {/if}

                        <div class="ml-4 flex-1">
                          <div class="flex justify-between">
                            <div>
                              <h4 class="text-sm font-medium text-gray-900">
                                <a
                                  href="/products/{item.productSlug}"
                                  class="hover:underline"
                                >
                                  {item.productName}
                                </a>
                              </h4>
                              <p class="mt-1 text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                              {#if item.customizations}
                                <p class="mt-1 text-sm text-gray-500">
                                  Customizations: {JSON.stringify(
                                    item.customizations
                                  )}
                                </p>
                              {/if}
                            </div>
                            <div class="text-right">
                              <p class="text-sm font-medium text-gray-900">
                                {formatCurrency(item.price)}
                              </p>
                              <p class="mt-1 text-sm text-gray-500">
                                Total: {formatCurrency(
                                  parseFloat(item.price) * item.quantity
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  {/each}
                </ul>
              {:else}
                <div class="px-4 py-12 text-center">
                  <svg
                    class="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">No items found</p>
                </div>
              {/if}
            </div>
          </div>

          <!-- Order Status Update Form -->
          <div class="mt-8 bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Update Order Status
              </h3>
            </div>
            <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div class="space-y-4">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1"
                    for="statusOption"
                  >
                    Status
                  </label>
                  <select
                    bind:value={statusUpdate.status}
                    class="block w-full pl-3 pr-10 py-2 text-slate-700 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    name="statusOption"
                  >
                    {#each statusOptions as option}
                      <option value={option}>{formatStatus(option)}</option>
                    {/each}
                  </select>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1"
                    for="notes"
                  >
                    Notes (Optional)
                  </label>
                  <textarea
                    bind:value={statusUpdate.notes}
                    rows="3"
                    placeholder="Add any notes about this status update..."
                    class="block p-1 w-full border-gray-300 text-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ></textarea>
                </div>

                <div>
                  <button
                    on:click={updateStatus}
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Status Update Form -->
          <div class="mt-8 bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Update Payment Status
              </h3>
            </div>
            <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div class="space-y-4">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1"
                    for="paymentStatus"
                  >
                    Payment Status
                  </label>
                  <select
                    bind:value={paymentStatusUpdate.paymentStatus}
                    class="block w-full pl-3 pr-10 py-2 text-slate-700 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    name="paymentStatus"
                  >
                    {#each paymentStatusOptions as option}
                      <option value={option}
                        >{formatPaymentStatus(option)}</option
                      >
                    {/each}
                  </select>
                </div>

                <div>
                  <button
                    on:click={updatePaymentStatus}
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Update Payment Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Summary & Info -->
        <div>
          <!-- Order Summary -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Order Summary
              </h3>
            </div>
            <div class="border-t border-gray-200">
              <dl class="divide-y divide-gray-200">
                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Subtotal</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatCurrency(order.subtotal)}
                  </dd>
                </div>
                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Shipping</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatCurrency(order.shipping)}
                  </dd>
                </div>
                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Tax</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatCurrency(order.tax)}
                  </dd>
                </div>
                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Total</dt>
                  <dd
                    class="mt-1 text-lg font-bold text-gray-900 sm:mt-0 sm:col-span-2"
                  >
                    {formatCurrency(order.total)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Order Information -->
          <div class="mt-8 bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Order Information
              </h3>
            </div>
            <div class="border-t border-gray-200">
              <dl class="divide-y divide-gray-200">
                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">
                    Order Number
                  </dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.orderNumber}
                  </dd>
                </div>
                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">
                    Payment Method
                  </dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.paymentMethod
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </dd>
                </div>
                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Created At</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDateTime(order.createdAt)}
                  </dd>
                </div>
                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">
                    Last Updated
                  </dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDateTime(order.updatedAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Shipping Information -->
          <div class="mt-8 bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Shipping Information
              </h3>
            </div>
            <div class="border-t border-gray-200">
              <div class="px-4 py-3 sm:px-6">
                <p class="text-sm text-gray-900 whitespace-pre-line">
                  {formatAddress(order.shippingAddress)}
                </p>
              </div>
            </div>
          </div>

          <!-- Billing Information -->
          {#if order.billingAddress}
            <div class="mt-8 bg-white shadow rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Billing Information
                </h3>
              </div>
              <div class="border-t border-gray-200">
                <div class="px-4 py-3 sm:px-6">
                  <p class="text-sm text-gray-900 whitespace-pre-line">
                    {formatAddress(order.billingAddress)}
                  </p>
                </div>
              </div>
            </div>
          {/if}

          <!-- Notes -->
          {#if order.notes}
            <div class="mt-8 bg-white shadow rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Order Notes
                </h3>
              </div>
              <div class="border-t border-gray-200">
                <div class="px-4 py-3 sm:px-6">
                  <p class="text-sm text-gray-900 whitespace-pre-line">
                    {order.notes}
                  </p>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
