CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"key" text,
	"name" text,
	"icon" text NOT NULL,
	"position" integer NOT NULL,
	"budget" integer,
	"archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_rules" (
	"owner_id" text NOT NULL,
	"merchant_key" text NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "category_rules_owner_id_merchant_key_pk" PRIMARY KEY("owner_id","merchant_key")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"date" date NOT NULL,
	"amount" integer NOT NULL,
	"category_id" uuid,
	"merchant" text,
	"method" text DEFAULT 'cash' NOT NULL,
	"note" text,
	"receipt_id" uuid,
	"import_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "method" text DEFAULT 'cash' NOT NULL;--> statement-breakpoint
ALTER TABLE "category_rules" ADD CONSTRAINT "category_rules_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receipt_id_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_owner_idx" ON "categories" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "transactions_owner_idx" ON "transactions" USING btree ("owner_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_receipt_idx" ON "transactions" USING btree ("receipt_id") WHERE "transactions"."receipt_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_import_idx" ON "transactions" USING btree ("owner_id","import_key") WHERE "transactions"."import_key" is not null;