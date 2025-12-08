<script lang="ts">
  import { cartActions } from '$lib/stores/cart';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';

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
      createdAt: string;
      hasColorFinish: boolean;
      hasEngraving: boolean;
      hasBarrelLength: boolean;
      hasBarrelMaterialType: boolean;
    }
  }>();

  async function quickAddToCart(): Promise<void> {
    if (!browser) return;

    try {
      const user = $page.data.user;
      const sessionId = browser ? localStorage.getItem('sessionId') : null;
      const userId = user?.id;

      await cartActions.addItemToCart(
        product.productId,
        1, // Default quantity
        undefined, // No customizations for quick add
        sessionId || undefined,
        userId as number || undefined
      );

      // Show quick feedback
      console.log('Product added to cart!');
    } catch (error) {
      console.error('Failed to add product to cart:', error);
    }
  }
</script>

<a href="/products/{product.slug}" class="block h-full">
  <div
    class="bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col relative w-full h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer"
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
    onclick={() => goto('/products/' + product.slug)}
    class="mt-2 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
    disabled={product.stockQuantity === 0}
  >
    {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
  </button>
  </div>
</a>