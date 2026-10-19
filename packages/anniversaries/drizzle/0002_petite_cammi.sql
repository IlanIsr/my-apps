CREATE TABLE IF NOT EXISTS "share_link_persons" (
	"share_link_id" text NOT NULL,
	"person_id" text NOT NULL,
	CONSTRAINT "share_link_persons_share_link_id_person_id_pk" PRIMARY KEY("share_link_id","person_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "share_links" (
	"id" text PRIMARY KEY NOT NULL,
	"created_by" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "share_link_persons" ADD CONSTRAINT "share_link_persons_share_link_id_share_links_id_fk" FOREIGN KEY ("share_link_id") REFERENCES "public"."share_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_link_persons" ADD CONSTRAINT "share_link_persons_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;