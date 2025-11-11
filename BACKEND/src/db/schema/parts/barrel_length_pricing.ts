import { pgTable, serial, integer, decimal } from 'drizzle-orm/pg-core';
import { product } from '../products.ts';

export const barrelLengthPricing = pgTable('barrel_length_pricing', {
    id: serial('barrel_length_pricing_id').primaryKey(),
    productId: integer('product_id').notNull().references(() => product.id, { onDelete: 'cascade' }),
    minLengthMm: integer('min_length_mm').notNull(),
    maxLengthMm: integer('max_length_mm').notNull(),
    price: decimal('price', { precision: 100, scale: 2 }).notNull(),
})