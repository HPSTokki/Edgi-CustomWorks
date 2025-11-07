import { pgTable, integer, varchar, text, date, timestamp, boolean } from "drizzle-orm/pg-core";
import { category } from "./categories.ts";

export const product = pgTable("product", {
    productID: integer("product_id").primaryKey().notNull(),
    categoryID: integer("category_id")
        .notNull()
        .references(() => category.categoryID),
    name: varchar("name", { length: 250 }).notNull(),
    slug: varchar("slug", { length: 250 }).notNull().unique(),
    description: text("description").notNull(),
    shortDescription: text("short_description").notNull(),
    is_active: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});