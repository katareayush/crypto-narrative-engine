import type { AppIdea } from "../../../../shared/types/appIdea";

export interface AppPattern {
  pattern_id: string;
  template: AppIdea;
}

export const NARRATIVE_APP_PATTERNS: Record<string, AppPattern[]> = {
  "Layer 2 Scaling": [
    {
      pattern_id: "l2_cost_optimizer",
      template: {
        idea_title: "L2 Cost Optimizer",
        one_liner: "Automatically routes transactions to the cheapest Layer 2 network.",
        target_user: "DeFi power users",
        core_user_flow: [
          "Connect wallet",
          "Simulate transaction across L2s",
          "Select optimal chain",
          "Execute transaction"
        ],
        minidev_template_hint: ["wallet-connect", "tx-simulator", "ui-kit"]
      }
    },
    {
      pattern_id: "l2_analytics_dashboard",
      template: {
        idea_title: "L2 Analytics Dashboard",
        one_liner: "Real-time metrics and comparison tool for Layer 2 networks.",
        target_user: "Crypto analysts and researchers",
        core_user_flow: [
          "Browse L2 metrics overview",
          "Select networks to compare",
          "View detailed analytics",
          "Export data reports"
        ],
        minidev_template_hint: ["indexer", "chart-lib", "ui-kit"]
      }
    },
    {
      pattern_id: "l2_bridge_aggregator",
      template: {
        idea_title: "L2 Bridge Aggregator",
        one_liner: "One interface to bridge assets across all major Layer 2 networks.",
        target_user: "Multi-chain DeFi users",
        core_user_flow: [
          "Connect wallet",
          "Select source and destination chains",
          "Compare bridge options and fees",
          "Execute bridge transaction"
        ],
        minidev_template_hint: ["wallet-connect", "bridge-api", "ui-kit"]
      }
    },
    {
      pattern_id: "gas_tracker",
      template: {
        idea_title: "Gas Fee Tracker",
        one_liner: "Track and predict gas fees across Ethereum and Layer 2s.",
        target_user: "DeFi traders",
        core_user_flow: [
          "View current gas prices",
          "Set price alerts",
          "Check fee predictions",
          "Receive notifications"
        ],
        minidev_template_hint: ["indexer", "notification", "ui-kit"]
      }
    }
  ],

  "AI Agents": [
    {
      pattern_id: "ai_trading_bot",
      template: {
        idea_title: "AI Trading Bot Builder",
        one_liner: "No-code platform to create and deploy automated trading strategies.",
        target_user: "Retail crypto traders",
        core_user_flow: [
          "Design strategy with visual blocks",
          "Backtest on historical data",
          "Deploy bot to testnet",
          "Monitor live performance"
        ],
        minidev_template_hint: ["strategy-builder", "backtesting", "ui-kit"]
      }
    },
    {
      pattern_id: "agent_marketplace",
      template: {
        idea_title: "Agent Marketplace",
        one_liner: "Discover, rent, and deploy pre-built AI agents for crypto tasks.",
        target_user: "Crypto project teams",
        core_user_flow: [
          "Browse available agents",
          "Test agent capabilities",
          "Subscribe to agent",
          "Integrate via API"
        ],
        minidev_template_hint: ["marketplace", "agent-runtime", "ui-kit"]
      }
    },
    {
      pattern_id: "portfolio_assistant",
      template: {
        idea_title: "Portfolio AI Assistant",
        one_liner: "AI agent that manages your crypto portfolio automatically.",
        target_user: "Busy crypto investors",
        core_user_flow: [
          "Connect portfolio accounts",
          "Set investment preferences",
          "Review AI recommendations",
          "Approve automated actions"
        ],
        minidev_template_hint: ["wallet-connect", "ai-agent", "ui-kit"]
      }
    }
  ],

  "DeFi Revival": [
    {
      pattern_id: "yield_optimizer",
      template: {
        idea_title: "Yield Optimizer",
        one_liner: "Automatically moves funds to highest yielding DeFi protocols.",
        target_user: "Yield farmers",
        core_user_flow: [
          "Connect wallet",
          "Set risk preferences",
          "View yield opportunities",
          "Auto-compound rewards"
        ],
        minidev_template_hint: ["wallet-connect", "defi-protocols", "ui-kit"]
      }
    },
    {
      pattern_id: "defi_dashboard",
      template: {
        idea_title: "DeFi Portfolio Tracker",
        one_liner: "Comprehensive dashboard for tracking DeFi positions across protocols.",
        target_user: "Active DeFi users",
        core_user_flow: [
          "Connect multiple wallets",
          "View aggregated positions",
          "Track profit/loss",
          "Receive alerts"
        ],
        minidev_template_hint: ["wallet-connect", "indexer", "ui-kit"]
      }
    },
    {
      pattern_id: "liquidity_manager",
      template: {
        idea_title: "Liquidity Manager",
        one_liner: "Optimize liquidity provision across multiple AMM pools.",
        target_user: "Liquidity providers",
        core_user_flow: [
          "Analyze pool performance",
          "Simulate LP positions",
          "Rebalance across pools",
          "Monitor impermanent loss"
        ],
        minidev_template_hint: ["pool-analytics", "rebalancer", "ui-kit"]
      }
    }
  ],

  "Restaking": [
    {
      pattern_id: "restaking_dashboard",
      template: {
        idea_title: "Restaking Dashboard",
        one_liner: "Monitor and manage your restaking positions across protocols.",
        target_user: "Ethereum stakers",
        core_user_flow: [
          "Connect staking wallet",
          "View restaking opportunities",
          "Delegate to operators",
          "Track rewards"
        ],
        minidev_template_hint: ["wallet-connect", "staking-api", "ui-kit"]
      }
    },
    {
      pattern_id: "operator_explorer",
      template: {
        idea_title: "Operator Explorer",
        one_liner: "Research and compare restaking operators and their performance.",
        target_user: "Restaking participants",
        core_user_flow: [
          "Browse operator list",
          "Compare performance metrics",
          "Check operator history",
          "Make delegation decisions"
        ],
        minidev_template_hint: ["indexer", "analytics", "ui-kit"]
      }
    },
    {
      pattern_id: "avs_tracker",
      template: {
        idea_title: "AVS Tracker",
        one_liner: "Track Actively Validated Services and their yield opportunities.",
        target_user: "Institutional stakers",
        core_user_flow: [
          "Monitor AVS performance",
          "Assess risk metrics",
          "Optimize AVS allocation",
          "Generate reports"
        ],
        minidev_template_hint: ["indexer", "risk-analytics", "ui-kit"]
      }
    }
  ],

  "Farcaster Apps": [
    {
      pattern_id: "frame_builder",
      template: {
        idea_title: "Frame Builder",
        one_liner: "Visual editor to create interactive Farcaster Frames without coding.",
        target_user: "Content creators",
        core_user_flow: [
          "Design frame layout",
          "Add interactive elements",
          "Preview frame",
          "Deploy to Farcaster"
        ],
        minidev_template_hint: ["frame-builder", "farcaster-api", "ui-kit"]
      }
    },
    {
      pattern_id: "social_analytics",
      template: {
        idea_title: "Farcaster Analytics",
        one_liner: "Analytics dashboard for Farcaster creators and communities.",
        target_user: "Farcaster creators",
        core_user_flow: [
          "Connect Farcaster account",
          "View engagement metrics",
          "Analyze follower growth",
          "Export insights"
        ],
        minidev_template_hint: ["farcaster-api", "analytics", "ui-kit"]
      }
    },
    {
      pattern_id: "tipping_bot",
      template: {
        idea_title: "Crypto Tipping Bot",
        one_liner: "Seamlessly tip creators with crypto directly in Farcaster.",
        target_user: "Crypto enthusiasts",
        core_user_flow: [
          "Connect wallet and Farcaster",
          "Browse tippable content",
          "Send crypto tips",
          "Track tip history"
        ],
        minidev_template_hint: ["wallet-connect", "farcaster-api", "ui-kit"]
      }
    }
  ]
};

export const DEFAULT_PATTERNS: AppPattern[] = [
  {
    pattern_id: "generic_tracker",
    template: {
      idea_title: "Trend Tracker",
      one_liner: "Monitor and analyze emerging trends in the crypto space.",
      target_user: "Crypto researchers",
      core_user_flow: [
        "Browse trending topics",
        "Set up alerts",
        "Analyze trend data",
        "Share insights"
      ],
      minidev_template_hint: ["indexer", "analytics", "ui-kit"]
    }
  }
];