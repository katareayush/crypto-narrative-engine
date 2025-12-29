export interface NarrativeMatch {
  narrative: string;
  strength: number;
  matchedKeywords: string[];
}

export interface ScoredSignal {
  signal: any;
  match: NarrativeMatch;
  sourceWeight: number;
  recencyMultiplier: number;
  momentumBonus: number;
}

export interface NarrativeScore {
  baseScore: number;
  momentumScore: number;
  diversityScore: number;
  penaltyScore: number;
  finalScore: number;
  confidence: 'strong' | 'emerging' | 'weak';
  explanation: string;
}

export interface ProcessedNarrative {
  narrative_name: string;
  score: number;
  confidence: 'strong' | 'emerging' | 'weak';
  why_now: string;
  evidence: Array<{ source: string; url: string }>;
}