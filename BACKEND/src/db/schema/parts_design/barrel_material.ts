import { pgTable, serial, pgEnum, decimal, boolean } from "drizzle-orm/pg-core";

export const barrelMaterialType = pgEnum("barrel_material_type", [
    "Aluminum",
    "Steel",
    "Carbon Fiber",
])

export const barrelMaterialPricing = pgTable("barrel_material_pricing", {
    barrelMaterialPricingId: serial("barrel_material_pricing_id").primaryKey(),
    materialType: barrelMaterialType("material_type").notNull().unique(),
    price: decimal("price", { precision: 100, scale: 2 }).notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
})