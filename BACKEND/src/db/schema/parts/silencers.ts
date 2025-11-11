import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { product } from "../products.ts";

export const silencer = pgTable("silencer", {
    id: serial("silencer_id").primaryKey(),
    productId: integer("product_id").notNull().references(() => product.id, { onDelete: 'cascade' }),
})