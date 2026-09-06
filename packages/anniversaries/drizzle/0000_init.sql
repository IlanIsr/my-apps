CREATE TABLE "person_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "person_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"person_id" text NOT NULL,
	"year" integer NOT NULL,
	"date" text NOT NULL,
	"time" text DEFAULT '' NOT NULL,
	"google_event_id" text DEFAULT '' NOT NULL,
	"html_link" text DEFAULT '' NOT NULL,
	"manual" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_members" (
	"person_id" text NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "person_members_person_id_email_pk" PRIMARY KEY("person_id","email")
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"hebrew_name" text,
	"origin" text,
	"heb_year" integer,
	"heb_day" integer NOT NULL,
	"heb_month" text NOT NULL,
	"key" text NOT NULL,
	"created_by" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "person_events" ADD CONSTRAINT "person_events_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_members" ADD CONSTRAINT "person_members_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "person_events_person_id_idx" ON "person_events" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "persons_key_idx" ON "persons" USING btree ("key");