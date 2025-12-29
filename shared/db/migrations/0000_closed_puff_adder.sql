CREATE TABLE "signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"external_id" text NOT NULL,
	"title" text,
	"text" text NOT NULL,
	"url" text,
	"timestamp" timestamp with time zone NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now(),
	"tags" text[] DEFAULT '{}',
	"raw_metadata" jsonb NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "signals_source_external_idx" ON "signals" USING btree ("source","external_id");