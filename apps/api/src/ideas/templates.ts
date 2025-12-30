import type { AppIdea, TemplateSpec, AppIdeaWithTemplate } from "../../../../shared/types/appIdea.js";

const MODULE_MAPPINGS: Record<string, string[]> = {
  "wallet-connect": ["wallet-connect", "web3-provider"],
  "tx-simulator": ["indexer", "rpc-client"],
  "ui-kit": ["ui-kit", "react-components"],
  "indexer": ["indexer", "db"],
  "chart-lib": ["chart-lib", "data-viz"],
  "bridge-api": ["bridge-api", "cross-chain"],
  "notification": ["notification", "push-service"],
  "strategy-builder": ["visual-builder", "strategy-engine"],
  "backtesting": ["backtesting", "data-engine"],
  "marketplace": ["marketplace", "payment"],
  "agent-runtime": ["agent-runtime", "ai-engine"],
  "ai-agent": ["ai-agent", "decision-engine"],
  "defi-protocols": ["defi-protocols", "yield-tracker"],
  "pool-analytics": ["pool-analytics", "liquidity-math"],
  "rebalancer": ["rebalancer", "transaction-builder"],
  "staking-api": ["staking-api", "validator-client"],
  "analytics": ["analytics", "metrics"],
  "risk-analytics": ["risk-analytics", "scoring-engine"],
  "frame-builder": ["frame-builder", "visual-editor"],
  "farcaster-api": ["farcaster-api", "social-protocol"]
};

const ENV_VAR_MAPPINGS: Record<string, string[]> = {
  "wallet-connect": ["WALLET_CONNECT_PROJECT_ID"],
  "indexer": ["RPC_URL", "INDEXER_URL"],
  "rpc-client": ["RPC_URL", "CHAIN_IDS"],
  "bridge-api": ["BRIDGE_API_KEY", "SUPPORTED_CHAINS"],
  "notification": ["PUSH_SERVICE_KEY", "WEBHOOK_URL"],
  "ai-engine": ["AI_MODEL_URL", "AI_API_KEY"],
  "defi-protocols": ["PROTOCOL_APIS", "RPC_URLS"],
  "staking-api": ["BEACON_NODE_URL", "VALIDATOR_KEYS"],
  "farcaster-api": ["FARCASTER_API_KEY", "HUB_URL"],
  "payment": ["STRIPE_KEY", "PAYMENT_WEBHOOK"]
};

function generateRoutesFromUserFlow(userFlow: string[]): string[] {
  const routes = ["/"];
  
  const routeKeywords: Record<string, string> = {
    "connect": "/connect",
    "wallet": "/wallet",
    "simulate": "/simulate",
    "compare": "/compare", 
    "execute": "/execute",
    "browse": "/browse",
    "view": "/dashboard",
    "track": "/tracking",
    "monitor": "/monitoring",
    "analyze": "/analytics",
    "design": "/builder",
    "deploy": "/deploy",
    "test": "/testing",
    "subscribe": "/subscription",
    "manage": "/management"
  };

  for (const step of userFlow) {
    const stepLower = step.toLowerCase();
    for (const [keyword, route] of Object.entries(routeKeywords)) {
      if (stepLower.includes(keyword) && !routes.includes(route)) {
        routes.push(route);
      }
    }
  }

  return routes;
}

function inferDataModels(appTitle: string, userFlow: string[]): string[] {
  const models: string[] = ["User"];
  
  const modelMappings: Record<string, string> = {
    "transaction": "Transaction",
    "simulate": "TransactionSimulation", 
    "bridge": "BridgeTransaction",
    "gas": "GasFee",
    "price": "PriceData",
    "pool": "LiquidityPool",
    "yield": "YieldStrategy",
    "portfolio": "Portfolio",
    "position": "Position",
    "strategy": "TradingStrategy",
    "agent": "Agent",
    "bot": "Bot",
    "operator": "Operator",
    "validator": "Validator",
    "frame": "Frame",
    "tip": "Tip",
    "notification": "Notification",
    "alert": "Alert",
    "report": "Report"
  };

  const fullText = `${appTitle} ${userFlow.join(" ")}`.toLowerCase();
  
  for (const [keyword, model] of Object.entries(modelMappings)) {
    if (fullText.includes(keyword) && !models.includes(model)) {
      models.push(model);
    }
  }

  return models;
}


export function generateTemplateSpec(appIdea: AppIdea): TemplateSpec {
  const modules: string[] = [];
  const envVars: string[] = [];

  for (const hint of appIdea.minidev_template_hint) {
    const mappedModules = MODULE_MAPPINGS[hint] || [hint];
    modules.push(...mappedModules);

    const mappedEnvVars = ENV_VAR_MAPPINGS[hint] || [];
    envVars.push(...mappedEnvVars);
  }

  const routes = generateRoutesFromUserFlow(appIdea.core_user_flow);
  const dataModels = inferDataModels(appIdea.idea_title, appIdea.core_user_flow);

  return {
    template_name: appIdea.idea_title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
    modules: [...new Set(modules)],
    env_vars: [...new Set(envVars)], 
    routes: [...new Set(routes)],
    data_models: [...new Set(dataModels)]
  };
}

export function generateAppIdeaWithTemplate(appIdea: AppIdea, narrativeData: {
  narrative_name: string;
  narrative_confidence: 'strong' | 'emerging' | 'weak';
  narrative_score: number;
  rank_score: number;
}): AppIdeaWithTemplate {
  return {
    ...appIdea,
    ...narrativeData,
    template_spec: generateTemplateSpec(appIdea)
  };
}