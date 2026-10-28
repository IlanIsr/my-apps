CREATE TABLE "album_shares" (
	"album_id" uuid PRIMARY KEY NOT NULL,
	"token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "album_shares_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "share_viewers" (
	"album_id" uuid NOT NULL,
	"viewer_id" text NOT NULL,
	"viewer_name" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "share_viewers_album_id_viewer_id_pk" PRIMARY KEY("album_id","viewer_id")
);
--> statement-breakpoint
ALTER TABLE "album_shares" ADD CONSTRAINT "album_shares_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_viewers" ADD CONSTRAINT "share_viewers_album_id_album_shares_album_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."album_shares"("album_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "share_viewers_viewer_idx" ON "share_viewers" USING btree ("viewer_id");