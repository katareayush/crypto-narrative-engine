import { db } from "./client"
import { signals } from "./schema";
import type { Signal } from "../types/signal";

export async function upsertSignal(signal: Signal) {
  await db
    .insert(signals)
    .values({
      source: signal.source,
      externalId: signal.externalId,
      title: signal.title,
      text: signal.text,
      url: signal.url,
      timestamp: signal.timestamp,
      tags: signal.tags,
      rawMetadata: signal.rawMetadata,
    })
    .onConflictDoNothing();
}
