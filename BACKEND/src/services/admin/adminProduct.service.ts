import { db } from "../../db.ts";
import { eq, and, like, sql, desc, or, ilike } from 'drizzle-orm';
import { product } from "../../db/schema/products.ts";

export interface ProductData {
  id?: number;
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
  images?: string[];
}

export interface ProductFilters {
  categoryId?: number | undefined;
  search?: string | undefined;
  isActive?: boolean | undefined;
  hasColorFinish?: boolean | undefined;
  hasEngraving?: boolean | undefined;
  hasBarrelMaterialType?: boolean | undefined;
  hasBarrelLength?: boolean | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  averagePrice: number;
  totalValue: number;
}

export class AdminProductService {
  private prependBaseUrl(images: string[] | null | undefined): string[] {
    if (!images) return [];
    return images.map(img => {
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      return `http://localhost:3000/${img.replace(/^\//, '')}`;
    });
  }

  async getAllProducts(filters: ProductFilters = {}): Promise<any[]> {
    const {
      categoryId,
      search,
      isActive,
      hasColorFinish,
      hasEngraving,
      hasBarrelMaterialType,
      hasBarrelLength,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20
    } = filters;

    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];

    if (categoryId) {
      conditions.push(eq(product.categoryId, categoryId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(product.name, `%${search}%`),
          ilike(product.slug, `%${search}%`),
          ilike(product.description, `%${search}%`),
          ilike(product.shortDescription, `%${search}%`)
        )
      );
    }

    if (isActive !== undefined) {
      conditions.push(eq(product.isActive, isActive));
    }

    if (hasColorFinish !== undefined) {
      conditions.push(eq(product.hasColorFinish, hasColorFinish));
    }

    if (hasEngraving !== undefined) {
      conditions.push(eq(product.hasEngraving, hasEngraving));
    }

    if (hasBarrelMaterialType !== undefined) {
      conditions.push(eq(product.hasBarrelMaterialType, hasBarrelMaterialType));
    }

    if (hasBarrelLength !== undefined) {
      conditions.push(eq(product.hasBarrelLength, hasBarrelLength));
    }

    if (minPrice !== undefined) {
      conditions.push(sql`${product.basePrice} >= ${minPrice}`);
    }

    if (maxPrice !== undefined) {
      conditions.push(sql`${product.basePrice} <= ${maxPrice}`);
    }

    const whereCondition = conditions.length > 0 
      ? and(...conditions)
      : undefined;

    const products = await db
      .select()
      .from(product)
      .where(whereCondition)
      .orderBy(desc(product.createdAt))
      .limit(limit)
      .offset(offset);

