<script lang="ts">
  import { page } from '$app/stores';
  import { cartActions } from '$lib/stores/cart';
  import { browser } from '$app/environment';

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

  let quantity = $state(1);
  let currentImageIndex = $state(0);
  let isFavorite = $state(false);
  
  // Color finish options
  let selectedColor = $state('');
  let colorOptions = $state([
    { name: 'Gold', price: 50, value: 'Gold' },
    { name: 'Silver', price: 1000, value: 'Silver' },
    { name: 'Rainbow', price: 1500, value: 'Rainbow' }
  ]);

  // Engraving options
  let engravingText = $state('');
  let maxEngravingLength = 50;

  // Calculate engraving price reactively
  let engravingPrice = $derived(
    engravingText.length > 0 ? Math.max(200, engravingText.length * 10) : 0
  );

  // Calculate total price
  let total = $derived(
    (product.basePrice + 
     (selectedColor ? (colorOptions.find(c => c.value === selectedColor)?.price || 0) : 0) + 
     engravingPrice) * quantity
  );

  function incrementQuantity() {
    if (quantity < product.stockQuantity) quantity++;
  }

  function decrementQuantity() {
    if (quantity > 1) quantity--;
  }

async function addToCart(): Promise<void> {
    if (!browser) return;

    try {
      // Build customizations object based on selected options
      const customizations: any = {};

      // Add color finish customization if selected
      if (product.hasColorFinish && selectedColor) {
        const selectedColorOption = colorOptions.find(c => c.value === selectedColor);
        if (selectedColorOption) {
          customizations.color_finish = {
            value: selectedColorOption.value,
            price: selectedColorOption.price
          };
        }
      }

      // Add engraving customization if text is provided
      if (product.hasEngraving && engravingText.trim()) {
        customizations.engraving = {
          type: 'text',
          text: engravingText.trim(),
          value: engravingText.trim(),
          price: engravingPrice
        };
      }

      // Get user info from page data
      const user = $page.data.user;
      const sessionId = browser ? localStorage.getItem('sessionId') : null;
      const userId = user?.id;

      await cartActions.addItemToCart(
        product.productId,
        quantity,
        Object.keys(customizations).length > 0 ? customizations : undefined,
        sessionId || undefined,
        userId as number || undefined
      );

      // Optional: Show success message or redirect to cart
      // You can add a toast notification here
      console.log('Product added to cart!');

    } catch (error) {
      console.error('Failed to add product to cart:', error);
      // Show error message to user
    }
  }

  async function buyNow(): Promise<void> {
    // First add to cart, then redirect to checkout
    await addToCart();
    
    // Redirect to cart page
    if (browser) {
      window.location.href = '/cart';
    }
  }
</script>

