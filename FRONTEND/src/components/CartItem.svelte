<script lang="ts">
  import type { CartItem } from '$lib/types/cart';

  export let item: CartItem;
  export let onQuantityChange: (itemId: number, newQuantity: number) => void;
  export let onRemove: (itemId: number) => void;

  const handleIncrement = (): void => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const handleDecrement = (): void => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    } else {
      onRemove(item.id);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const keyMap: { [key: string]: string } = {
    color_finish: 'Color: ',
    engraving: 'Engraving: ',
    barrel_material: 'Barrel Material: ',
  }

</script>

<div class="flex items-center gap-4 bg-white dark:bg-zinc-900 px-4 min-h-[72px] py-3 justify-between rounded-lg">
  <div class="flex items-center gap-4 flex-1">
    <div 
      class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 shrink-0"
      style="background-image: url('{item.images?.[0] || '/placeholder-image.jpg'}')"
    ></div>
    <div class="flex flex-col justify-center">
      <p class="text-[#181111] dark:text-white text-base font-semibold leading-normal line-clamp-1">
        {item.productName}
      </p>
      <p class="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal line-clamp-2">
        {formatPrice(item.unitPrice)}
      </p>
      {#if item.customizations && Object.keys(item.customizations).length > 0}
        <div class="text-xs text-gray-400 mt-1">
          {#each Object.entries(item.customizations) as [key, value]}
            {#if value?.value}
              <div>{keyMap[key] || key} : {value.value}</div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>
  <div class="shrink-0">
    <div class="flex items-center gap-2 text-[#181111] dark:text-white">
      <button 
        class="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-[#f4f0f0] dark:bg-zinc-800 cursor-pointer text-primary hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
        on:click={handleDecrement}
        aria-label="Decrease quantity"
      >-</button>
      <span class="text-base font-medium leading-normal w-4 text-center">
        {item.quantity}
      </span>
      <button 
        class="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-[#f4f0f0] dark:bg-zinc-800 cursor-pointer text-primary hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
        on:click={handleIncrement}
        aria-label="Increase quantity"
      >+</button>
    </div>
  </div>
</div>