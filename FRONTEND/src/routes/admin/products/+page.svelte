<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import ProductForm from './components/ProductForm.svelte';
  import ProductList from './components/ProductList.svelte';
  import type { ProductData, CreateProductRequest } from '$lib/types/product';
  import type { Category } from '$lib/types/categories';

  // State
  let products: ProductData[] = [];
  let categories: Category[] = [];
  let loading = true;
  let error: string | null = null;
  let success: string | null = null;
  let mode: 'list' | 'create' | 'edit' = 'list';
  let selectedProduct: ProductData | null = null;

  // API base URL (adjust as needed)
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Load products and categories
  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      loading = true;
      error = null;
      
      // Load categories
      const catResponse = await fetch(`${API_BASE}/categories`);
      if (catResponse.ok) {
        categories = await catResponse.json();
      } else {
        throw new Error('Failed to load categories');
      }

      // Load products
      const prodResponse = await fetch(`${API_BASE}/api/products`);
      if (prodResponse.ok) {
        products = await prodResponse.json();
      } else {
        throw new Error('Failed to load products');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load data';
      console.error('Load error:', err);
    } finally {
      loading = false;
    }
  }

  // Handle create product
  async function handleCreate(productData: CreateProductRequest) {
    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const newProduct = await response.json();
        products = [newProduct, ...products];
        success = 'Product created successfully!';
        error = null;
        mode = 'list';
        
        // Clear success message after 3 seconds
        setTimeout(() => success = null, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create product';
      success = null;
      console.error('Create error:', err);
    }
  }

  // Handle update product
  async function handleUpdate(productData: CreateProductRequest) {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`${API_BASE}/products/${selectedProduct.productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        products = products.map(p => 
          p.productId === updatedProduct.id ? { ...p, ...updatedProduct } : p
        );
        success = 'Product updated successfully!';
        error = null;
        mode = 'list';
        selectedProduct = null;
        
        setTimeout(() => success = null, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update product';
      success = null;
      console.error('Update error:', err);
    }
  }

  // Handle delete product
  async function handleDelete(productId: CustomEvent<number>) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const response = await fetch(`${API_BASE}/products/${productId.detail}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        products = products.filter(p => p.productId !== productId.detail);
        success = 'Product deleted successfully!';
        error = null;
        
        setTimeout(() => success = null, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete product';
      success = null;
      console.error('Delete error:', err);
    }
  }

  function handleEdit(product: CustomEvent<ProductData>) {
    selectedProduct = product.detail;
    mode = 'edit';
    // Scroll to top when editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleFormCancel() {
    mode = 'list';
    selectedProduct = null;
    error = null;
  }

  function handleFormSubmit(data: CustomEvent<CreateProductRequest>) {
    if (mode === 'create') {
      handleCreate(data.detail);
    } else if (mode === 'edit' && selectedProduct) {
      handleUpdate(data.detail);
    }
  }

  function handleRetry() {
    loadData();
  }
</script>

<div class="products-admin">
  <!-- Header -->
  <header class="page-header">
    <div>
      <h1>Product Management</h1>
      <p class="subtitle">Manage your product catalog</p>
    </div>
    
    {#if mode === 'list'}
      <button
        class="btn-primary"
        on:click={() => {
          mode = 'create';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add New Product
      </button>
    {:else}
      <button
        class="btn-secondary"
        on:click={handleFormCancel}
      >
        ← Back to List
      </button>
    {/if}
  </header>

  <!-- Notifications -->
  {#if error}
    <div class="notification error">
      <div class="notification-content">
        <strong>Error:</strong> {error}
      </div>
      <button class="notification-close" on:click={() => error = null}>×</button>
    </div>
  {/if}

  {#if success}
    <div class="notification success">
      <div class="notification-content">
        <strong>Success:</strong> {success}
      </div>
      <button class="notification-close" on:click={() => success = null}>×</button>
    </div>
  {/if}

  <!-- Loading State -->
  {#if loading && mode === 'list'}
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

  <!-- Main Content -->
  {:else if mode === 'list'}
    {#if products.length === 0}
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <h3>No Products Found</h3>
        <p>Get started by creating your first product.</p>
        <button
          class="btn-primary"
          on:click={() => mode = 'create'}
        >
          Create First Product
        </button>
      </div>
    {:else}
      <ProductList
        {products}
        on:edit={handleEdit}
        on:delete={handleDelete}
      />
      <div class="stats">
        <small>Showing {products.length} product{products.length !== 1 ? 's' : ''}</small>
      </div>
    {/if}
  {:else if mode === 'create' || mode === 'edit'}
    <div class="form-container">
      {#if categories.length === 0}
        <div class="alert warning">
          <strong>Warning:</strong> No categories found. Please create categories first.
          <button class="btn-secondary" on:click={() => goto('/admin/categories')}>
            Go to Categories
          </button>
        </div>
      {:else}
        <ProductForm
          {categories}
          product={selectedProduct}
          mode={mode}
          on:submit={handleFormSubmit}
          on:cancel={handleFormCancel}
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  .products-admin {
    min-height: 100vh;
    background: #f5f7fa;
    padding: 20px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 25px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .page-header h1 {
    margin: 0 0 5px 0;
    color: #2c3e50;
    font-size: 28px;
  }

  .subtitle {
    margin: 0;
    color: #7f8c8d;
    font-size: 14px;
  }

  .page-header button {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .page-header button svg {
    margin-right: 5px;
  }

  .notification {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    margin-bottom: 25px;
    border-radius: 8px;
    animation: slideIn 0.3s ease;
  }

  .notification.error {
    background: #ffeaea;
    border: 1px solid #ffcdd2;
    color: #c0392b;
  }

  .notification.success {
    background: #e8f7ef;
    border: 1px solid #c8e6c9;
    color: #27ae60;
  }

  .notification-content {
    flex: 1;
  }

  .notification-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
    padding: 0;
    width: 30px;
    height: 30px;
  }

  .notification-close:hover {
    opacity: 1;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  .empty-state {
    text-align: center;
    padding: 60px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .empty-state svg {
    color: #bdc3c7;
    margin-bottom: 20px;
  }

  .empty-state h3 {
    margin: 0 0 10px 0;
    color: #2c3e50;
  }

  .empty-state p {
    color: #7f8c8d;
    margin-bottom: 25px;
  }

  .stats {
    text-align: center;
    margin-top: 20px;
    color: #7f8c8d;
    font-size: 14px;
  }

  .alert {
    padding: 20px;
    background: #fff8e1;
    border: 1px solid #ffecb3;
    border-radius: 8px;
    margin-bottom: 20px;
    color: #8d6e63;
  }

  .alert.warning {
    background: #fff8e1;
    border-color: #ffecb3;
    color: #8d6e63;
  }

  .alert button {
    margin-left: 15px;
  }

  .form-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    padding: 10px;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .products-admin {
      padding: 15px;
    }
    
    .page-header {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
      text-align: center;
    }
    
    .form-section {
      padding: 15px;
    }
    
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>