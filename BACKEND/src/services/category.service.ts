import { db } from '../db.ts';
import { eq } from 'drizzle-orm';
import { ProductCategory } from '../db/index.ts';

export const CategoryService = {

    async getAll()  {

        return await db
        .select()
        .from(ProductCategory)
        .orderBy(ProductCategory.name);

    },

    async create(categoryData: { name: string; slug: string }) {
        const [newCategory] = await db
        .insert(ProductCategory)
        .values(categoryData)
        .returning();

        return newCategory;

    },

    async findBySlug(slug: string) {

        const [category] = await db
        .select()
        .from(ProductCategory)
        .where(eq(ProductCategory.slug, slug))
        .limit(1);

        return category;

    }

}