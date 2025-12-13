<script lang="ts">
  import type { Category } from '$lib/types/categories';
  import type { ProductData, CreateProductRequest } from '$lib/types/product';
  import { createEventDispatcher } from 'svelte';

  export let categories: Category[] = [];
  export let product: ProductData | null = null;
  export let mode: 'create' | 'edit' = 'create';
  export let apiBaseUrl = 'http://localhost:3000/api';

  // Form state
  let formData: Partial<CreateProductRequest> = product ? {
    categorySlug: product.categorySlug,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    basePrice: product.basePrice,
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    hasColorFinish: product.hasColorFinish,
    hasEngraving: product.hasEngraving,
    hasBarrelMaterialType: product.hasBarrelMaterialType,
    hasBarrelLength: product.hasBarrelLength,
    images: product.images || [],
    barrelLengthPricing: product.barrelLengthPricing || []
  } : {
    categorySlug: '',
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    basePrice: 0,
    stockQuantity: 0,
    isActive: true,
    hasColorFinish: true,
    hasEngraving: true,
    hasBarrelMaterialType: false,
    hasBarrelLength: false,
    images: [],
    barrelLengthPricing: []
  };

  let barrelPricingTiers = formData.barrelLengthPricing || [];
  let imageFiles: File[] = [];
  let imageUrls = formData.images || [];
  let uploadProgress: number | null = null;
  let isUploading = false;
  let formErrors: Record<string, string> = {};

  // Events
  const dispatch = createEventDispatcher<{
    submit: CreateProductRequest;
    cancel: void;
  }>();

  // Auto-generate slug from name
  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }

  function handleNameChange(e: Event) {
    const target = e.target as HTMLInputElement;
    formData.name = target.value;
    
    // Auto-generate slug if creating new product and slug is empty
    if (mode === 'create' && (!formData.slug || formData.slug === '')) {
      formData.slug = generateSlug(target.value);
    }
  }

  function addBarrelPricingTier() {
    barrelPricingTiers = [
      ...barrelPricingTiers,
      {
        minLengthMm: 0,
        maxLengthMm: 0,
        price: '0',
        isAvailable: true
      }
    ];
    formData.barrelLengthPricing = barrelPricingTiers;
  }

  function removeBarrelPricingTier(index: number) {
    barrelPricingTiers = barrelPricingTiers.filter((_, i) => i !== index);
    formData.barrelLengthPricing = barrelPricingTiers;
  }

  function updateBarrelPricingTier(index: number, field: keyof typeof barrelPricingTiers[0], value: any) {
    const newTiers = [...barrelPricingTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    barrelPricingTiers = newTiers;
    formData.barrelLengthPricing = barrelPricingTiers;
  }

  // Handle file selection
  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      
      // Validate file types and sizes
      const validFiles = newFiles.filter(file => {
        if (!file.type.startsWith('image/')) {
          formErrors.fileType = 'Only image files are allowed';
          return false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          formErrors.fileSize = 'File size must be less than 5MB';
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        imageFiles = [...imageFiles, ...validFiles];
        formErrors.fileType = '';
        formErrors.fileSize = '';
        
        // Create preview URLs for the new files
        validFiles.forEach(file => {
          const previewUrl = URL.createObjectURL(file);
          // Store temporary preview URLs
          const previewElement = document.createElement('div');
          previewElement.className = 'image-preview';
          previewElement.innerHTML = `
            <img src="${previewUrl}" alt="Preview" />
          `;
        });
      }
      
      // Clear file input
      input.value = '';
    }
  }

  // Remove image file
  function removeImageFile(index: number) {
    imageFiles = imageFiles.filter((_, i) => i !== index);
  }

  // Remove existing image URL
  function removeImageUrl(index: number) {
    imageUrls = imageUrls.filter((_, i) => i !== index);
    formData.images = imageUrls;
  }

  // Upload images to API
// Upload images to API
async function uploadImages(): Promise<string[]> {
  if (imageFiles.length === 0) return [...imageUrls]; // Return existing URLs

  const uploadedUrls: string[] = [...imageUrls];
  isUploading = true;
  
  for (const [index, file] of imageFiles.entries()) {
    try {
      // Calculate progress
      uploadProgress = Math.round(((index + 1) / imageFiles.length) * 100);
      
      // Get category and product info from form data
      const selectedCategory = categories.find(c => c.slug === formData.categorySlug);
      const categoryName = selectedCategory?.name || 'uncategorized';
      const productName = formData.slug || 'product';
      
      // Create FormData for file upload
      const fileFormData = new FormData();
      fileFormData.append('image', file);
      fileFormData.append('productName', productName);
      fileFormData.append('categoryName', categoryName);
      
      // Upload to API
      const response = await fetch(`${apiBaseUrl}/upload/upload`, {
        method: 'POST',
        body: fileFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      // The API should return the uploaded image URL
      if (result.url) {
        uploadedUrls.push(result.url);
      } else {
        console.warn('Upload response missing URL:', result);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      formErrors.upload = `Failed to upload image: ${file.name}. ${error instanceof Error ? error.message : 'Unknown error'}`;
      isUploading = false;
      uploadProgress = null;
      throw error;
    }
  }
  
  isUploading = false;
  uploadProgress = null;
  return uploadedUrls;
}

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!formData.categorySlug) {
      errors.categorySlug = 'Category is required';
    }

    if (!formData.name?.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.slug?.trim()) {
      errors.slug = 'Slug is required';
    }

    if (formData.basePrice === undefined || formData.basePrice < 0) {
      errors.basePrice = 'Valid base price is required';
    }

    if (formData.hasBarrelLength && barrelPricingTiers.length === 0) {
      errors.barrelPricing = 'At least one barrel pricing tier is required when barrel length is enabled';
    }

    // Validate barrel pricing tiers
    barrelPricingTiers.forEach((tier, index) => {
      if (tier.minLengthMm >= tier.maxLengthMm) {
        errors[`tier-${index}`] = 'Min length must be less than max length';
      }
      if (parseFloat(tier.price) <= 0) {
        errors[`tier-price-${index}`] = 'Price must be greater than 0';
      }
    });

    formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }

    try {
      // Upload images first
      if (imageFiles.length > 0) {
        const uploadedImageUrls = await uploadImages();
        formData.images = uploadedImageUrls;
      }

      // Submit form data
      dispatch('submit', formData as CreateProductRequest);
      
      // Clear uploaded files after successful submission
      imageFiles = [];
      
    } catch (error) {
      console.error('Error submitting form:', error);
      formErrors.submit = 'Failed to submit form. Please try again.';
    }
  }

  function handleCancel() {
    // Clean up object URLs
    imageFiles.forEach(file => {
      URL.revokeObjectURL(URL.createObjectURL(file));
    });
    dispatch('cancel');
  }

  // Drag and drop functionality
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const dropZone = e.currentTarget as HTMLElement;
    dropZone.classList.add('drag-over');
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const dropZone = e.currentTarget as HTMLElement;
    dropZone.classList.remove('drag-over');
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const dropZone = e.currentTarget as HTMLElement;
    dropZone.classList.remove('drag-over');
    
    if (e.dataTransfer?.files) {
      const files = Array.from(e.dataTransfer.files);
      // Simulate file input
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      
      const input = document.getElementById('imageUpload') as HTMLInputElement;
      if (input) {
        input.files = dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  }
</script>

<div class="product-form">
  <h2>{mode === 'create' ? 'Create New Product' : 'Edit Product'}</h2>
  
  <form onsubmit={handleSubmit}>
    <!-- Basic Information -->
    <div class="form-section">
      <h3>Basic Information</h3>
      
      <div class="form-row">
        <label for="categorySlug">
          Category *
          <select
            id="categorySlug"
            bind:value={formData.categorySlug}
            class={formErrors.categorySlug ? 'error' : ''}
          >
            <option value="">Select Category</option>
            {#each categories as category}
              <option value={category.slug}>
                {category.name}
              </option>
            {/each}
          </select>
          {#if formErrors.categorySlug}
            <span class="error-message">{formErrors.categorySlug}</span>
          {/if}
        </label>
      </div>

      <div class="form-row">
        <label for="name">
          Product Name *
          <input
            type="text"
            id="name"
            bind:value={formData.name}
            oninput={handleNameChange}
            class={formErrors.name ? 'error' : ''}
            placeholder="Enter product name"
          />
          {#if formErrors.name}
            <span class="error-message">{formErrors.name}</span>
          {/if}
        </label>

        <label for="slug">
          URL Slug *
          <input
            type="text"
            id="slug"
            bind:value={formData.slug}
            class={formErrors.slug ? 'error' : ''}
            placeholder="product-url-slug"
          />
          {#if formErrors.slug}
            <span class="error-message">{formErrors.slug}</span>
          {/if}
        </label>
      </div>

      <div class="form-row">
        <label for="shortDescription">
          Short Description
          <textarea
            id="shortDescription"
            bind:value={formData.shortDescription}
            rows="3"
            placeholder="Brief description for product listings"
          ></textarea>
        </label>
      </div>

      <div class="form-row">
        <label for="description">
          Full Description
          <textarea
            id="description"
            bind:value={formData.description}
            rows="6"
            placeholder="Detailed product description"
          >
          </textarea>
        </label>
      </div>
    </div>

    <!-- Pricing & Inventory -->
    <div class="form-section">
      <h3>Pricing & Inventory</h3>
      
      <div class="form-row">
        <label for="basePrice">
          Base Price ($) *
          <input
            type="number"
            id="basePrice"
            bind:value={formData.basePrice}
            min="0"
            step="0.01"
            class={formErrors.basePrice ? 'error' : ''}
            placeholder="0.00"
          />
          {#if formErrors.basePrice}
            <span class="error-message">{formErrors.basePrice}</span>
          {/if}
        </label>

        <label for="stockQuantity">
          Stock Quantity
          <input
            type="number"
            id="stockQuantity"
            bind:value={formData.stockQuantity}
            min="0"
            placeholder="0"
          />
        </label>
      </div>
    </div>

    <!-- Product Features -->
    <div class="form-section">
      <h3>Product Features</h3>
      
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={formData.isActive}
          />
          Active (visible to customers)
        </label>

        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={formData.hasColorFinish}
          />
          Has Color/Finish Options
        </label>

        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={formData.hasEngraving}
          />
          Has Engraving Options
        </label>

        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={formData.hasBarrelMaterialType}
          />
          Has Barrel Material Type Options
        </label>

        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={formData.hasBarrelLength}
          />
          Has Barrel Length Options
        </label>
      </div>
      {#if formErrors.barrelPricing}
        <span class="error-message">{formErrors.barrelPricing}</span>
      {/if}
    </div>

    <!-- Barrel Length Pricing (Conditional) -->
    {#if formData.hasBarrelLength}
      <div class="form-section">
        <div class="section-header">
          <h3>Barrel Length Pricing Tiers</h3>
          <button
            type="button"
            class="btn-secondary btn-small"
            onclick={addBarrelPricingTier}
          >
            + Add Tier
          </button>
        </div>
        
        {#each barrelPricingTiers as tier, index}
          <div class="pricing-tier">
            <div class="form-row">
              <label>
                Min Length (mm)
                <input
                  type="number"
                  value={tier.minLengthMm}
                  oninput={(e) => updateBarrelPricingTier(index, 'minLengthMm', 
                    parseInt((e.currentTarget as HTMLInputElement).value) || 0)}
                  min="0"
                  class={formErrors[`tier-${index}`] ? 'error' : ''}
                />
              </label>

              <label>
                Max Length (mm)
                <input
                  type="number"
                  value={tier.maxLengthMm}
                  oninput={(e) => updateBarrelPricingTier(index, 'maxLengthMm', 
                    parseInt((e.currentTarget as HTMLInputElement).value) || 0)}
                  min="0"
                  class={formErrors[`tier-${index}`] ? 'error' : ''}
                />
              </label>

              <label>
                Price ($)
                <input
                  type="number"
                  value={tier.price}
                  oninput={(e) => updateBarrelPricingTier(index, 'price', 
                    (e.currentTarget as HTMLInputElement).value)}
                  min="0"
                  step="0.01"
                  class={formErrors[`tier-price-${index}`] ? 'error' : ''}
                />
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  checked={tier.isAvailable}
                  onchange={(e) => updateBarrelPricingTier(index, 'isAvailable', 
                    (e.currentTarget as HTMLInputElement).checked)}
                />
                Available
              </label>

              <button
                type="button"
                class="btn-danger"
                onclick={() => removeBarrelPricingTier(index)}
                title="Remove tier"
              >
                ×
              </button>
            </div>
            {#if formErrors[`tier-${index}`]}
              <span class="error-message">{formErrors[`tier-${index}`]}</span>
            {/if}
            {#if formErrors[`tier-price-${index}`]}
              <span class="error-message">{formErrors[`tier-price-${index}`]}</span>
            {/if}
          </div>
        {:else}
          <div class="empty-state">
            No pricing tiers added. Click "Add Tier" to create one.
          </div>
        {/each}
      </div>
    {/if}

    <!-- Images -->
    <div class="form-section">
      <h3>Product Images</h3>
      
      <!-- Upload Progress -->
      {#if isUploading}
        <div class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: {uploadProgress}%"></div>
          </div>
          <div class="progress-text">Uploading: {uploadProgress}%</div>
        </div>
      {/if}

      <!-- File Upload -->
      <div class="upload-area"
           ondragover={handleDragOver}
           ondragleave={handleDragLeave}
           ondrop={handleDrop}
      >
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          multiple
          onchange={handleFileSelect}
          class="file-input"
        />
        <label for="imageUpload" class="upload-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <div>
            <strong>Click to upload</strong> or drag and drop
          </div>
          <small>PNG, JPG, GIF up to 5MB</small>
        </label>
      </div>

      {#if formErrors.fileType}
        <span class="error-message">{formErrors.fileType}</span>
      {/if}
      {#if formErrors.fileSize}
        <span class="error-message">{formErrors.fileSize}</span>
      {/if}
      {#if formErrors.upload}
        <span class="error-message">{formErrors.upload}</span>
      {/if}
      {#if formErrors.submit}
        <span class="error-message">{formErrors.submit}</span>
      {/if}

      <!-- File Previews -->
      {#if imageFiles.length > 0}
        <div class="file-previews">
          <h4>New Uploads ({imageFiles.length})</h4>
          <div class="image-list">
            {#each imageFiles as file, index}
              <div class="image-item">
                {#if file.type.startsWith('image/')}
                  <img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} />
                {:else}
                  <div class="file-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                  </div>
                {/if}
                <div class="file-info">
                  <span class="file-name">{file.name}</span>
                  <span class="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  class="btn-danger btn-small"
                  onclick={() => removeImageFile(index)}
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Existing Images -->
      {#if imageUrls.length > 0}
        <div class="existing-images">
          <h4>Existing Images ({imageUrls.length})</h4>
          <div class="image-list">
            {#each imageUrls as url, index}
              <div class="image-item">
                <img src={url} alt={`Product image ${index + 1}`} 
                  onerror={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.style.display = 'none';
                  }} 
                />
                <div class="image-url">{new URL(url).pathname.split('/').pop()}</div>
                <button
                  type="button"
                  class="btn-danger btn-small"
                  onclick={() => removeImageUrl(index)}
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        </div>
      {:else if imageFiles.length === 0}
        <div class="empty-state">
          No images added yet. Upload images above.
        </div>
      {/if}
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <button type="button" class="btn-secondary" onclick={handleCancel}>
        Cancel
      </button>
      <button type="submit" class="btn-primary" disabled={isUploading}>
        {#if isUploading}
          <span class="spinner"></span> Uploading...
        {:else}
          {mode === 'create' ? 'Create Product' : 'Update Product'}
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  .product-form {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }

  .form-section {
    margin-bottom: 30px;
    padding: 25px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .form-section h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #2c3e50;
    font-size: 1.3em;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-weight: 500;
    color: #34495e;
  }

  input, select, textarea {
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.3s;
    background: #fff;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }

  input.error, select.error {
    border-color: #e74c3c;
  }

  .error-message {
    color: #e74c3c;
    font-size: 12px;
    margin-top: 5px;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .checkbox-label {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin: 0;
  }

  .pricing-tier {
    margin-bottom: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #dee2e6;
  }

  /* Upload Styles */
  .file-input {
    display: none;
  }

  .upload-area {
    border: 2px dashed #bdc3c7;
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 20px;
  }

  .upload-area:hover,
  .upload-area.drag-over {
    border-color: #3498db;
    background-color: rgba(52, 152, 219, 0.05);
  }

  .upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    color: #7f8c8d;
  }

  .upload-label svg {
    color: #3498db;
    width: 48px;
    height: 48px;
  }

  .upload-label strong {
    color: #2c3e50;
    font-size: 16px;
  }

  .upload-progress {
    margin-bottom: 20px;
  }

  .progress-bar {
    height: 8px;
    background: #ecf0f1;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 5px;
  }

  .progress-fill {
    height: 100%;
    background: #2ecc71;
    transition: width 0.3s;
  }

  .progress-text {
    font-size: 12px;
    color: #7f8c8d;
    text-align: center;
  }

  .file-previews,
  .existing-images {
    margin-top: 20px;
  }

  .file-previews h4,
  .existing-images h4 {
    margin: 0 0 15px 0;
    color: #34495e;
    font-size: 16px;
  }

  .image-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
  }

  .image-item {
    position: relative;
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
  }

  .image-item img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }

  .file-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 150px;
    background: #ecf0f1;
  }

  .file-icon svg {
    width: 48px;
    height: 48px;
    color: #7f8c8d;
  }

  .file-info {
    padding: 10px;
    font-size: 12px;
  }

  .file-name {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #2c3e50;
  }

  .file-size {
    color: #7f8c8d;
  }

  .image-url {
    padding: 8px 10px;
    font-size: 11px;
    color: #7f8c8d;
    background: #f8f9fa;
    border-top: 1px solid #eee;
    word-break: break-all;
  }

  .image-item button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(231, 76, 60, 0.9);
    color: white;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .image-item button:hover {
    background: rgba(192, 57, 43, 0.9);
  }

  .empty-state {
    padding: 20px;
    text-align: center;
    color: #7f8c8d;
    font-style: italic;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px dashed #bdc3c7;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 40px;
    padding-top: 25px;
    border-top: 2px solid #ecf0f1;
  }

  button {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #3498db;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: #95a5a6;
    color: white;
  }

  .btn-secondary:hover {
    background: #7f8c8d;
  }

  .btn-danger {
    background: #e74c3c;
    color: white;
    min-width: 24px;
    height: 24px;
    padding: 0;
    font-size: 14px;
  }

  .btn-danger:hover {
    background: #c0392b;
  }

  .btn-small {
    padding: 6px 12px;
    font-size: 12px;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>