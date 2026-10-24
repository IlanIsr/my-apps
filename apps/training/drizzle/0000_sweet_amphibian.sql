CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"source_exam_id" uuid,
	"questions" jsonb NOT NULL,
	"results" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"current_index" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"cas" text,
	"prompts" jsonb NOT NULL,
	"answer" text,
	"siman" text DEFAULT '' NOT NULL,
	"seif" text DEFAULT '' NOT NULL,
	"sources" jsonb NOT NULL,
	"is_special" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "exams_owner_idx" ON "exams" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "questions_owner_idx" ON "questions" USING btree ("owner_id");