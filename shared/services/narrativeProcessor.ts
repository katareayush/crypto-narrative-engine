import { SOURCE_WEIGHTS } from "../config/narratives.ts";
import { detectNarrative } from "./narrativeDetection.ts";
import { scoreNarrative } from "./narrativeDetection.ts";
import { calculateMomentumBonus, getRecencyMultiplier, generateWhyNow } from "./narrativeScoring.ts";
import type { ScoredSignal, ProcessedNarrative } from "../types/narrative.ts";

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