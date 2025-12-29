
export interface NarrativeKeywords {
  primary: string[];
  secondary: string[];
}

export const SOURCE_WEIGHTS = {
  dune: 3.0,
  rss: 2.0,
  github: 1.5,
  farcaster: 1.0,
} as const;

export const NARRATIVE_DEFINITIONS: Record<string, NarrativeKeywords> = {
  "Layer 2 Scaling": {
    primary: ["layer 2", "l2", "rollup", "arbitrum", "optimism", "base"],
    secondary: ["scaling", "throughput", "gas fees", "transaction cost"],
  },
  "AI Agents": {
    primary: ["ai agent", "agents", "autonomous agent", "multi-agent"],
    secondary: ["automation", "llm", "chatbot", "artificial intelligence"],
  },
  "DeFi Revival": {
    primary: ["defi", "dex", "liquidity", "yield farming", "amm"],
    secondary: ["uniswap", "trading volume", "tvl", "protocol revenue"],
  },
  "Restaking": {
    primary: ["restaking", "eigenlayer", "avs", "actively validated"],
    secondary: ["staking yield", "validator", "ethereum staking"],
  },
  "Farcaster Apps": {
    primary: ["farcaster", "warpcast", "frames", "farcaster protocol"],
    secondary: ["social protocol", "decentralized social", "onchain social"],
  },
};

export const SCORING_CONFIG = {
  PRIMARY_KEYWORD_WEIGHT: 2.0,
  SECONDARY_KEYWORD_WEIGHT: 1.0,
  MIN_KEYWORD_STRENGTH: 0.1,
  MAX_DIVERSITY_MULTIPLIER: 2.0,
  SINGLE_SOURCE_PENALTY: 0.5,
  WEAK_KEYWORD_PENALTY: 0.3,
  WEAK_KEYWORD_THRESHOLD: 0.3,
  MOMENTUM_MULTIPLIER: 2.0,
  MOMENTUM_THRESHOLD: 1.5,
  MIN_MOMENTUM_SIGNALS: 2,
};

export const CONFIDENCE_THRESHOLDS = {
  STRONG_SCORE: 15,
  STRONG_SOURCES: 3,
  STRONG_STRENGTH: 0.4,
  EMERGING_SCORE: 8,
  EMERGING_SOURCES: 2,
};