    return products.map(p => ({
      ...p,
      images: this.prependBaseUrl(p.images),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
  }

  async getProductById(id: number): Promise<any> {
    const result = await db
      .select()
      .from(product)
      .where(eq(product.id, id))
      .limit(1);

    const productData = result[0];
    
    if (!productData) {
      throw new Error('Product not found');
    }

    return {
      ...productData,
      images: this.prependBaseUrl(productData.images)
    };
  }

  async getProductBySlug(slug: string): Promise<any> {
    const result = await db
      .select()
      .from(product)
      .where(eq(product.slug, slug))
      .limit(1);

    const productData = result[0];
    
    if (!productData) {
      throw new Error('Product not found');
    }

    return {
      ...productData,
      images: this.prependBaseUrl(productData.images)
    };
  }

  async createProduct(data: ProductData): Promise<any> {
    // Check if slug already exists
    const existingSlug = await db
      .select()
      .from(product)
      .where(eq(product.slug, data.slug))
      .limit(1);

    if (existingSlug.length > 0) {
      throw new Error('Product with this slug already exists');
    }

    const result = await db
      .insert(product)
      .values({
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        basePrice: data.basePrice,
        stockQuantity: data.stockQuantity,
        isActive: data.isActive,
        hasColorFinish: data.hasColorFinish,
        hasEngraving: data.hasEngraving,
        hasBarrelMaterialType: data.hasBarrelMaterialType,
        hasBarrelLength: data.hasBarrelLength,
        images: data.images || []
      })
      .returning();

    const created = result[0];
    
    return {
      ...created,
      images: this.prependBaseUrl(created?.images)
    };
  }

  async updateProduct(id: number, data: Partial<ProductData>): Promise<any> {
    // Check if product exists
    const existing = await db
      .select()
      .from(product)
      .where(eq(product.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('Product not found');
    }

    // If updating slug, check if it's unique (excluding current product)
    if (data.slug && data.slug !== existing[0]?.slug) {
      const existingSlug = await db
        .select()
        .from(product)
        .where(and(eq(product.slug, data.slug), sql`${product.id} != ${id}`))
        .limit(1);

      if (existingSlug.length > 0) {
        throw new Error('Product with this slug already exists');
      }
    }

    const updateData: any = {
      ...data,
      updatedAt: new Date()
    };

    const result = await db
      .update(product)
      .set(updateData)
      .where(eq(product.id, id))
      .returning();

    const updated = result[0];
    
    return {
      ...updated,
      images: this.prependBaseUrl(updated?.images)
    };
  }

  async updateProductStock(id: number, quantity: number): Promise<any> {
    const result = await db
      .update(product)
      .set({ 
        stockQuantity: quantity,
        updatedAt: new Date()
      })
      .where(eq(product.id, id))
      .returning();

    const updated = result[0];
    
    if (!updated) {
      throw new Error('Product not found');
    }

    return {
      ...updated,
      images: this.prependBaseUrl(updated.images)
    };
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(product)
      .where(eq(product.id, id))
      .returning({ id: product.id });

    return result.length > 0;
  }

  async toggleProductStatus(id: number): Promise<any> {
    const existing = await db
      .select()
      .from(product)
      .where(eq(product.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new Error('Product not found');
    }

    const result = await db
      .update(product)
      .set({ 
        isActive: !existing[0]?.isActive,
        updatedAt: new Date()
      })
      .where(eq(product.id, id))
      .returning();

    const updated = result[0];
    
    return {
      ...updated,
      images: this.prependBaseUrl(updated?.images)
    };
  }

  async getProductStats(): Promise<ProductStats> {
    const stats = await db
      .select({
        totalProducts: sql<number>`count(*)`,
        activeProducts: sql<number>`sum(case when ${product.isActive} = true then 1 else 0 end)`,
        inactiveProducts: sql<number>`sum(case when ${product.isActive} = false then 1 else 0 end)`,
        outOfStockProducts: sql<number>`sum(case when ${product.stockQuantity} = 0 then 1 else 0 end)`,
        lowStockProducts: sql<number>`sum(case when ${product.stockQuantity} > 0 and ${product.stockQuantity} <= 10 then 1 else 0 end)`,
        averagePrice: sql<string>`coalesce(avg(${product.basePrice}), '0')`,
        totalValue: sql<string>`coalesce(sum(${product.basePrice} * ${product.stockQuantity}), '0')`
      })
      .from(product);

    const data = stats[0];

    return {
      totalProducts: Number(data?.totalProducts) || 0,
      activeProducts: Number(data?.activeProducts) || 0,
      inactiveProducts: Number(data?.inactiveProducts) || 0,
      outOfStockProducts: Number(data?.outOfStockProducts) || 0,
      lowStockProducts: Number(data?.lowStockProducts) || 0,
      averagePrice: parseFloat(data?.averagePrice as string) || 0,
      totalValue: parseFloat(data?.totalValue as string) || 0
    };
  }

  async bulkUpdateProducts(ids: number[], data: Partial<ProductData>): Promise<number> {
    const updateData: any = {
      ...data,
      updatedAt: new Date()
    };

    const result = await db
      .update(product)
      .set(updateData)
      .where(sql`${product.id} IN (${ids.join(',')})`)
      .returning();

    return result.length;
  }

  async searchProducts(query: string, limit: number = 10): Promise<any[]> {
    const products = await db
      .select()
      .from(product)
      .where(
        or(
          ilike(product.name, `%${query}%`),
          ilike(product.slug, `%${query}%`),
          ilike(product.description, `%${query}%`)
        )
      )
      .limit(limit);

    return products.map(p => ({
      ...p,
      images: this.prependBaseUrl(p.images)
    }));
  }
}