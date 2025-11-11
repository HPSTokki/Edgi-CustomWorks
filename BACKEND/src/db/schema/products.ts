import { pgTable, integer, varchar, text, date, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { category } from "./categories.ts";

export const product = pgTable("product", {
    id: integer("product_id").primaryKey().notNull(),
    categoryID: integer("category_id")
        .notNull()
        .references(() => category.id),
    name: varchar("name", { length: 250 }).notNull(),
    slug: varchar("slug", { length: 250 }).notNull().unique(),
    description: text("description").notNull(),
    shortDescription: text("short_description").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    images: jsonb('images').$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});