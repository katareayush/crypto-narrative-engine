import { 
  NARRATIVE_DEFINITIONS, 
  SCORING_CONFIG,
  CONFIDENCE_THRESHOLDS 
} from "../config/narratives";
import type { NarrativeMatch, ScoredSignal, NarrativeScore } from "../types/narrative";

export function detectNarrative(text: string): NarrativeMatch | null {
  const lower = text.toLowerCase();
  let bestMatch: NarrativeMatch | null = null;
  let bestScore = 0;

  for (const [narrativeName, keywords] of Object.entries(NARRATIVE_DEFINITIONS)) {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of keywords.primary) {
      if (lower.includes(keyword)) {
        score += SCORING_CONFIG.PRIMARY_KEYWORD_WEIGHT;
        matchedKeywords.push(keyword);
      }
    }

    for (const keyword of keywords.secondary) {
      if (lower.includes(keyword)) {
        score += SCORING_CONFIG.SECONDARY_KEYWORD_WEIGHT;
        matchedKeywords.push(keyword);
      }
    }

    if (score > 0) {
      const maxPossible = keywords.primary.length * SCORING_CONFIG.PRIMARY_KEYWORD_WEIGHT + keywords.secondary.length * SCORING_CONFIG.SECONDARY_KEYWORD_WEIGHT;
      const strength = Math.min(1.0, score / maxPossible);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          narrative: narrativeName,
          strength,
          matchedKeywords
        };
      }
    }
  }

  return bestMatch && bestMatch.strength >= SCORING_CONFIG.MIN_KEYWORD_STRENGTH ? bestMatch : null;
}

export function scoreNarrative(scoredSignals: ScoredSignal[]): NarrativeScore {
  if (scoredSignals.length === 0) {
    return {
      baseScore: 0, momentumScore: 0, diversityScore: 0, 
      penaltyScore: 0, finalScore: 0, confidence: 'weak',
      explanation: 'No signals found'
    };
  }

  const baseScore = scoredSignals.reduce((sum, item) => {
    return sum + (item.match.strength * item.sourceWeight * item.recencyMultiplier);
  }, 0);

  const momentumScore = scoredSignals.reduce((sum, item) => {
    return sum + item.momentumBonus;
  }, 0);

  const sources = new Set(scoredSignals.map(s => s.signal.source));
  const diversityMultiplier = Math.min(SCORING_CONFIG.MAX_DIVERSITY_MULTIPLIER, sources.size * 0.5);
  const diversityScore = baseScore * diversityMultiplier;

  let penaltyScore = 0;
  
  if (sources.size === 1) {
    penaltyScore += baseScore * SCORING_CONFIG.SINGLE_SOURCE_PENALTY;
  }
  
  const avgStrength = scoredSignals.reduce((sum, s) => sum + s.match.strength, 0) / scoredSignals.length;
  if (avgStrength < SCORING_CONFIG.WEAK_KEYWORD_THRESHOLD) {
    penaltyScore += baseScore * SCORING_CONFIG.WEAK_KEYWORD_PENALTY;
  }

  const finalScore = Math.max(0, baseScore + momentumScore + diversityScore - penaltyScore);

  let confidence: 'strong' | 'emerging' | 'weak' = 'weak';
  if (finalScore > CONFIDENCE_THRESHOLDS.STRONG_SCORE && sources.size >= CONFIDENCE_THRESHOLDS.STRONG_SOURCES && avgStrength > CONFIDENCE_THRESHOLDS.STRONG_STRENGTH) {
    confidence = 'strong';
  } else if (finalScore > CONFIDENCE_THRESHOLDS.EMERGING_SCORE && sources.size >= CONFIDENCE_THRESHOLDS.EMERGING_SOURCES) {
    confidence = 'emerging';
  }

  const explanation = [
    `Base: ${baseScore.toFixed(1)} (keyword×source×recency)`,
    `Momentum: ${momentumScore.toFixed(1)} (recent spikes)`,
    `Diversity: ${diversityScore.toFixed(1)} (${sources.size} sources)`,
    penaltyScore > 0 ? `Penalty: -${penaltyScore.toFixed(1)}` : null,
  ].filter(Boolean).join(', ');

  return {
    baseScore: Number(baseScore.toFixed(2)),
    momentumScore: Number(momentumScore.toFixed(2)),
    diversityScore: Number(diversityScore.toFixed(2)),
    penaltyScore: Number(penaltyScore.toFixed(2)),
    finalScore: Number(finalScore.toFixed(2)),
    confidence,
    explanation,
  };
}