<div class="min-h-screen bg-background-light">
  <!-- Sticky Header -->
  <div class="sticky top-0 z-10 flex items-center bg-background-light dark:bg-background-dark/80 dark:backdrop-blur-sm p-4 pb-2 justify-between border-b border-gray-200 dark:border-white/10">
    <button 
      class="text-[#181111] dark:text-white flex size-12 shrink-0 items-center justify-start" 
      onclick={() => history.back()}
    >
      <span class="material-symbols-outlined text-2xl">arrow_back</span>
    </button>
    <h2 class="text-[#181111] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center hidden sm:block">
      EdGi Custom Works
    </h2>
    <button 
      class="flex w-12 items-center justify-end" 
      onclick={() => isFavorite = !isFavorite}
    >
      <span class="material-symbols-outlined text-2xl">
        {isFavorite ? 'favorite' : 'favorite_border'}
      </span>
    </button>
  </div>

  <!-- Main Content -->
  <main class="grow pb-32 max-w-7xl mx-auto px-5">
    <div class="md:flex md:flex-row md:gap-8 md:px-8 flex flex-col gap-5">
      <!-- Image Section -->
      <div class="lg:w-1/2 lg:sticky lg:top-20 lg:self-start">
        {#if product.images && product.images.length > 0}
          <div 
            class="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-cover bg-center rounded-lg lg:rounded-xl"
            style="background-image: url('{product.images[0]}'); object-fit: center;"
          ></div>
        {:else}
          <div class="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-300 rounded-lg lg:rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-gray-400 text-6xl">image</span>
          </div>
        {/if}
      </div>

      <!-- Product Info Section -->
      <div class="lg:w-1/2 lg:py-8 p-4 bg-red-500 rounded-2xl">
        <!-- Product Info -->
        <div class="px-4 sm:px-6 lg:px-0 pt-6 lg:pt-0">
          {#if product.categoryName}
            <p class="text-gray-900 text-sm sm:text-base mb-2">
              {product.categoryName}
            </p>
          {/if}
          
          <h1 class="text-[#181111] text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
            {product.name}
          </h1>
          
          <!-- Dynamic Price Display -->
          <div class="pt-2 pb-4">
            <h2 class="text-[#f2f2f2] text-xl sm:text-2xl lg:text-3xl font-bold leading-tight tracking-[-0.015em]">
              ₱{total.toLocaleString()}
            </h2>
            {#if total > product.basePrice * quantity}
              <p class="text-gray-500 dark:text-gray-400 text-sm line-through">
                Base: ₱{(product.basePrice * quantity).toLocaleString()}
              </p>
            {/if}
          </div>
          <!-- Stock Status -->
          <div class="mb-6">
            {#if product.stockQuantity > 10}
              <p class="text-green-600 dark:text-green-400 text-sm sm:text-base">In Stock</p>
            {:else if product.stockQuantity > 0}
              <p class="text-orange-600 dark:text-orange-400 text-sm sm:text-base">
                Only {product.stockQuantity} left
              </p>
            {:else}
              <p class="text-red-600 dark:text-red-400 text-sm sm:text-base">Out of Stock</p>
            {/if}
          </div>
        </div>

        <!-- Color Finish Options -->
        {#if product.hasColorFinish}
          <div class="px-4 sm:px-6 lg:px-0 py-4">
            <div class="bg-[#f2f2f2] rounded-lg p-4 sm:p-6">
              <h3 class="font-bold text-[#181111] text-lg sm:text-xl mb-3 sm:mb-4">
                Color Finish
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {#each colorOptions as color}
                  <button
                    class={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedColor === color.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onclick={() => selectedColor = color.value}
                  >
                    <div class="font-medium text-gray-900">{color.name}</div>
                    {#if color.price > 0}
                      <div class="text-sm font-medium text-red-600 dark:text-red-400 mt-1">
                        +₱{color.price.toLocaleString()}
                      </div>
                    {:else}
                      <div class="text-sm text-green-600 dark:text-green-400 mt-1">Included</div>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        {#if product.hasEngraving}
  <div class="px-4 sm:px-6 lg:px-0 py-4">
    <div class="bg-[#f2f2f2] rounded-lg p-4 sm:p-6">
      <h3 class="font-bold text-[#181111] text-lg sm:text-xl mb-3 sm:mb-4">
        Custom Engraving
      </h3>
      <div class="space-y-4">
        <div>
          <label for="engraving-text-{product.productId}" class="block text-sm font-medium text-gray-700 mb-2">
            Engraving Text {#if engravingText}(+₱{engravingPrice.toLocaleString()}){/if}
          </label>
          <input
            id="engraving-text-{product.productId}"
            type="text"
            placeholder="Enter text to engrave (max 50 characters)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white text-gray-900  placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            bind:value={engravingText}
            maxlength={maxEngravingLength}
          />
          <div class="text-xs text-gray-600  mt-1 text-right">
            {engravingText.length}/{maxEngravingLength} characters
          </div>
        </div>
        <div class="text-sm text-gray-600 ">
          <p>• Base engraving fee: ₱200</p>
          <p>• Additional ₱10 per character</p>
          <p>• Maximum 50 characters</p>
        </div>
      </div>
    </div>
  </div>
{/if}

        <!-- Description -->
        <div class="px-4 sm:px-6 lg:px-0 py-4">
          <div class="bg-white dark:bg-gray-800/50 rounded-lg p-4 sm:p-6">
            <h3 class="font-bold text-[#181111] dark:text-white text-lg sm:text-xl mb-3 sm:mb-4">
              Description
            </h3>
            <p class="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              {product.shortDescription}
            </p>
          </div>
        </div>

        <!-- Action Area -->
        <div class="px-4 sm:px-6 lg:px-0 pt-6 pb-4 sticky bottom-0 bg-background-light dark:bg-background-dark lg:bg-transparent lg:dark:bg-transparent lg:static">
          <div class="flex items-center justify-between gap-4 mb-4">
            <!-- Quantity Selector -->
            <div class="flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
              <button 
                class="px-3 sm:px-4 py-2 sm:py-3 text-lg font-bold text-[#181111] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onclick={decrementQuantity}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span class="px-3 sm:px-4 py-2 sm:py-3 text-base font-bold text-[#181111] dark:text-white border-x border-gray-300 dark:border-gray-600 min-w-[50px] sm:min-w-[60px] text-center">
                {quantity}
              </span>
              <button 
                class="px-3 sm:px-4 py-2 sm:py-3 text-lg font-bold text-[#181111] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onclick={incrementQuantity}
                disabled={quantity >= product.stockQuantity}
              >
                +
              </button>
            </div>
            
            <!-- Buy Now Button -->
            <button 
              class="h-12 flex-1 rounded-lg bg-red-600 px-4 sm:px-6 text-base font-bold text-white shadow hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              onclick={buyNow}
              disabled={product.stockQuantity === 0}
            >
              Buy Now
            </button>
          </div>
          
          <!-- Add to Cart Button -->
          <button 
            class="w-full h-12 rounded-lg bg-[#181111] dark:bg-gray-800 text-white dark:text-gray-200 text-base font-bold shadow-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            onclick={addToCart}
            disabled={product.stockQuantity === 0}
          >
            {#if product.stockQuantity === 0}
              Out of Stock
            {:else}
              Add to Cart - ₱{total.toLocaleString()}
            {/if}
          </button>
        </div>
      </div>
    </div>
  </main>
</div>