export interface CreateProductData {
    categoryId: number;
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
    images: string[];
}

export interface ProductData {
    productId: number | string;
    categoryId: number | string;
    categoryName: string;
    categorySlug: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    basePrice: number;
    stockQuantity: number;
    isActive: boolean;
    hasColorFinish?: boolean;
    hasEngraving?: boolean;
    hasBarrelMaterialType?: boolean;
    hasBarrelLength?: boolean;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateProductData {
    name?: string | undefined;
    slug?: string | undefined;
    description?: string | undefined;
    shortDescription?: string | undefined;
    basePrice?: number | undefined;
    stockQuantity?: number | undefined;
    isActive?: boolean | undefined;
    hasColorFinish?: boolean | undefined;
    hasEngraving?: boolean | undefined;
    hasBarrelMaterialType?: boolean | undefined;
    hasBarrelLength?: boolean | undefined;
    images?: string[] | undefined;
}

export interface InterfaceBarrelLengthPricing {
    barrelLengthPricingId?: number;
    productId: number;
    minLengthMm: number;
    maxLengthMm: number;
    price: string;
    isAvailable?: boolean;
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
    images: string[];
    minBarrelLength?: number;
    maxBarrelLength?: number;
    barrelLengthPricing?: InterfaceBarrelLengthPricing[];
}

export interface AccountSignUpData {
    email: string;
    password: string;
    role: number | 0;
}

export interface AccountLoginData {
    id?: number;
    email: string;
    password: string;
    role?: number | 0;
}

export interface UserProfileData {

    firstName?: string;
    lastName?: string;
    
}

export interface UpdateUserProfileData {

    accountId?: number;
    firstName?: string;
    lastName?: string;
    age?: number;
    phoneNumber?: string;
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    
}