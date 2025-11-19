<script lang="ts">
  import FeaturedComments from "../components/FeaturedComments.svelte";


  import ProductCard from "../components/ProductCard.svelte";
  import type { PageLoad } from "./$types";

  let { data } = $props<{ data: PageLoad }>(); 

  let { products } = $derived(data as any);

  

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
    <button
      class="mt-6 w-max rounded-full bg-red-300 px-8 py-3 text-sm font-semibold text-[#333] shadow-md transition hover:bg-red-600"
    >
      Shop
    </button>
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
<section class="w-full h-full bg-slate-500">

  <h2 class="text-2xl font-bold text-[#f2f2f2] p-4">
    Featured Comments
  </h2>
  <div class="hero min-h-screen">
    <FeaturedComments />
  </div>

</section>


<footer class="footer sm:footer-horizontal bg-base-300 text-base-content p-10">
  <nav>
    <h6 class="footer-title">Services</h6>
    <a class="link link-hover" href="/">Branding</a>
    <a class="link link-hover" href="/">Design</a>
    <a class="link link-hover" href="/">Marketing</a>
    <a class="link link-hover" href="/">Advertisement</a>
  </nav>
  <nav>
    <h6 class="footer-title">Company</h6>
    <a class="link link-hover" href="/">About us</a>
    <a class="link link-hover" href="/">Contact</a>
    <a class="link link-hover" href="/">Jobs</a>
    <a class="link link-hover" href="/">Press kit</a>
  </nav>
  <nav>
    <h6 class="footer-title">Social</h6>
    <div class="grid grid-flow-col gap-4">
      <a href="/" aria-label="twitter link">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="fill-current">
          <path
            d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
        </svg>
      </a>
      <a href="/" aria-label="youtube link">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="fill-current">
          <path
            d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
        </svg>
      </a>
      <a href="/" aria-label="facebook link">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="fill-current">
          <path
            d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
        </svg>
      </a>
    </div>
  </nav>
</footer>
