import { pgTable, serial, varchar, text, integer, date } from "drizzle-orm/pg-core";
import { account } from "./accounts.ts"

export const user = pgTable("user", {
    userID: serial("user_id").primaryKey(),
    accountID: integer("account_id")
        .notNull()
        .references(() => account.accountID)
        .unique(),
    firstName: varchar("first_name", { length: 100}),
    lastName: varchar("last_name", { length: 100}),
    age: integer("age"),
    phoneNumber: varchar("phone_number", { length: 15 }),
    street: varchar("street", { length: 200 }),
    city: varchar("city", { length: 100 }),
    province: varchar("province", { length: 100 }),
    zipCode: varchar("zip_code", { length: 20 }),
    createdAt: date("created_at").notNull().defaultNow(),
    updatedAt: date("updated_at").notNull().defaultNow()
});

