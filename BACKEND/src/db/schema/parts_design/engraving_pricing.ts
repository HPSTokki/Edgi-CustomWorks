import { pgTable, serial, pgEnum, decimal, boolean } from "drizzle-orm/pg-core";

export const engravingType = pgEnum("engraving_type", [
    "text_only",
    'logo_only',
    "text_and_logo"
]);

export const engravingPricing = pgTable("engraving_pricing", {
    engravingPricingId: serial("engraving_pricing_id").primaryKey(),
    engravingType: engravingType("engraving_type").notNull().unique(),
    price: decimal("price", { precision: 100, scale: 2 }).notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
});