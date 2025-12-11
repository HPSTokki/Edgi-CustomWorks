<script lang="ts">
  import FeaturedComments from "../components/FeaturedComments.svelte";


  import ProductCard from "../components/ProductCard.svelte";
  import type { PageLoad } from "./$types";

  let { data } = $props<{ data: PageLoad }>(); 

  let { products } = $derived(data as any);

  let featComments: number = 4;

</script>

<svelte:head>
  <title>Home - Edgi Custom Works</title>
</svelte:head>

<section class="relative h-[60vh] bg-gray-900 text-white">
  <img
    alt="Various custom airsoft parts arranged neatly"
    class="absolute inset-0 h-full w-full object-cover opacity-50"
    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ86zseb5TBk0mYvNByYLLADNxrXXyhzq0Cf6HnBKP1LbIryuyx3v4Uo1wVC_OE8crFoktsfidL5dvdqOQB0Q8sCXnIBnK_Lq3RkwtKZHsSKqorCQwTAZqqa1KHpV9vcfK6YPtpVny2n6XGMwpleuVZsm8EOgJoHGdgYhUfGus2OdStt7qfsZiOUffSZ651T0mPKf6Bxavh3tGKnLMYOK2LATskUdtWymvc08dC_M7Rrp1hYUef-ccM6PniyyixNEB9xm5K6uoCPI"
  />
  <div class="relative z-10 flex h-full flex-col justify-end p-6">
    <h1 class="text-4xl font-bold leading-tight">
      Airsofting<br />Beyond<br />Expectation
    </h1>
    <p class="mt-2 text-sm text-gray-300">
      Customize. Engrave. Add your own touch.
    </p>
    <a href="/products">
      
      <button
      class="mt-6 w-max rounded-full bg-red-300 px-8 py-3 text-sm font-semibold text-[#333] shadow-md transition hover:bg-red-600"
    >
      Shop
    </button>
    
    </a>
  </div>
</section>

<section class="h-auto text-white p-5 gap-2">

  <h2 class="text-2xl font-bold text-[#333] p-4">Featured Products</h2>

<div class="carousel w-full md:flex md:justify-center md:gap-4 md:overflow-x-hidden">
  {#each data.products as product, index (product.productId)}
    <div id="slide{index + 1}" class="carousel-item relative w-full md:w-64">
      <div class="flex justify-center w-full">
        <ProductCard {product} />
      </div>
      
      <!-- Navigation Arrows -->
      <div class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between md:hidden">
        <a href="#slide{index === 0 ? data.products.length : index}" class="btn btn-circle">❮</a>
        <a href="#slide{index + 2 > data.products.length ? 1 : index + 2}" class="btn btn-circle">❯</a>
      </div>
    </div>
  {/each}
</div>
</section>


<!-- Featured Comments -->
<section class="min-h-min bg-slate-500">

  <h2 class="text-2xl font-bold text-[#f2f2f2] p-4">
    Featured Comments
  </h2>
  <div class="carousel w-full md:flex md:justify-center md:gap-4 md:overflow-x-hidden p-4">
    {#each Array(featComments) as _, index }
      <div id="commentSlide{index + 1}" class="carousel-item relative w-full md:w-72">
        <div class="flex justify-center w-full">
          <FeaturedComments />
        </div>

        <!-- Navigation Arrows -->

        <div class="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between md:hidden">
          <a href="#commentSlide{index === 0 ? featComments : index}" class="btn btn-circle">❮</a>
          <a href="#commentSlide{index + 2 > featComments ? 1 : index + 2}" class="btn btn-circle">❯</a>
        </div>

      </div>
    {/each}
  </div>

</section>


