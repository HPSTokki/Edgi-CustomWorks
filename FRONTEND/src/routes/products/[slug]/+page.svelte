<script lang="ts">
  import { page } from "$app/stores";
  import ProductDetail from "../../../components/ProductDetail.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>
    {data.product ? data.product.name : 'Product Not Found'} - EdGi Custom Works
  </title>
</svelte:head>

{#if data.product}
  <ProductDetail product={data.product} />
{:else}
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
    <div class="text-center">
      <span class="material-symbols-outlined text-gray-400 text-6xl mb-4">error</span>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">The product you're looking for doesn't exist.</p>
      <a href="/products" class="text-red-600 hover:text-red-700 font-medium">Back to Products</a>
    </div>
  </div>
{/if}