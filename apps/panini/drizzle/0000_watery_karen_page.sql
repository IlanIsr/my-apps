CREATE TABLE "albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"cards_per_page" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "albums_owner_id_unique" UNIQUE("owner_id")
);
--> statement-breakpoint
CREATE TABLE "card_counts" (
	"card_id" uuid NOT NULL,
	"collector_id" uuid NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "card_counts_card_id_collector_id_pk" PRIMARY KEY("card_id","collector_id"),
	CONSTRAINT "card_counts_count_nonneg" CHECK ("card_counts"."count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"album_id" uuid NOT NULL,
	"code" text NOT NULL,
	"page" integer NOT NULL,
	"label" text DEFAULT '' NOT NULL,
	CONSTRAINT "cards_album_code_uq" UNIQUE("album_id","code")
);
--> statement-breakpoint
CREATE TABLE "collectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"album_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"position" integer NOT NULL,
	"is_reserve" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_rewards" (
	"album_id" uuid NOT NULL,
	"page" integer NOT NULL,
	"prize" text NOT NULL,
	"kind" text NOT NULL,
	"deadline" date,
	"winners" integer,
	CONSTRAINT "page_rewards_album_id_page_pk" PRIMARY KEY("album_id","page")
);
--> statement-breakpoint
ALTER TABLE "card_counts" ADD CONSTRAINT "card_counts_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_counts" ADD CONSTRAINT "card_counts_collector_id_collectors_id_fk" FOREIGN KEY ("collector_id") REFERENCES "public"."collectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collectors" ADD CONSTRAINT "collectors_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_rewards" ADD CONSTRAINT "page_rewards_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collectors_album_idx" ON "collectors" USING btree ("album_id");