import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { product } from "./products.ts";

export const barrel = pgTable("barrel", {
    barrelID: serial("barrel_id").primaryKey(),
    productID: integer("product_id")
        .notNull()
        .references(() => product.productID),
    minLengthMm: integer("min_length_mm").notNull(),
    maxLengthMm: integer("max_length_mm").notNull(),
    defaultLengthMm: integer("default_length_mm").notNull()
});