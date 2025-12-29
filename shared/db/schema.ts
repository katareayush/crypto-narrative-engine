import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { uniqueIndex } from "drizzle-orm/pg-core";

export const signals = pgTable(
  "signals",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    source: text("source").notNull(),          // farcaster | github | rss | dune
    externalId: text("external_id").notNull(), // id from the source

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
