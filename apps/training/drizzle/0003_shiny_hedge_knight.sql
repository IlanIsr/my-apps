CREATE TABLE "lexicon_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"book" text NOT NULL,
	"amud" integer NOT NULL,
	"term" text NOT NULL,
	"translation" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "lexicon_owner_book_idx" ON "lexicon_entries" USING btree ("owner_id","book");