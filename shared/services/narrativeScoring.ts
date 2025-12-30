import { SCORING_CONFIG } from "../config/narratives.js";
import type { ScoredSignal, NarrativeScore } from "../types/narrative.js";

export function calculateMomentumBonus(signals: any[], timeWindow: number = 6): number {
  const now = Date.now();
  const windowMs = timeWindow * 60 * 60 * 1000;
  
  const recentCount = signals.filter(s => 
    (now - new Date(s.timestamp).getTime()) <= windowMs
  ).length;
  
  const olderCount = signals.filter(s => 
    (now - new Date(s.timestamp).getTime()) > windowMs
  ).length;

  if (recentCount > olderCount * SCORING_CONFIG.MOMENTUM_THRESHOLD && recentCount >= SCORING_CONFIG.MIN_MOMENTUM_SIGNALS) {
    return recentCount * SCORING_CONFIG.MOMENTUM_MULTIPLIER;
  }
  
  return 0;
}

export function getRecencyMultiplier(timestamp: Date): number {
  const hoursAgo = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
  
  if (hoursAgo <= 6) return 1.0;
  if (hoursAgo <= 12) return 0.8;
  if (hoursAgo <= 24) return 0.6;
  if (hoursAgo <= 48) return 0.4;
  return 0.2;
}

export function generateWhyNow(
  narrative: string, 
  scoredSignals: ScoredSignal[], 
  narrativeScore: NarrativeScore
): string {
  const sources = Array.from(new Set(scoredSignals.map(s => s.signal.source)));
  const hasRecentSpike = narrativeScore.momentumScore > 0;
  
  const recentSignals = scoredSignals.filter(s => s.recencyMultiplier >= 0.8);
  const keywordFreq = new Map<string, number>();
  
  recentSignals.forEach(s => {
    s.match.matchedKeywords.forEach(keyword => {
      keywordFreq.set(keyword, (keywordFreq.get(keyword) || 0) + 1);
    });
  });
  
  const topKeywords = Array.from(keywordFreq.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([keyword]) => keyword);

  const components: string[] = [];
  
  if (hasRecentSpike) {
    const recentCount = recentSignals.length;
    if (recentCount >= 3) {
      components.push(`${recentCount} new developments emerged in the past 12 hours`);
    } else {
      components.push(`notable activity spike detected in recent hours`);
    }
  } else {
    components.push(`sustained discussion continuing`);
  }

  if (topKeywords.length > 0) {
    const keywordText = topKeywords.length === 1 
      ? `around ${topKeywords[0]}` 
      : `focusing on ${topKeywords.join(' and ')}`;
    components.push(keywordText);
  }

  const sourceDescriptions: Record<string, string> = {
    dune: 'on-chain data',
    rss: 'news coverage', 
    github: 'developer activity',
    farcaster: 'social discussion'
  };
  
  const sourceTexts = sources.map(s => sourceDescriptions[s] || s);
  
  if (sources.length >= 3) {
    components.push(`confirmed across ${sourceTexts.join(', ')}`);
  } else if (sources.length === 2) {
    components.push(`validated by both ${sourceTexts.join(' and ')}`);
  } else {
    components.push(`primarily from ${sourceTexts[0]} signals`);
  }

  const confidenceText = narrativeScore.confidence === 'strong' 
    ? 'Strong signal:' 
    : narrativeScore.confidence === 'emerging'
    ? 'Emerging pattern:'
    : 'Weak signal:';

  return `${confidenceText} ${components.join(', ')}.`;
}