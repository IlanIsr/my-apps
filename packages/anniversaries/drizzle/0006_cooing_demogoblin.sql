CREATE TABLE "person_series" (
	"person_id" text NOT NULL,
	"location" text NOT NULL,
	"google_event_id" text NOT NULL,
	"html_link" text DEFAULT '' NOT NULL,
	CONSTRAINT "person_series_person_id_location_pk" PRIMARY KEY("person_id","location")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_shown" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "person_series" ADD CONSTRAINT "person_series_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;