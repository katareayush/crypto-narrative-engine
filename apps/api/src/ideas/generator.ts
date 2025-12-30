import type { ProcessedNarrative } from "../../../../shared/types/narrative.js";
import type { RankedAppIdea } from "../../../../shared/types/appIdea.js";
import { NARRATIVE_APP_PATTERNS, DEFAULT_PATTERNS } from "./patterns.js";

interface ConfidenceMultiplier {
  strong: number;
  emerging: number;
  weak: number;
}

const CONFIDENCE_MULTIPLIERS: ConfidenceMultiplier = {
  strong: 1.0,    // Full score weight
  emerging: 0.8,  // Slight reduction
  weak: 0.6       // Moderate reduction
};

export function generateAppIdeas(narratives: ProcessedNarrative[]): RankedAppIdea[] {
  const rankedIdeas: RankedAppIdea[] = [];

  for (const narrative of narratives) {
    const patterns = NARRATIVE_APP_PATTERNS[narrative.narrative_name] || DEFAULT_PATTERNS;
    
    for (const pattern of patterns) {
      const baseRankScore = narrative.score * CONFIDENCE_MULTIPLIERS[narrative.confidence];
      
      const rankedIdea: RankedAppIdea = {
        ...pattern.template,
        narrative_name: narrative.narrative_name,
        narrative_confidence: narrative.confidence,
        narrative_score: narrative.score,
        rank_score: Math.round(baseRankScore * 100) / 100
      };

      rankedIdeas.push(rankedIdea);
    }
  }

  return rankedIdeas.sort((a, b) => b.rank_score - a.rank_score);
}

export function generateAppIdeasFromNarrativeNames(narrativeNames: string[]): RankedAppIdea[] {
  const syntheticNarratives: ProcessedNarrative[] = narrativeNames.map((name, index) => ({
    narrative_name: name,
    score: 10 - index,
    confidence: 'emerging' as const,
    why_now: `${name} is showing increased activity`,
    evidence: []
  }));

  return generateAppIdeas(syntheticNarratives);
}