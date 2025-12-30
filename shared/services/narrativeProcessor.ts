import { db } from '../db/client.ts';
import { signals, narratives } from '../db/schema.ts';
import { gte, desc } from 'drizzle-orm';
import { detectNarrative, scoreNarrative } from "./narrativeDetection.ts";
import { calculateMomentumBonus, getRecencyMultiplier, generateWhyNow } from "./narrativeScoring.ts";
import { SOURCE_WEIGHTS } from "../config/narratives.ts";
import type { ScoredSignal, ProcessedNarrative } from "../types/narrative.ts";

export async function processNarratives(): Promise<void> {
  
  const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
  
  const recentSignals = await db
    .select()
    .from(signals)
    .where(gte(signals.timestamp, cutoffDate))
    .orderBy(desc(signals.timestamp))
    .limit(1000);

  if (recentSignals.length === 0) {
    return;
  }

  
  const processedNarratives = processSignalsIntoNarratives(recentSignals);
  
  // Save narratives to database
  for (const narrative of processedNarratives) {
    await db
      .insert(narratives)
      .values({
        narrative_name: narrative.narrative_name,
        score: narrative.score,
        confidence: narrative.confidence,
        why_now: narrative.why_now,
        evidence: narrative.evidence as any
      })
      .onConflictDoUpdate({
        target: narratives.narrative_name,
        set: {
          score: narrative.score,
          confidence: narrative.confidence,
          why_now: narrative.why_now,
          evidence: narrative.evidence as any,
          created_at: new Date()
        }
      });

  }
}

export function processSignalsIntoNarratives(signals: any[]): ProcessedNarrative[] {
  const narrativeBuckets: Record<string, ScoredSignal[]> = {};

  for (const signal of signals) {
    const combinedText = `${signal.title ?? ""} ${signal.text}`.trim();
    if (!combinedText) continue;

    const narrativeMatch = detectNarrative(combinedText);
    if (!narrativeMatch) continue;

    const narrative = narrativeMatch.narrative;

    if (!narrativeBuckets[narrative]) {
      narrativeBuckets[narrative] = [];
    }

    const sourceWeight = SOURCE_WEIGHTS[signal.source as keyof typeof SOURCE_WEIGHTS] || 1.0;
    const recencyMultiplier = getRecencyMultiplier(new Date(signal.timestamp));
    
    const narrativeSignals = narrativeBuckets[narrative].map(s => s.signal).concat(signal);
    const momentumBonus = calculateMomentumBonus(narrativeSignals) / narrativeSignals.length;

    const scoredSignal: ScoredSignal = {
      signal,
      match: narrativeMatch,
      sourceWeight,
      recencyMultiplier,
      momentumBonus,
    };

    narrativeBuckets[narrative].push(scoredSignal);
  }

  return Object.entries(narrativeBuckets)
    .map(([narrative, scoredSignals]) => {
      const score = scoreNarrative(scoredSignals);
      
      return {
        narrative_name: narrative,
        score: score.finalScore,
        confidence: score.confidence,
        why_now: generateWhyNow(narrative, scoredSignals, score),
        evidence: scoredSignals
          .sort((a, b) => b.sourceWeight * b.match.strength - a.sourceWeight * a.match.strength)
          .slice(0, 5)
          .map((s) => ({
            source: s.signal.source,
            url: s.signal.url || `#${s.signal.externalId}`,
          })),
      };
    })
    .filter(filterQualityNarratives)
    .sort((a, b) => b.score - a.score);
}

function filterQualityNarratives(narrative: ProcessedNarrative): boolean {
  const sources = new Set(narrative.evidence.map(e => e.source));
  
  if (narrative.score < 3 && sources.size === 1) {
    return false;
  }
  
  if (narrative.score < 1.5 && narrative.confidence === 'weak') {
    return false;
  }
  
  return true;
}