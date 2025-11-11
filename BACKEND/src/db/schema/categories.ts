import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const category = pgTable("category", {
    id: integer("category_id").primaryKey().notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    createdAt: timestamp("create_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("update_at", { withTimezone: true }).notNull().defaultNow(),
});
