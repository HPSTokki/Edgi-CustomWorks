import { db } from '../db.ts';
import { eq, and, ilike, desc, asc, sql } from 'drizzle-orm';
import { Product, ProductCategory, BarrelLengthPricing } from '../db/index.ts';
import type { ProductData, CreateProductData, UpdateProductData, InterfaceBarrelLengthPricing } from '../types/types.js';

export const ProductService = {

    async getAll(filters: { categorySlug?: string; search?: string} = {}) {

        const conditions = [eq(Product.isActive, true)];

        if (filters.categorySlug) {
            conditions.push(eq(ProductCategory.slug, filters.categorySlug));
        }

        if (filters.search) {

            const searchTerm = `${filters.search}`
            const formattedSearchTerm = searchTerm.toLowerCase().replace(/ /g, '-');

            conditions.push(eq(sql`LOWER(${Product.slug}) ILIKE ${formattedSearchTerm}`, true));
        }

        const products = await db
        .select({
            productId: Product.id,
            categoryId: Product.categoryId,
            categoryName: ProductCategory.name,
            categorySlug: ProductCategory.slug,
            name: Product.name,
            slug: Product.slug,
            description: Product.description,
            shortDescription: Product.shortDescription,
            basePrice: Product.basePrice,
            stockQuantity: Product.stockQuantity,
            isActive: Product.isActive,
            hasColorFinish: Product.hasColorFinish,
            hasEngraving: Product.hasEngraving,
            hasBarrelMaterialType: Product.hasBarrelMaterialType,
            hasBarrelLength: Product.hasBarrelLength,
            images: Product.images,
            createdAt: Product.createdAt,
            updatedAt: Product.updatedAt,
        })
        .from(Product)
        .innerJoin(ProductCategory, eq(Product.categoryId, ProductCategory.id))
        .where(and(...conditions))
        .orderBy(desc(Product.createdAt));
        
        return products as ProductData[];
    },
    
    async getBySlug(slug: string) {

        const [product] = await db
        .select({
            productId: Product.id,
            categoryId: Product.categoryId,
            categoryName: ProductCategory.name,
            categorySlug: ProductCategory.slug,
            name: Product.name,
            slug: Product.slug,
            description: Product.description,
            shortDescription: Product.shortDescription,
            basePrice: Product.basePrice,
            stockQuantity: Product.stockQuantity,
            isActive: Product.isActive,
            hasColorFinish: Product.hasColorFinish,
            hasEngraving: Product.hasEngraving,
            hasBarrelMaterialType: Product.hasBarrelMaterialType,
            hasBarrelLength: Product.hasBarrelLength,
            images: Product.images,
            createdAt: Product.createdAt,
            updatedAt: Product.updatedAt,
        })
        .from(Product)
        .innerJoin(ProductCategory, eq(Product.categoryId, ProductCategory.id))
        .where(and(
            eq(Product.slug, slug),
            eq(Product.isActive, true)
        )).limit(1);

        return product as ProductData | undefined;
    },

    async getBarrelLengthPricing(productId: number) {
        return await db
        .select()
        .from(BarrelLengthPricing)
        .where(eq(BarrelLengthPricing.productId, productId))
        .orderBy(asc(BarrelLengthPricing.minLengthMm));
    },

    async createProduct(productData: CreateProductData) {
        
        const [newProduct] = await db
        .insert(Product)
        .values(productData)
        .returning();

        return newProduct;

    },

    async updateProduct(productId: number, updateData: UpdateProductData) {
        const [updateProduct] = await db
        .update(Product)
        .set(updateData)
        .where(eq(Product.id, productId))
        .returning();

        return updateProduct;
    },

    async createBarrelPricing(pricingData: InterfaceBarrelLengthPricing[]) {
        if (pricingData.length > 0) {
            await db
            .insert(BarrelLengthPricing)
            .values(pricingData);
        }
    }

}
