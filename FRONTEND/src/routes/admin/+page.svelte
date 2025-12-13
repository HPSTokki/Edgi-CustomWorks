<!-- src/routes/admin/analytics/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  // Types
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

  interface RevenueData {
    date: string;
    revenue: number;
    orders: number;
  }

  interface CategoryData {
    category: string;
    orders: number;
    revenue: number;
  }

  interface PaymentMethodData {
    method: string;
    count: number;
    revenue: number;
  }

  // State
  let stats: OrderStats = {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    todayOrders: 0,
    todayRevenue: 0
  };

  let revenueData: RevenueData[] = [];
  let categoryData: CategoryData[] = [];
  let paymentMethodData: PaymentMethodData[] = [];
  
  let timeRange = '7days'; // 7days, 30days, 90days, year
  let loading = {
    stats: true,
    revenue: true,
    categories: true,
    payments: true
  };

  let activeTab = 'overview'; // overview, revenue, categories, payments

  // Format currency
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatCompact = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num);
  };

  // API calls
  const API_BASE = 'http://localhost:3000/api/admin';

  // Fetch statistics
  const fetchStats = async () => {
    try {
      loading.stats = true;
      const response = await fetch(`${API_BASE}/orders/stats/summary`);
      const data = await response.json();
      if (data.success) {
        stats = data.data;
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      loading.stats = false;
    }
  };

  // Fetch revenue data based on time range
  const fetchRevenueData = async () => {
    try {
      loading.revenue = true;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      // Format dates for API
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Fetch orders for the date range
      const response = await fetch(
        `${API_BASE}/orders?startDate=${startDateStr}&endDate=${endDateStr}&limit=10000`
      );
      const data = await response.json();
      
      if (data.success) {
        // Group orders by date and calculate daily revenue
        const ordersByDate = new Map<string, { revenue: number; orders: number }>();
        
        data.data.forEach((order: any) => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          const revenue = parseFloat(order.total);
          
          if (!ordersByDate.has(orderDate)) {
            ordersByDate.set(orderDate, { revenue: 0, orders: 0 });
          }
          
          const dateData = ordersByDate.get(orderDate)!;
          dateData.revenue += revenue;
          dateData.orders += 1;
        });
        
        // Convert to array and fill missing dates
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        revenueData = Array.from({ length: daysDiff }, (_, i) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          const dateData = ordersByDate.get(dateStr);
          
          return {
            date: dateStr,
            revenue: dateData?.revenue || 0,
            orders: dateData?.orders || 0
          };
        });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      loading.revenue = false;
    }
  };

  // Fetch category data - now using real order items data
  const fetchCategoryData = async () => {
    try {
      loading.categories = true;
      
      // First, fetch all orders with their items
      const ordersResponse = await fetch(`${API_BASE}/orders?limit=1000`);
      const ordersData = await ordersResponse.json();
      
      if (!ordersData.success) {
        throw new Error('Failed to fetch orders');
      }
      
      // For each order, fetch its items to get product categories
      // Note: You'll need to modify your OrderService to include product categories
      // For now, let's extract product names and use them as pseudo-categories
      
      const categoryMap = new Map<string, { orders: number; revenue: number }>();
      const orderIds = ordersData.data.map((order: any) => order.id);
      
      // Fetch items for all orders
      // Note: You might want to create a batch endpoint for this in production
      for (const orderId of orderIds.slice(0, 50)) { // Limit to 50 orders for performance
        try {
          const orderResponse = await fetch(`${API_BASE}/orders/${ordersData.data.find((o: any) => o.id === orderId)?.orderNumber}`);
          const orderData = await orderResponse.json();
          
          if (orderData.success && orderData.data.items) {
            orderData.data.items.forEach((item: any) => {
              // Use product name or slug as category
              const category = item.productName || 'Uncategorized';
              const itemRevenue = parseFloat(item.price) * item.quantity;
              
              if (!categoryMap.has(category)) {
                categoryMap.set(category, { orders: 0, revenue: 0 });
              }
              
              const catData = categoryMap.get(category)!;
              catData.orders += 1;
              catData.revenue += itemRevenue;
            });
          }
        } catch (error) {
          console.error(`Error fetching order ${orderId} items:`, error);
        }
      }
      
      // Convert to array
      categoryData = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        orders: data.orders,
        revenue: data.revenue
      })).sort((a, b) => b.revenue - a.revenue);
      
      // If no categories found, show a message
      if (categoryData.length === 0) {
        categoryData = [
          { category: 'No category data available', orders: 0, revenue: 0 }
        ];
      }
      
    } catch (error) {
      console.error('Error fetching category data:', error);
      categoryData = [
        { category: 'Error loading categories', orders: 0, revenue: 0 }
      ];
    } finally {
      loading.categories = false;
    }
  };

  // Fetch payment method data - using real data
  const fetchPaymentMethodData = async () => {
    try {
      loading.payments = true;
      
      const response = await fetch(`${API_BASE}/orders?limit=1000`);
      const data = await response.json();
      
      if (data.success) {
        // Group orders by payment method
        const paymentMethods = new Map<string, { count: number; revenue: number }>();
        
        data.data.forEach((order: any) => {
          const method = order.paymentMethod || 'Unknown';
          const revenue = parseFloat(order.total) || 0;
          
          if (!paymentMethods.has(method)) {
            paymentMethods.set(method, { count: 0, revenue: 0 });
          }
          
          const methodData = paymentMethods.get(method)!;
          methodData.count += 1;
          methodData.revenue += revenue;
        });
        
        // Convert to array and format method names
        paymentMethodData = Array.from(paymentMethods.entries()).map(([method, data]) => ({
          method: formatPaymentMethodName(method),
          count: data.count,
          revenue: data.revenue
        })).sort((a, b) => b.revenue - a.revenue);
      }
    } catch (error) {
      console.error('Error fetching payment method data:', error);
      paymentMethodData = [
        { method: 'Error loading payment data', count: 0, revenue: 0 }
      ];
    } finally {
      loading.payments = false;
    }
  };

  // Format payment method names for display
  const formatPaymentMethodName = (method: string) => {
    switch (method) {
      case 'paymongo_gcash':
        return 'GCash';
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      case 'credit_card':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      default:
        return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    await Promise.all([
      fetchStats(),
      fetchRevenueData(),
      fetchCategoryData(),
      fetchPaymentMethodData()
    ]);
  };

  // D3 Charts
  let revenueChartRef: SVGSVGElement;
  let statusChartRef: SVGSVGElement;
  let categoryChartRef: SVGSVGElement;
  let paymentChartRef: SVGSVGElement;

  // Revenue Trend Chart
  const renderRevenueChart = () => {
    if (!revenueChartRef || revenueData.length === 0) return;

    d3.select(revenueChartRef).selectAll('*').remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = revenueChartRef.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(revenueChartRef)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter out dates with no revenue
    const filteredData = revenueData.filter(d => d.revenue > 0);
    
    if (filteredData.length === 0) return;

    // Scales
    const x = d3.scaleBand()
      .domain(filteredData.map(d => {
        const date = new Date(d.date);
        return timeRange === 'year' 
          ? date.toLocaleDateString('en-US', { month: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.revenue)! * 1.1])
      .range([height, 0]);

    // Line generator
    const line = d3.line<RevenueData>()
      .x(d => x(timeRange === 'year' 
          ? new Date(d.date).toLocaleDateString('en-US', { month: 'short' })
          : new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))! + x.bandwidth() / 2)
      .y(d => y(d.revenue));

    // Add line
    svg.append('path')
      .datum(filteredData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add circles for data points
    svg.selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => x(timeRange === 'year' 
          ? new Date(d.date).toLocaleDateString('en-US', { month: 'short' })
          : new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))! + x.bandwidth() / 2)
      .attr('cy', d => y(d.revenue))
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .append('title')
      .text(d => `${d.date}: ${formatCurrency(d.revenue)} (${d.orders} orders)`);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => formatCurrency(d as number)));

    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#6b7280')
      .style('font-size', '12px')
      .text('Revenue');
  };

  // Order Status Pie Chart
  const renderStatusChart = () => {
    if (!statusChartRef) return;

    d3.select(statusChartRef).selectAll('*').remove();
    
    const width = statusChartRef.clientWidth;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(statusChartRef)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const statuses = [
      { label: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
      { label: 'Processing', value: stats.processingOrders, color: '#3b82f6' },
      { label: 'Shipped', value: stats.shippedOrders, color: '#8b5cf6' },
      { label: 'Delivered', value: stats.deliveredOrders, color: '#10b981' },
      { label: 'Cancelled', value: stats.cancelledOrders, color: '#ef4444' }
    ].filter(s => s.value > 0);

    if (statuses.length === 0) {
      // Show message if no status data
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '14px')
        .style('fill', '#6b7280')
        .text('No order status data');
      return;
    }

    const pie = d3.pie<typeof statuses[0]>().value(d => d.value);
    const arc = d3.arc<d3.PieArcDatum<typeof statuses[0]>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius - 10);

    const arcs = svg.selectAll('arc')
      .data(pie(statuses))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .append('title')
      .text(d => `${d.data.label}: ${d.data.value} orders`);

    // Add labels
    const labelArc = d3.arc<d3.PieArcDatum<typeof statuses[0]>>()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .text(d => d.data.label);
  };

  // Category Bar Chart
  const renderCategoryChart = () => {
    if (!categoryChartRef || categoryData.length === 0) return;

    d3.select(categoryChartRef).selectAll('*').remove();
    
    const margin = { top: 20, right: 30, bottom: 80, left: 80 };
    const width = categoryChartRef.clientWidth - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select(categoryChartRef)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter out categories with no revenue
    const filteredData = categoryData.filter(d => d.revenue > 0);
    
    if (filteredData.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#6b7280')
        .text('No category revenue data');
      return;
    }

    const x = d3.scaleBand()
      .domain(filteredData.map(d => d.category))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.revenue)! * 1.1])
      .range([height, 0]);

    // Add bars
    svg.selectAll('rect')
      .data(filteredData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.category)!)
      .attr('y', d => y(d.revenue))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.revenue))
      .attr('fill', '#10b981')
      .attr('rx', 4)
      .append('title')
      .text(d => `${d.category}: ${formatCurrency(d.revenue)} (${d.orders} orders)`);

    // Add value labels on top of bars
    svg.selectAll('text.value')
      .data(filteredData)
      .enter()
      .append('text')
      .attr('class', 'value')
      .attr('x', d => x(d.category)! + x.bandwidth() / 2)
      .attr('y', d => y(d.revenue) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#6b7280')
      .style('font-weight', '600')
      .text(d => formatCompact(d.revenue));

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => formatCompact(d as number)));

    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#6b7280')
      .style('font-size', '12px')
      .text('Revenue');
  };

  // Payment Method Donut Chart
  const renderPaymentChart = () => {
    if (!paymentChartRef || paymentMethodData.length === 0) return;

    d3.select(paymentChartRef).selectAll('*').remove();
    
    const width = paymentChartRef.clientWidth;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(paymentChartRef)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Filter out payment methods with no revenue
    const filteredData = paymentMethodData.filter(d => d.revenue > 0);
    
    if (filteredData.length === 0) {
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '14px')
        .style('fill', '#6b7280')
        .text('No payment data');
      return;
    }

    const pie = d3.pie<PaymentMethodData>().value(d => d.revenue);
    const arc = d3.arc<d3.PieArcDatum<PaymentMethodData>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius - 10);

    const color = d3.scaleOrdinal<string>()
      .domain(filteredData.map(d => d.method))
      .range(['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#f97316']);

    const arcs = svg.selectAll('arc')
      .data(pie(filteredData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.method))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .append('title')
      .text(d => `${d.data.method}: ${formatCurrency(d.data.revenue)} (${d.data.count} orders)`);

    // Add center text
    const totalRevenue = filteredData.reduce((sum, d) => sum + d.revenue, 0);
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(formatCompact(totalRevenue));
    
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Total Revenue');

    // Add legend
    const legend = svg.selectAll('.legend')
      .data(filteredData)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${radius + 20},${(i - filteredData.length / 2) * 20})`);

    legend.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => color(d.method));

    legend.append('text')
      .attr('x', 18)
      .attr('y', 10)
      .style('font-size', '11px')
      .style('fill', '#6b7280')
      .text(d => d.method);
  };

  // Initialize charts when data is ready
  onMount(async () => {
    await fetchAllData();
    
    // Render charts after a small delay to ensure DOM is ready
    setTimeout(() => {
      renderRevenueChart();
      renderStatusChart();
      renderCategoryChart();
      renderPaymentChart();
    }, 100);
  });

  // Handle time range changes
  const handleTimeRangeChange = async (range: string) => {
    timeRange = range;
    await fetchRevenueData();
    setTimeout(() => {
      renderRevenueChart();
    }, 100);
  };

  // Handle window resize
  let resizeTimer: NodeJS.Timeout;
  const handleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderRevenueChart();
      renderStatusChart();
      renderCategoryChart();
      renderPaymentChart();
    }, 250);
  };

  onMount(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  // Calculate metrics
  const getAverageOrderValue = () => {
    return stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
  };
</script>

<div class="min-h-screen bg-gray-50 p-4 md:p-6" on:resize={handleResize}>
  <!-- Header -->
  <div class="mb-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p class="text-gray-600 mt-2">Real-time order analytics and insights</p>
      </div>
      <div class="flex items-center gap-4">
        <select
          bind:value={timeRange}
          on:change={() => handleTimeRangeChange(timeRange)}
          class="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading.revenue}
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="year">Last Year</option>
        </select>
        <button
          on:click={fetchAllData}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-50"
          disabled={loading.stats || loading.revenue || loading.categories || loading.payments}
        >
          {#if loading.stats || loading.revenue || loading.categories || loading.payments}
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Refreshing...
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="mb-8 border-b border-gray-200">
    <nav class="flex space-x-8">
      <button
        class={`py-2 px-1 border-b-2 text-sm font-medium ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        on:click={() => activeTab = 'overview'}
      >
        Overview
      </button>
      <button
        class={`py-2 px-1 border-b-2 text-sm font-medium ${activeTab === 'revenue' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        on:click={() => activeTab = 'revenue'}
      >
        Revenue
      </button>
      <button
        class={`py-2 px-1 border-b-2 text-sm font-medium ${activeTab === 'categories' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        on:click={() => activeTab = 'categories'}
      >
        Products
      </button>
      <button
        class={`py-2 px-1 border-b-2 text-sm font-medium ${activeTab === 'payments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        on:click={() => activeTab = 'payments'}
      >
        Payments
      </button>
    </nav>
  </div>

  <!-- Overview Tab -->
  {#if activeTab === 'overview'}
    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Revenue -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Total Revenue</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-2">
              {loading.stats ? '...' : formatCurrency(stats.totalRevenue)}
            </h3>
            <p class="text-sm text-green-600 font-medium mt-1 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              Today: {formatCurrency(stats.todayRevenue)}
            </p>
          </div>
          <div class="p-3 bg-green-50 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm text-gray-600">
            From {stats.totalOrders} total orders
          </span>
        </div>
      </div>

      <!-- Total Orders -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Total Orders</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-2">
              {loading.stats ? '...' : formatCompact(stats.totalOrders)}
            </h3>
            <p class="text-sm text-green-600 font-medium mt-1 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              Today: {stats.todayOrders} orders
            </p>
          </div>
          <div class="p-3 bg-blue-50 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm text-gray-600">
            Average Order Value: {formatCurrency(getAverageOrderValue())}
          </span>
        </div>
      </div>

      <!-- Order Status -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Active Orders</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-2">
              {loading.stats ? '...' : stats.pendingOrders + stats.processingOrders + stats.shippedOrders}
            </h3>
            <p class="text-sm text-yellow-600 font-medium mt-1">
              {stats.pendingOrders} pending, {stats.processingOrders} processing
            </p>
          </div>
          <div class="p-3 bg-yellow-50 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm text-gray-600">
            {stats.shippedOrders} shipped, {stats.deliveredOrders} delivered
          </span>
        </div>
      </div>

      <!-- Fulfillment Rate -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Fulfillment Rate</p>
            <h3 class="text-2xl font-bold text-gray-900 mt-2">
              {loading.stats ? '...' : ((stats.deliveredOrders / stats.totalOrders) * 100 || 0).toFixed(1)}%
            </h3>
            <p class="text-sm text-green-600 font-medium mt-1">
              {stats.deliveredOrders} delivered orders
            </p>
          </div>
          <div class="p-3 bg-purple-50 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <span class="text-sm text-gray-600">
            {stats.cancelledOrders} cancelled orders
          </span>
        </div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Revenue Trend -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Revenue Trend ({timeRange.replace('days', ' Days')})</h3>
          <div class="flex items-center gap-2 text-sm">
            <span class="flex items-center">
              <span class="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Revenue
            </span>
          </div>
        </div>
        {#if loading.revenue}
          <div class="h-[300px] flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        {:else if revenueData.length === 0 || revenueData.every(d => d.revenue === 0)}
          <div class="h-[300px] flex items-center justify-center">
            <p class="text-gray-500">No revenue data available for this period</p>
          </div>
        {:else}
          <svg bind:this={revenueChartRef} class="w-full h-[300px]"></svg>
        {/if}
      </div>

      <!-- Order Status Distribution -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Order Status Distribution</h3>
          <div class="text-sm text-gray-600">
            Total: {stats.totalOrders} orders
          </div>
        </div>
        {#if loading.stats}
          <div class="h-[300px] flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        {:else if stats.totalOrders === 0}
          <div class="h-[300px] flex items-center justify-center">
            <p class="text-gray-500">No order data available</p>
          </div>
        {:else}
          <svg bind:this={statusChartRef} class="w-full h-[300px]"></svg>
          <div class="mt-4 grid grid-cols-2 gap-2">
            {#each [
              { label: 'Pending', value: stats.pendingOrders, color: '#f59e0b' },
              { label: 'Processing', value: stats.processingOrders, color: '#3b82f6' },
              { label: 'Shipped', value: stats.shippedOrders, color: '#8b5cf6' },
              { label: 'Delivered', value: stats.deliveredOrders, color: '#10b981' },
              { label: 'Cancelled', value: stats.cancelledOrders, color: '#ef4444' }
            ] as item}
              <div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div class="flex items-center">
                  <span class="w-3 h-3 rounded mr-2" style="background-color: {item.color}"></span>
                  <span class="text-sm text-gray-700">{item.label}</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Top Products -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Top Products by Revenue</h3>
          <div class="text-sm text-gray-600">
            {#if loading.categories}
              Loading...
            {:else}
              Total: {formatCurrency(categoryData.reduce((sum, d) => sum + d.revenue, 0))}
            {/if}
          </div>
        </div>
        {#if loading.categories}
          <div class="h-[350px] flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        {:else if categoryData.length === 0 || categoryData.every(d => d.revenue === 0)}
          <div class="h-[350px] flex items-center justify-center">
            <p class="text-gray-500">No product revenue data available</p>
          </div>
        {:else}
          <svg bind:this={categoryChartRef} class="w-full h-[350px]"></svg>
          <div class="mt-4 space-y-3">
            {#each categoryData.slice(0, 5) as product}
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700 truncate max-w-[200px]">{product.category}</span>
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-600">{product.orders} sales</span>
                  <span class="text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Payment Methods -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <div class="text-sm text-gray-600">
            {#if loading.payments}
              Loading...
            {:else}
              Total Orders: {paymentMethodData.reduce((sum, d) => sum + d.count, 0)}
            {/if}
          </div>
        </div>
        {#if loading.payments}
          <div class="h-[300px] flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        {:else if paymentMethodData.length === 0 || paymentMethodData.every(d => d.revenue === 0)}
          <div class="h-[300px] flex items-center justify-center">
            <p class="text-gray-500">No payment method data available</p>
          </div>
        {:else}
          <svg bind:this={paymentChartRef} class="w-full h-[300px]"></svg>
          <div class="mt-4 space-y-3">
            {#each paymentMethodData as method}
              <div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div class="flex items-center">
                  <span class="text-sm text-gray-700">{method.method}</span>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-600">{method.count} orders</span>
                  <span class="text-sm font-medium text-gray-900">{formatCurrency(method.revenue)}</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Revenue Tab -->
  {#if activeTab === 'revenue'}
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Revenue Analytics ({timeRange.replace('days', ' Days')})</h3>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-blue-500"></span>
            <span class="text-sm text-gray-600">Revenue</span>
          </div>
        </div>
      </div>
      {#if loading.revenue}
        <div class="h-[400px] flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      {:else if revenueData.length === 0 || revenueData.every(d => d.revenue === 0)}
        <div class="h-[400px] flex items-center justify-center">
          <p class="text-gray-500">No revenue data available for this period</p>
        </div>
      {:else}
        <!-- Revenue Chart will be rendered here -->
        <div class="mb-8">
          <svg bind:this={revenueChartRef} class="w-full h-[400px]"></svg>
        </div>
        
        <!-- Revenue Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-700 font-medium">Total Revenue (Period)</p>
            <p class="text-2xl font-bold text-blue-900 mt-2">
              {formatCurrency(revenueData.reduce((sum, d) => sum + d.revenue, 0))}
            </p>
          </div>
          <div class="p-4 bg-green-50 rounded-lg">
            <p class="text-sm text-green-700 font-medium">Total Orders (Period)</p>
            <p class="text-2xl font-bold text-green-900 mt-2">
              {revenueData.reduce((sum, d) => sum + d.orders, 0)}
            </p>
          </div>
          <div class="p-4 bg-purple-50 rounded-lg">
            <p class="text-sm text-purple-700 font-medium">Best Day</p>
            <p class="text-2xl font-bold text-purple-900 mt-2">
              {formatCurrency(Math.max(...revenueData.map(d => d.revenue)))}
            </p>
            <p class="text-sm text-purple-600 mt-1">
              {revenueData.find(d => d.revenue === Math.max(...revenueData.map(d => d.revenue)))?.date}
            </p>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Products Tab -->
  {#if activeTab === 'categories'}
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Product Performance</h3>
        <div class="text-sm text-slate-600">
          {#if loading.categories}
            Loading...
          {:else}
            Total Revenue: {formatCurrency(categoryData.reduce((sum, d) => sum + d.revenue, 0))}
          {/if}
        </div>
      </div>
      {#if loading.categories}
        <div class="h-[400px] flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      {:else if categoryData.length === 0 || categoryData.every(d => d.revenue === 0)}
        <div class="h-[400px] flex items-center justify-center">
          <p class="text-gray-500">No product revenue data available</p>
        </div>
      {:else}
        <svg bind:this={categoryChartRef} class="w-full h-[400px] mb-8"></svg>
        
        <!-- Product Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Price</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market Share</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {#each categoryData.filter(d => d.revenue > 0) as product}
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{product.category}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{product.orders}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{formatCurrency(product.revenue)}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{formatCurrency(product.revenue / product.orders)}</td>
                  <td class="px-4 py-3">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-green-500 h-2 rounded-full" 
                        style="width: {(product.revenue / categoryData.reduce((sum, d) => sum + d.revenue, 0)) * 100}%"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-600 mt-1">
                      {((product.revenue / categoryData.reduce((sum, d) => sum + d.revenue, 0)) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Payments Tab -->
  {#if activeTab === 'payments'}
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Payment Analytics</h3>
        <div class="text-sm text-gray-600">
          {#if loading.payments}
            Loading...
          {:else}
            Total Methods: {paymentMethodData.filter(d => d.revenue > 0).length}
          {/if}
        </div>
      </div>
      {#if loading.payments}
        <div class="h-[400px] flex items-center justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      {:else if paymentMethodData.length === 0 || paymentMethodData.every(d => d.revenue === 0)}
        <div class="h-[400px] flex items-center justify-center">
          <p class="text-gray-500">No payment method data available</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <svg bind:this={paymentChartRef} class="w-full h-[400px]"></svg>
          </div>
          <div>
            <div class="space-y-6">
              {#each paymentMethodData.filter(d => d.revenue > 0) as method}
                <div class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-gray-900">{method.method}</h4>
                    <span class="text-sm font-medium text-gray-900">
                      {formatCurrency(method.revenue)}
                    </span>
                  </div>
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Orders</span>
                      <span class="font-medium">{method.count}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Avg. Order Value</span>
                      <span class="font-medium">{formatCurrency(method.revenue / method.count)}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Market Share</span>
                      <span class="font-medium">
                        {((method.count / paymentMethodData.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  :global(body) {
    font-family: 'Inter', sans-serif;
  }
  
  /* Custom scrollbar */
  .overflow-x-auto::-webkit-scrollbar {
    height: 6px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
  
  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>