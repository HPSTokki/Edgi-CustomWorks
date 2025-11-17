import { pgTable, integer, varchar, text, date, timestamp, boolean, jsonb, serial } from "drizzle-orm/pg-core";
import { category } from "./categories.ts";

export const product = pgTable("product", {
    id: serial("product_id").primaryKey().notNull(),
    categoryId: integer("category_id")
        .notNull()
        .references(() => category.id),
    name: varchar("name", { length: 250 }).notNull(),
    slug: varchar("slug", { length: 250 }).notNull().unique(),
    description: text("description").notNull(),
    shortDescription: text("short_description").notNull(),
    basePrice: integer("base_price").notNull().default(0),
    stockQuantity: integer('stock_quantity').notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    hasColorFinish: boolean("has_color_finish").notNull().default(false),
    hasEngraving: boolean("has_engraving").notNull().default(false),
    hasBarrelMaterialType: boolean("has_barrel_material_type").notNull().default(false),
    hasBarrelLength: boolean("has_barrel_length").notNull().default(false),
    images: jsonb('images').$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});