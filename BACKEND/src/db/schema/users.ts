import { pgTable, serial, varchar, text, integer } from "drizzle-orm/pg-core";
import { account } from "./accounts.ts"
import { int } from "drizzle-orm/mysql-core";

export const user = pgTable("user", {
    userID: serial("user_id").primaryKey(),
    accountID: integer("account_id")
        .notNull()
        .references(() => account.accountID)
        .unique(),
    firstName: varchar("first_name", { length: 100}).notNull(),
    lastName: varchar("last_name", { length: 100}).notNull(),
    age: integer("age").notNull(),

})

