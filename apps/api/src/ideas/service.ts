import { db } from "../../../../shared/db/client.js";
import { narratives } from "../../../../shared/db/schema.js";
import { desc } from "drizzle-orm";
import { generateAppIdeas } from "./generator.js";
import { generateAppIdeaWithTemplate } from "./templates.js";
import type { ProcessedNarrative } from "../../../../shared/types/narrative.js";
import type { AppIdeaWithTemplate, RankedAppIdea } from "../../../../shared/types/appIdea.js";

export async function getTopNarratives(limit: number = 10): Promise<ProcessedNarrative[]> {
  const results = await db
    .select()
    .from(narratives)
    .orderBy(desc(narratives.score))
    .limit(limit);

  return results.map(row => ({
    narrative_name: row.narrative_name,
    score: row.score,
    confidence: row.confidence as 'strong' | 'emerging' | 'weak',
    why_now: row.why_now,
    evidence: row.evidence as Array<{ source: string; url: string }>
  }));
}

export async function generateAllAppIdeas(narrativeLimit: number = 10): Promise<AppIdeaWithTemplate[]> {
  const topNarratives = await getTopNarratives(narrativeLimit);
  const rankedIdeas = generateAppIdeas(topNarratives);
  
  return rankedIdeas.map((idea: RankedAppIdea) => 
    generateAppIdeaWithTemplate(idea, {
      narrative_name: idea.narrative_name,
      narrative_confidence: idea.narrative_confidence,
      narrative_score: idea.narrative_score,
      rank_score: idea.rank_score
    })
  );
}

export async function getAppIdeaById(id: number): Promise<AppIdeaWithTemplate | null> {
  const allIdeas = await generateAllAppIdeas();
  return allIdeas[id - 1] || null;
}