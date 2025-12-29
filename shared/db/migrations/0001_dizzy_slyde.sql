CREATE TABLE "narratives" (
	"id" serial PRIMARY KEY NOT NULL,
	"narrative_name" text NOT NULL,
	"score" double precision NOT NULL,
	"confidence" text NOT NULL,
	"why_now" text NOT NULL,
	"evidence" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "narratives_narrative_name_idx" ON "narratives" USING btree ("narrative_name");