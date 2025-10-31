CREATE TABLE "account" (
	"account_id" serial PRIMARY KEY NOT NULL,
	"email" varchar(150) NOT NULL,
	"password" text NOT NULL,
	"role" integer NOT NULL,
	"created_at" date NOT NULL,
	CONSTRAINT "account_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"age" integer NOT NULL,
	CONSTRAINT "user_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_account_id_account_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("account_id") ON DELETE no action ON UPDATE no action;