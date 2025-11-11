import { pgTable, serial, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { product } from './products.ts';

export const productAvailableCustomization = pgTable('product_available_customization', {
    id: serial('id').primaryKey(),
    productId: integer('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
    hasColorFinish: boolean('has_color_finish').notNull().default(false),
    hasEngraving: boolean('has_engraving').notNull().default(false),
    hasBarrelLengthOption: boolean('has_barrel_length_option').notNull().default(false),
    hasBarrelMaterialOption: boolean('has_barrel_material_option').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow()
})