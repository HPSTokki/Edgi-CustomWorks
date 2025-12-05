<script lang="ts">
  import ProductCardV2 from "../../components/ProductCardV2.svelte";
  import { cartActions } from '$lib/stores/cart';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { onMount } from "svelte";


  interface Product {
  productId: number;
  name: string;
  slug: string;
  basePrice: number;
  images: string[];
  categoryName: string;
  stockQuantity: number;
  shortDescription: string;
  createdAt: string;
  // Add any other fields you expect from the API
}

interface Category {
  id: number;
  name: string;
  slug: string;
  // Add any other fields you expect from the API
}

  // Filter states
  let categories: Category[] = $state([]);
  let selectedCategories: string[] = $state([]);
  let searchQuery = $state("");
  let sortBy = $state("newest");
  let isFilterOpen = $state(false);
  
  // Products state
  let products: any = $state([]);
  let isLoading = $state(false);

  // Fetch categories and initial products on component mount
  onMount(async () => {
    await fetchCategories();
    await fetchProducts(); // This will now fetch all products initially
  });

  async function fetchCategories() {
    try {
      const response = await fetch('http://localhost:3000/api/categories');
      if (response.ok) {
        categories = await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }

async function fetchProducts() {
  isLoading = true;
  try {
    const params = new URLSearchParams();
    
    if (selectedCategories.length > 0) {
      params.append('categorySlug', selectedCategories.join(','));
    }
    
    if (searchQuery) {
      params.append('search', searchQuery);
    }

    const url = `http://localhost:3000/api/products${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('Fetching products from:', url);
    
    const response = await fetch(url);
    if (response.ok) {
      const data: Product[] = await response.json();
      console.log('Products fetched:', data);
      products = sortProducts(data, sortBy);
    } else {
      console.error('Failed to fetch products, status:', response.status);
      products = [];
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    products = [];
  } finally {
    isLoading = false;
  }
}

function sortProducts(products: any[], sortType: string) {
  if (!products || products.length === 0) return [];
  
  const sorted = [...products];
  switch (sortType) {
    case 'price-low':
      return sorted.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    case 'price-high':
      return sorted.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    case 'name':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'newest':
    default:
      // Fix: Convert strings to Date objects for comparison
      return sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending for newest first
      });
  }
}

  function handleCategoryToggle(categorySlug: string) {
    if (selectedCategories.includes(categorySlug)) {
      selectedCategories = selectedCategories.filter(slug => slug !== categorySlug);
    } else {
      selectedCategories = [...selectedCategories, categorySlug];
    }
  }

  function clearAllFilters() {
    selectedCategories = [];
    searchQuery = "";
    sortBy = "newest";
  }

  // Apply filters when they change
  $effect(() => {
    fetchProducts();
  });

  // Debounce search to avoid too many requests
  let searchTimeout: any;
  $effect(() => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchProducts();
    }, 300);
  });

  async function quickAddToCart(product: Product): Promise<void> {
    if (!browser) return;

    try {
      const user = $page.data.user;
      const sessionId = browser ? localStorage.getItem('sessionId') : null;
      const userId = user?.id;

      await cartActions.addItemToCart(
        product.productId,
        1,
        undefined,
        sessionId || undefined,
        userId as number | undefined
      );

      // Optional: Show toast notification
      console.log(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
  }

</script>

<svelte:head>
  <title>Products - Edgi Custom Works</title>
</svelte:head>

<div class="min-h-screen bg-slate-300">
  <!-- Header Section -->
  <div class="bg-[#f2f2f2] border-b border-gray-200 ">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 class="text-3xl font-bold text-gray-900">Products</h1>
      <p class="mt-2 text-gray-600 ">Browse our selection of custom airsoft products.</p>
    </div>
  </div>

  <!-- Filters and Search Bar -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <!-- Search Input -->
      <div class="flex-1">
        <div class="relative">
          <input
            type="text"
            placeholder="Search products..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-[#f2f2f2] text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            bind:value={searchQuery}
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="material-symbols-outlined text-gray-400">search</span>
          </div>
        </div>
      </div>

      <!-- Filter Dropdown -->
      <div class="relative">
        <button
          class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-[#f2f2f2] text-gray-700 hover:bg-gray-300 transition-colors"
          onclick={() => isFilterOpen = !isFilterOpen}
        >
          <span class="material-symbols-outlined text-lg">filter_list</span>
          Filters
          {#if selectedCategories.length > 0}
            <span class="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {selectedCategories.length}
            </span>
          {/if}
        </button>

        <!-- Dropdown Menu -->
        {#if isFilterOpen}
          <div class="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div class="p-4">
              <!-- Categories Section -->
              <div class="mb-4">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                  {#each categories as category}
                    <label class="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        class="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        checked={selectedCategories.includes(category.slug)}
                        onchange={() => handleCategoryToggle(category.slug)}
                      />
                      <span class="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                        {category.name}
                      </span>
                    </label>
                  {/each}
                </div>
              </div>

              <!-- Sort Section -->
              <div class="mb-4">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Sort By</h3>
                <div class="space-y-2">
                  {#each [
                    { value: 'newest', label: 'Newest First' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' },
                    { value: 'name', label: 'Name: A to Z' }
                  ] as option}
                    <label class="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        class="text-red-600 focus:ring-red-500"
                        checked={sortBy === option.value}
                        onchange={() => sortBy = option.value}
                      />
                      <span class="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                        {option.label}
                      </span>
                    </label>
                  {/each}
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <button
                  class="flex-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  onclick={clearAllFilters}
                >
                  Clear All
                </button>
                <button
                  class="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  onclick={() => isFilterOpen = false}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Loading State -->
    {#if isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    {:else}
      <!-- Products Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
  {#each products as product (product.productId)}
    <div class="relative group">
  <ProductCardV2 {product} />

  <button 
    onclick={() => quickAddToCart(product)}
    class="absolute bottom-3 right-3 
           bg-red-800 text-white p-2 rounded-full shadow-md 
           opacity-0 group-hover:opacity-100 
           translate-y-2 group-hover:translate-y-0
           transition-all duration-200"
  >
    <span class="material-symbols-outlined text-base leading-none">add_shopping_cart</span>
  </button>
</div>

  {/each}
</div>

      <!-- Empty State -->
      {#if products.length === 0}
        <div class="text-center py-12">
          <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">inventory_2</span>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your filters or search terms</p>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            onclick={clearAllFilters}
          >
            Clear Filters
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>