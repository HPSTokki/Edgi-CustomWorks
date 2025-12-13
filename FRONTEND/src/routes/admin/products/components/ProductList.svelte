<script lang="ts">
  import type { ProductData } from '$lib/types/product';
  import { createEventDispatcher } from 'svelte';

  export let products: ProductData[] = [];

  const dispatch = createEventDispatcher<{
    edit: ProductData;
    delete: number;
  }>();

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
</script>

<div class="product-list">
  {#if products.length === 0}
    <div class="empty-state">
      No products found. Create your first product!
    </div>
  {:else}
    <table class="products-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each products as product}
          <tr>
            <td class="product-info">
              {#if product.images && product.images[0]}
                <img
                  src={product.images[0]}
                  alt={product.name}
                  class="product-thumbnail"
                />
              {/if}
              <div>
                <strong>{product.name}</strong>
                <small>{product.slug}</small>
              </div>
            </td>
            <td>{product.categoryName}</td>
            <td>{formatPrice(product.basePrice)}</td>
            <td>{product.stockQuantity}</td>
            <td>
              <span class={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td class="actions">
              <button
                class="btn-edit"
                on:click={() => dispatch('edit', product)}
              >
                Edit
              </button>
              <button
                class="btn-delete"
                on:click={() => dispatch('delete', product.productId)}
              >
                Delete
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .product-list {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .empty-state {
    padding: 60px;
    text-align: center;
    color: #6c757d;
    font-size: 16px;
  }

  .products-table {
    width: 100%;
    border-collapse: collapse;
  }

  .products-table th {
    background: #f8f9fa;
    padding: 15px;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
  }

  .products-table td {
    padding: 15px;
    border-bottom: 1px solid #dee2e6;
  }

  .products-table tr:hover {
    background: #f8f9fa;
  }

  .product-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .product-thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #dee2e6;
  }

  .product-info div {
    display: flex;
    flex-direction: column;
  }

  .product-info small {
    color: #6c757d;
    font-size: 12px;
  }

  .status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-badge.active {
    background: #d4edda;
    color: #155724;
  }

  .status-badge.inactive {
    background: #f8d7da;
    color: #721c24;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  .actions button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .btn-edit {
    background: #ffc107;
    color: #212529;
  }

  .btn-edit:hover {
    background: #e0a800;
  }

  .btn-delete {
    background: #dc3545;
    color: white;
  }

  .btn-delete:hover {
    background: #c82333;
  }
</style>