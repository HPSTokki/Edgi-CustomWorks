<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  // Types
  interface Order {
    id: number;
    orderNumber: string;
    status: string;
    total: string;
    createdAt: Date;
    itemCount?: number;
    userName?: string;
    userEmail?: string;
  }

  interface OrderStats {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    todayOrders: number;
    todayRevenue: number;
  }

  interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }

  // State
  let orders: Order[] = [];
  let stats: OrderStats | null = null;
  let loading = true;
  let error: string | null = null;

  // Filter state
  let filters = {
    status: "all",
    paymentStatus: "all",
    paymentMethod: "all",
    search: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 20,
  };

  let pagination: Pagination | null = null;

  // Filter options
  let statusOptions: string[] = [];
  let paymentStatusOptions: string[] = [];
  let paymentMethodOptions: string[] = [];

  // Modal
  let showFilterModal = false;
  let showDeleteModal = false;
  let orderToDelete: string | null = null;

  // Fetch data
  async function fetchOrders() {
    loading = true;
    error = null;

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value.toString());
      });

      const response = await fetch(
        `http://localhost:3000/api/admin/orders?${queryParams}`
      );
      const result = await response.json();

      if (result.success) {
        orders = result.data;
        pagination = result.pagination;
      } else {
        error = result.message;
      }
    } catch (err) {
      error = "Failed to load orders";
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/admin/orders/stats/summary"
      );
      const result = await response.json();

      if (result.success) {
        stats = result.data;
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }

  async function fetchFilterOptions() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/admin/orders/filters/options"
      );
      const result = await response.json();

      if (result.success) {
        statusOptions = result.data.status;
        paymentStatusOptions = result.data.paymentStatus;
        paymentMethodOptions = result.data.paymentMethod;
      }
    } catch (err) {
      console.error("Failed to load filter options:", err);
    }
  }

  // Initialize
  onMount(async () => {
    await Promise.all([fetchOrders(), fetchStats(), fetchFilterOptions()]);
  });

  // Filter handlers
  function applyFilters() {
    filters.page = 1; // Reset to first page when applying filters
    fetchOrders();
    showFilterModal = false;
  }

  function resetFilters() {
    filters = {
      status: "all",
      paymentStatus: "all",
      paymentMethod: "all",
      search: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 20,
    };
    fetchOrders();
    showFilterModal = false;
  }

  function handleSearch(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    filters.search = value;

    // Debounce search
    clearTimeout((window as any).searchTimeout);
    (window as any).searchTimeout = setTimeout(() => {
      filters.page = 1;
      fetchOrders();
    }, 500);
  }

  // Pagination
  function goToPage(page: number) {
    if (page < 1 || page > (pagination?.totalPages || 1)) return;
    filters.page = page;
    fetchOrders();
  }

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

  // Format currency
  function formatCurrency(amount: string | number): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  }

  // Format date
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Delete order
  function openDeleteModal(orderNumber: string) {
    orderToDelete = orderNumber;
    showDeleteModal = true;
  }

  async function deleteOrder() {
    if (!orderToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/orders/${orderToDelete}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();

      if (result.success) {
        showDeleteModal = false;
        orderToDelete = null;
        await fetchOrders();
        await fetchStats();
      } else {
        error = result.message;
      }
    } catch (err) {
      error = "Failed to delete order";
      console.error(err);
    }
  }

  // Quick status update
  async function updateStatus(orderNumber: string, status: string) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/orders/${orderNumber}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (result.success) {
        await fetchOrders();
        await fetchStats();
      } else {
        error = result.message;
      }
    } catch (err) {
      error = "Failed to update status";
      console.error(err);
    }
  }
</script>

