import { pgTable, serial, varchar, decimal, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { user } from "../user_management/users.ts";
import { product } from "../products.ts";

export const order = pgTable('orders', {
    id: serial('order_id').primaryKey(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    userId: integer('user_id').notNull().references(() => user.id, { onDelete: 'set null' }),
    status: varchar('status', { length: 50 }).default('pending'),
    subtotal: decimal('subtotal', { precision: 10, scale: 2}).notNull(),
    shipping: decimal('shipping', { precision: 10, scale: 2}).notNull(),
    tax: decimal('tax', { precision: 10, scale: 2}).notNull().default('0.00'),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    shippingAddress: text('shipping_address').notNull(),
    billingAddress: text('billing_address'),
    paymentMethod: varchar('payment_method', { length: 100 }).notNull(),
    paymentStatus: varchar('payment_status', { length: 50 }).default('pending'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
    id: serial('order_items_id').primaryKey(),
    orderId: integer('order_id').notNull().references(() => order.id, { onDelete: 'cascade' }),
    productId: integer('product_id').notNull().references(() => product.id),
    quantity: integer('quantity').notNull().default(1),
    price: decimal('price', { precision: 10, scale: 2}).notNull(),
    customizations: jsonb('customizations'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})