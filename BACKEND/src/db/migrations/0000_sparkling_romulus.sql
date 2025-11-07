CREATE TYPE "public"."barrel_material_type" AS ENUM('Aluminum', 'Steel', 'Carbon Fiber');--> statement-breakpoint
CREATE TYPE "public"."color_finish" AS ENUM('Gold', 'Rainbow', 'Silver');--> statement-breakpoint
CREATE TYPE "public"."engraving_type" AS ENUM('text_only', 'logo_only', 'text_and_logo');--> statement-breakpoint
CREATE TABLE "barrel_material_pricing" (
	"barrel_material_pricing_id" serial PRIMARY KEY NOT NULL,
	"material_type" "barrel_material_type" NOT NULL,
	"price" numeric(100, 2) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	CONSTRAINT "barrel_material_pricing_material_type_unique" UNIQUE("material_type")
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
CREATE TABLE "product" (
	"product_id" integer PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(250) NOT NULL,
	"slug" varchar(250) NOT NULL,
	"description" text NOT NULL,
	"short_description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "barrel" (
	"barrel_id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"min_length_mm" integer NOT NULL,
	"max_length_mm" integer NOT NULL,
	"default_length_mm" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"category_id" integer PRIMARY KEY NOT NULL,
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
CREATE TABLE "color_finish_pricing" (
	"color_finish_pricing_id" serial PRIMARY KEY NOT NULL,
	"finish" "color_finish" NOT NULL,
	"price" numeric(100, 2) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	CONSTRAINT "color_finish_pricing_finish_unique" UNIQUE("finish")
);
--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barrel" ADD CONSTRAINT "barrel_product_id_product_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("product_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_account_id_account_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("account_id") ON DELETE no action ON UPDATE no action;