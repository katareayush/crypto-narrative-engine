import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  serial,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { uniqueIndex } from "drizzle-orm/pg-core";

export const signals = pgTable(
  "signals",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    source: text("source").notNull(),
    externalId: text("external_id").notNull(),

    title: text("title"),
    text: text("text").notNull(),
    url: text("url"),

    timestamp: timestamp("timestamp", {
      withTimezone: true,
    }).notNull(),

    ingestedAt: timestamp("ingested_at", {
      withTimezone: true,
    }).defaultNow(),

    tags: text("tags").array().default([]),

    rawMetadata: jsonb("raw_metadata").notNull(),
  },
  (table) => ({
    sourceExternalIdx: uniqueIndex(
      "signals_source_external_idx"
    ).on(table.source, table.externalId),
  })
);

export const narratives = pgTable(
  "narratives",
  {
    id: serial("id").primaryKey(),
    narrative_name: text("narrative_name").notNull(),
    score: doublePrecision("score").notNull(),
    confidence: text("confidence").notNull(),
    why_now: text("why_now").notNull(),
    evidence: jsonb("evidence").notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
  },
  (table) => ({
    narrativeNameIdx: uniqueIndex(
      "narratives_narrative_name_idx"
    ).on(table.narrative_name),
  })
);
