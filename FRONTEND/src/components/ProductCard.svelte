<script lang="ts">



export let product: App.ProductData;

function formatPrice(price: number): string {
    return `${price.toFixed(2)}`;
}

console.log(product);

</script>

<div class="relative w-full h-full max-w-sm overflow-hidden rounded-xl bg-white dark:bg-[#333] shadow-lg">
    <div class="w-full bg-center bg-no-repeat aspect-square bg-cover" 
         data-alt={product.name} 
         style="background-image: url('{product.images[0]}');">
    </div>
    <div class="flex w-full flex-col items-stretch justify-center gap-1 p-2">
        <h3 class="text-xl font-bold leading-tight text text-[#333] dark:text-[#f2f2f2]">
            {product.name}
        </h3>
        <div class="flex items-center gap-1 text text-secondary dark:text-[#f2f2f2]">
            <span class="material-symbols-outlined text-[#333] leading-tight! dark:text-[#f2f2f2]">
                local_fire_department
            </span>
            <p class="text-sm font-medium">
                {product.stockQuantity}
            </p>
        </div>
        <p class="text-lg font-bold text-[#333] dark:text-[#f2f2f2]">
            &#8369;{product.basePrice ? formatPrice(product.basePrice) : "Contact for Price"}
        </p>
    </div>
    <button class="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-105 active:scale-95">
        <span class="material-symbols-outlined">add_shopping_cart</span>    
    </button>
    
</div>