CREATE TABLE "product_distinct_pairs" (
	"owner_id" text NOT NULL,
	"product_a" uuid NOT NULL,
	"product_b" uuid NOT NULL,
	CONSTRAINT "product_distinct_pairs_owner_id_product_a_product_b_pk" PRIMARY KEY("owner_id","product_a","product_b")
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "aisle" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "content_milli" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "content_unit" text;--> statement-breakpoint
ALTER TABLE "product_distinct_pairs" ADD CONSTRAINT "product_distinct_pairs_product_a_products_id_fk" FOREIGN KEY ("product_a") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_distinct_pairs" ADD CONSTRAINT "product_distinct_pairs_product_b_products_id_fk" FOREIGN KEY ("product_b") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;