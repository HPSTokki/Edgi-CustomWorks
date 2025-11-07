import { pgTable, serial, pgEnum, decimal, boolean, varchar} from "drizzle-orm/pg-core";

export const colorFinish = pgEnum("color_finish", [
    "Gold", 
    "Rainbow",
    "Silver"
])

export const colorFinishPricing = pgTable("color_finish_pricing", {
    colorFinishPricingId: serial("color_finish_pricing_id").primaryKey(),
    finish: colorFinish("finish").notNull().unique(),
    price: decimal("price", { precision: 100, scale: 2 }).notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
})