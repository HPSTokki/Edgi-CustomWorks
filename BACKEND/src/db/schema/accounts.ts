import { pgTable, serial, varchar, integer, text, date } from "drizzle-orm/pg-core"

export const account = pgTable("account", {
    accountID: serial("account_id").primaryKey(),
    email: varchar("email", { length: 150}).notNull().unique(),
    password: text("password").notNull(),
    role: integer("role").notNull(),
    createdAt: date("created_at").notNull()
})