<svelte:head>
  <title>Admin - Orders</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Orders</h1>
            <p class="mt-1 text-sm text-gray-500">
              Manage customer orders and track fulfillment
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              onclick={() => (showFilterModal = true)}
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                class="-ml-1 mr-2 h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>
            <button
              onclick={fetchOrders}
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        {#if stats}
          <div
            class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="shrink-0">
                    <div class="rounded-md bg-indigo-500 p-3">
                      <svg
                        class="h-6 w-6 text-white"
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
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Total Orders
                      </dt>
                      <dd class="text-lg font-medium text-gray-900">
                        {stats.totalOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="shrink-0">
                    <div class="rounded-md bg-green-500 p-3">
                      <svg
                        class="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Total Revenue
                      </dt>
                      <dd class="text-lg font-medium text-gray-900">
                        {formatCurrency(stats.totalRevenue)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="shrink-0">
                    <div class="rounded-md bg-blue-500 p-3">
                      <svg
                        class="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Today's Orders
                      </dt>
                      <dd class="text-lg font-medium text-gray-900">
                        {stats.todayOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="shrink-0">
                    <div class="rounded-md bg-yellow-500 p-3">
                      <svg
                        class="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Pending Orders
                      </dt>
                      <dd class="text-lg font-medium text-gray-900">
                        {stats.pendingOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="mt-8 px-4 sm:px-6 lg:px-8">
    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative rounded-md shadow-sm">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
          <svg
            class="h-5 w-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          bind:value={filters.search}
          oninput={(e) => handleSearch(e)}
          placeholder="Search orders or shipping addresses..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
    </div>

    <!-- Error Message -->
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

    <!-- Loading State -->
    {#if loading && orders.length === 0}
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
        <p class="mt-4 text-sm text-gray-500">Loading orders...</p>
      </div>
    {:else if orders.length === 0}
      <div class="text-center py-12">
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
        <h3 class="mt-2 text-sm font-medium text-gray-900">No orders</h3>
        <p class="mt-1 text-sm text-gray-500">
          {filters.search ||
          filters.status !== "all" ||
          filters.paymentStatus !== "all"
            ? "No orders match your filters."
            : "Get started by creating your first order."}
        </p>
        {#if filters.search || filters.status !== "all" || filters.paymentStatus !== "all"}
          <div class="mt-6">
            <button
              onclick={resetFilters}
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear filters
            </button>
          </div>
        {/if}
      </div>
    {:else}
      <!-- Orders Table -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          {#each orders as order}
            <li>
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="flex items-center space-x-2">
                          <p
                            class="text-sm font-medium text-indigo-600 truncate"
                          >
                            <a
                              href="/admin/orders/{order.orderNumber}"
                              class="hover:underline"
                            >
                              {order.orderNumber}
                            </a>
                          </p>
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(
                              order.status
                            )}"
                          >
                            {order.status}
                          </span>
                        </div>
                        <div class="mt-1">
                          <div class="flex items-center text-sm text-gray-500">
                            <svg
                              class="shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clip-rule="evenodd"
                              />
                            </svg>
                            {formatDate(order.createdAt)}
                            {#if order.itemCount}
                              <span class="mx-2">•</span>
                              <span
                                >{order.itemCount} item{#if order.itemCount > 1}s{/if}</span
                              >
                            {/if}
                          </div>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </p>
                        {#if order.userName}
                          <p class="text-sm text-gray-500">
                            {order.userName}
                          </p>
                        {:else if order.userEmail}
                          <p class="text-sm text-gray-500">
                            {order.userEmail}
                          </p>
                        {/if}
                      </div>
                    </div>
                  </div>
                  <div class="ml-4 shrink-0 flex space-x-2">
                    <!-- Quick Status Update -->
                    <div class="relative inline-block text-left">
                      <select
                        value={order.status}
                        onchange={(e) =>
                          updateStatus(
                            order.orderNumber,
                            e.currentTarget.value
                          )}
                        class="block w-full pl-3 pr-8 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
  <option value="pending">Pending</option>
  <option value="pending_payment">Pending Payment</option>
  <option value="awaiting_payment">Awaiting Payment</option>
  <option value="payment_required">Payment Required</option>
  <option value="processing">Processing</option>
  <option value="shipped">Shipped</option>
  <option value="delivered">Delivered</option>
  <option value="completed">Completed</option>
  <option value="cancelled">Cancelled</option>
  <option value="paid">Paid</option>
                      </select>
                    </div>

                    <!-- Actions -->
                    <div class="relative inline-block text-left">
                      <button
                        type="button"
                        class="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <span class="sr-only">Open options</span>
                        <svg
                          class="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                          />
                        </svg>
                      </button>
                      <div
                        class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 hidden"
                      >
                        <div class="py-1" role="menu">
                          <a
                            href="/admin/orders/{order.orderNumber}"
                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            View Details
                          </a>
                          <button
                            onclick={() => openDeleteModal(order.orderNumber)}
                            class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Delete Order
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          {/each}
        </ul>

        <!-- Pagination -->
        {#if pagination && pagination.totalPages > 1}
          <div
            class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
          >
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                onclick={() => goToPage(filters.page - 1)}
                disabled={filters.page === 1}
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onclick={() => goToPage(filters.page + 1)}
                disabled={filters.page === pagination.totalPages}
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div
              class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
            >
              <div>
                <p class="text-sm text-gray-700">
                  Showing <span class="font-medium"
                    >{(filters.page - 1) * filters.limit + 1}</span
                  >
                  to
                  <span class="font-medium"
                    >{Math.min(
                      filters.page * filters.limit,
                      pagination.total
                    )}</span
                  >
                  of <span class="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav
                  class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onclick={() => goToPage(filters.page - 1)}
                    disabled={filters.page === 1}
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Previous</span>
                    <svg
                      class="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>

                  {#each Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1) as pageNum}
                    {#if Math.abs(pageNum - filters.page) <= 2 || pageNum === 1 || pageNum === pagination.totalPages}
                      <button
                        onclick={() => goToPage(pageNum)}
                        class={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          filters.page === pageNum
                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    {:else if Math.abs(pageNum - filters.page) === 3}
                      <span
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    {/if}
                  {/each}

                  <button
                    onclick={() => goToPage(filters.page + 1)}
                    disabled={filters.page === pagination.totalPages}
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Next</span>
                    <svg
                      class="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Filter Modal -->
  {#if showFilterModal}
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onclick={() => (showFilterModal = false)}
      ></div>

      <!-- Modal container -->
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Modal content - stop propagation -->
        <div
          class="relative bg-white rounded-lg shadow-xl w-full max-w-lg"
          onclick={(e) => e.stopPropagation()}
        >
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Filter Orders
              </h3>
              <button
                type="button"
                onclick={() => (showFilterModal = false)}
                class="ml-4 bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Close</span>
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <!-- Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  bind:value={filters.status}
                  class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {#each statusOptions as option}
                    <option value={option}>
                      {option === "all"
                        ? "All Statuses"
                        : option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  {/each}
                </select>
              </div>

              <!-- Payment Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  bind:value={filters.paymentStatus}
                  class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {#each paymentStatusOptions as option}
                    <option value={option}>
                      {option === "all"
                        ? "All Payment Statuses"
                        : option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  {/each}
                </select>
              </div>

              <!-- Payment Method Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  bind:value={filters.paymentMethod}
                  class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {#each paymentMethodOptions as option}
                    <option value={option}>
                      {option === "all"
                        ? "All Methods"
                        : option
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                    </option>
                  {/each}
                </select>
              </div>

              <!-- Date Range -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    bind:value={filters.startDate}
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    bind:value={filters.endDate}
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onclick={resetFilters}
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset
              </button>
              <button
                type="button"
                onclick={() => (showFilterModal = false)}
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onclick={applyFilters}
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  <!-- Delete Confirmation Modal -->
  {#if showDeleteModal}
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onclick={() => (showDeleteModal = false)}
      ></div>

      <!-- Modal container -->
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Modal content - stop propagation -->
        <div
          class="relative bg-white rounded-lg shadow-xl w-full max-w-lg"
          onclick={(e) => e.stopPropagation()}
        >
          <div class="p-6">
            <div class="flex items-start">
              <div
                class="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100"
              >
                <svg
                  class="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Delete Order
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete order <span
                      class="font-medium">{orderToDelete}</span
                    >? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onclick={() => {
                  showDeleteModal = false;
                  orderToDelete = null;
                }}
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onclick={deleteOrder}
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Hide dropdown menu by default, show on hover/focus */
  .relative:hover .hidden {
    display: block;
  }
  .relative:focus-within .hidden {
    display: block;
  }
</style>
