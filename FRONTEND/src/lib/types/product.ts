export interface ProductData {
  productId: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  basePrice: number;
  stockQuantity: number;
  isActive: boolean;
  hasColorFinish: boolean;
  hasEngraving: boolean;
  hasBarrelMaterialType: boolean;
  hasBarrelLength: boolean;
  images: string[]; // Array of image URLs
  barrelLengthPricing?: BarrelPricingTier[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  basePrice: number;
  stockQuantity: number;
  isActive: boolean;
  hasColorFinish: boolean;
  hasEngraving: boolean;
  hasBarrelMaterialType: boolean;
  hasBarrelLength: boolean;
  images: string[]; // Array of uploaded image URLs
  barrelLengthPricing: BarrelPricingTier[];
}

export interface BarrelPricingTier {
  minLengthMm: number;
  maxLengthMm: number;
  price: string;
  isAvailable: boolean;
}

export interface UpdateProductData {
  categorySlug?: string;
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  basePrice?: number;
  stockQuantity?: number;
  isActive?: boolean;
  hasColorFinish?: boolean;
  hasEngraving?: boolean;
  hasBarrelMaterialType?: boolean;
  hasBarrelLength?: boolean;
  images?: string[];
}

export interface BarrelPricingTier {
  minLengthMm: number;
  maxLengthMm: number;
  price: string;
  isAvailable: boolean;
}