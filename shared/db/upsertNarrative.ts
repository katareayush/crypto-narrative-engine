import { eq } from "drizzle-orm";
import { db } from "./client";
import { narratives } from "./schema";

export interface NarrativeData {
  narrative_name: string;
  score: number;
  confidence: 'strong' | 'emerging' | 'weak';
  why_now: string;
  evidence: Array<{ source: string; url: string }>;
}

export async function upsertNarrative(narrative: NarrativeData) {
  try {
    const existing = await db
      .select()
      .from(narratives)
      .where(eq(narratives.narrative_name, narrative.narrative_name))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(narratives)
        .set({
          score: narrative.score,
          confidence: narrative.confidence,
          why_now: narrative.why_now,
          evidence: narrative.evidence,
          created_at: new Date(),
        })
        .where(eq(narratives.narrative_name, narrative.narrative_name));
    } else {
      await db.insert(narratives).values(narrative);
    }
  } catch (error) {
    console.error(`Failed to upsert narrative "${narrative.narrative_name}":`, error);
    throw error;
  }
}

export async function upsertNarratives(narrativeList: NarrativeData[]) {
  const results = await Promise.allSettled(
    narrativeList.map(narrative => upsertNarrative(narrative))
  );
  
  const failed = results.filter(r => r.status === 'rejected').length;
  if (failed > 0) {
    console.error(`Failed to upsert ${failed} out of ${narrativeList.length} narratives`);
  }
  
  return results;
}