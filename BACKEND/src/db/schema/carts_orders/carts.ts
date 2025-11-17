import { pgTable, serial, integer, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "../user_management/users.ts";
import { product } from "../products.ts";

export const cart = pgTable('carts', {
    id: serial('cart_id').primaryKey(),
    userId: integer('user_id').notNull().references(() => user.id, { onDelete: 'cascade'}),
    sessionId: varchar('session_id', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const cartItems = pgTable('cart_items', {
    id: serial('cart_items_id').primaryKey(),
    cartId: integer('cart_id').notNull().references(() => cart.id, { onDelete: 'cascade'}),
    productId: integer('product_id').notNull(),
    quantity: integer('quantity').notNull().default(1),
    customizations: jsonb('customizations').$type<{
        color_finish?: { value: string; price: number };
        engraving?: { type:string; text?: string; logo?: string; value: string; price: number };
        barrel_length?: { value: number; price: number };
        barrel_material?: { value: string; price: number };
    }>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})