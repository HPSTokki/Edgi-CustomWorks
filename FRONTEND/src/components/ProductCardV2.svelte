<script lang="ts">
  let { product } = $props<{
    product: {
      productId: number;
      name: string;
      slug: string;
      basePrice: number;
      images: string[];
      categoryName: string;
      stockQuantity: number;
      shortDescription: string;
    }
  }>();
</script>

<a href="/products/{product.slug}" class="block h-full">
  <div
    class="bg-white dark:bg-zinc-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col relative w-full h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer"
  >
    <!-- Product Image -->
    {#if product.images && product.images.length > 0}
      <img
        alt={product.name}
        class="w-full h-32 sm:h-40 md:h-48 object-cover"
        src={product.images[0]}
        loading="lazy"
      />
    {:else}
      <!-- Fallback image -->
      <div class="w-full h-32 sm:h-40 md:h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <span class="material-symbols-outlined text-gray-400 text-4xl">image</span>
      </div>
    {/if}

    <!-- Product Content -->
    <div class="p-3 sm:p-4 grow flex flex-col">
      <!-- Category Badge -->
      {#if product.categoryName}
        <div class="mb-2">
          <span class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">
            {product.categoryName}
          </span>
        </div>
      {/if}

      <!-- Product Name -->
      <h2 class="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 line-clamp-2 sm:line-clamp-3 mb-2">
        {product.name}
      </h2>

      <!-- Short Description (if available) -->
      {#if product.shortDescription}
        <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {product.shortDescription}
        </p>
      {/if}

      <!-- Price -->
      <p class="text-red-600 dark:text-red-400 font-bold text-base sm:text-lg mt-auto">
        ₱{product.basePrice.toLocaleString()}
      </p>

      <!-- Stock Status -->
      <div class="mt-1">
        {#if product.stockQuantity > 10}
          <p class="text-xs text-green-600 dark:text-green-400">In Stock</p>
        {:else if product.stockQuantity > 0}
          <p class="text-xs text-orange-600 dark:text-orange-400">Only {product.stockQuantity} left</p>
        {:else}
          <p class="text-xs text-red-600 dark:text-red-400">Out of Stock</p>
        {/if}
      </div>
    </div>

    <!-- Add to Cart Button - Make it a separate clickable element -->
    <button
      class="absolute bottom-2 right-2 bg-red-600 text-white h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shadow-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      disabled={product.stockQuantity === 0}
      title={product.stockQuantity === 0 ? 'Out of stock' : 'Add to cart'}
      onclick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Add to cart logic here
        console.log('Add to cart:', product.productId);
      }}
    >
      <span class="material-symbols-outlined text-lg sm:text-xl">
        {product.stockQuantity === 0 ? 'remove_shopping_cart' : 'add_shopping_cart'}
      </span>
    </button>
  </div>
</a>