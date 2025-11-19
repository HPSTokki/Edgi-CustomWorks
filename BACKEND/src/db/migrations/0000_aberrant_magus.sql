CREATE TYPE "public"."barrel_material_type" AS ENUM('Aluminum', 'Steel', 'Carbon Fiber');--> statement-breakpoint
CREATE TYPE "public"."color_finish" AS ENUM('Gold', 'Rainbow', 'Silver');--> statement-breakpoint
CREATE TYPE "public"."engraving_type" AS ENUM('text_only', 'logo_only', 'text_and_logo');--> statement-breakpoint
CREATE TABLE "barrel_length_pricing" (
	"barrel_length_pricing_id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"min_length_mm" integer NOT NULL,
	"max_length_mm" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	CONSTRAINT "barrel_length_pricing_product_id_min_length_mm_unique" UNIQUE("product_id","min_length_mm")
);
--> statement-breakpoint
CREATE TABLE "barrel_material_pricing" (
	"barrel_material_pricing_id" serial PRIMARY KEY NOT NULL,
	"material_type" "barrel_material_type" NOT NULL,
	"price" numeric(100, 2) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	CONSTRAINT "barrel_material_pricing_material_type_unique" UNIQUE("material_type")
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"cart_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"cart_items_id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"customizations" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "color_finish_pricing" (
	"color_finish_pricing_id" serial PRIMARY KEY NOT NULL,
	"finish" "color_finish" NOT NULL,
	"price" numeric(100, 2) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	CONSTRAINT "color_finish_pricing_finish_unique" UNIQUE("finish")
);
--> statement-breakpoint
CREATE TABLE "engraving_pricing" (
	"engraving_pricing_id" serial PRIMARY KEY NOT NULL,
	"engraving_type" "engraving_type" NOT NULL,
	"price" numeric(100, 2) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	CONSTRAINT "engraving_pricing_engraving_type_unique" UNIQUE("engraving_type")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"subtotal" numeric(10, 2) NOT NULL,
	"shipping" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"shipping_address" text NOT NULL,
	"payment_method" varchar(100) NOT NULL,
	"payment" varchar(50) DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"order_items_id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"customizations" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"product_id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(250) NOT NULL,
	"slug" varchar(250) NOT NULL,
	"description" text NOT NULL,
	"short_description" text NOT NULL,
	"base_price" integer DEFAULT 0 NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"has_color_finish" boolean DEFAULT false NOT NULL,
	"has_engraving" boolean DEFAULT false NOT NULL,
	"has_barrel_material_type" boolean DEFAULT false NOT NULL,
	"has_barrel_length" boolean DEFAULT false NOT NULL,
	"images" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "category" (
	"category_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"create_at" timestamp with time zone DEFAULT now() NOT NULL,
	"update_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"account_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(150) NOT NULL,
	"password" text NOT NULL,
	"role" integer NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL,
	CONSTRAINT "account_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"age" integer,
	"phone_number" varchar(15),
	"street" varchar(200),
	"city" varchar(100),
	"province" varchar(100),
	"zip_code" varchar(20),
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL,
	CONSTRAINT "user_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
ALTER TABLE "barrel_length_pricing" ADD CONSTRAINT "barrel_length_pricing_product_id_product_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("cart_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_product_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("product_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_account_id_account_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("account_id") ON DELETE no action ON UPDATE no action;