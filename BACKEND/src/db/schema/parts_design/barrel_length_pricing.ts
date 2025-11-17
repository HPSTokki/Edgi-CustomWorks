import { pgTable, serial, varchar, integer, decimal, boolean, unique } from "drizzle-orm/pg-core";
import { Product } from "../../index.ts";

export const barrelLengthPricing = pgTable("barrel_length_pricing", {
    barrelLengthPricingId: serial("barrel_length_pricing_id").primaryKey(),
    productId: integer("product_id").notNull().references(() => Product.id, { onDelete: "cascade" }),
    minLengthMm: integer("min_length_mm").notNull(),
    maxLengthMm: integer("max_length_mm").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
}, (table) => { return {
    uniqueProductMinLength: unique().on(table.productId, table.minLengthMm),
}})