import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { upsertSignal } from "../../shared/db/insertSignal";
import type { Signal } from "../../shared/types/signal";

const DUNE_API_KEY = process.env.DUNE_API_KEY;
if (!DUNE_API_KEY) {
  throw new Error("DUNE_API_KEY is missing");
}

const QUERY_ID = 6434209;

const DUNE_API_BASE = "https://api.dune.com/api/v1";

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, `dune_${QUERY_ID}.json`);

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

function isCacheFresh(hours = 6): boolean {
  if (!fs.existsSync(CACHE_FILE)) return false;
  const ageMs = Date.now() - fs.statSync(CACHE_FILE).mtimeMs;
  return ageMs < hours * 60 * 60 * 1000;
}

async function fetchQueryResult() {
  const res = await fetch(
    `${DUNE_API_BASE}/query/${QUERY_ID}/results`,
    {
      headers: {
        "x-dune-api-key": DUNE_API_KEY!,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dune API error ${res.status}: ${text}`);
  }

  return res.json();
}

async function run() {
  console.log("Fetching Dune query result...");

  let data;

  if (isCacheFresh()) {
    console.log("→ Using cached result");
    data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } else {
    console.log("→ Fetching fresh result from Dune");
    data = await fetchQueryResult();
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
  }

  const signal: Signal = {
    source: "dune",
    externalId: String(QUERY_ID),
    title: "Layer-2 Activity Trend (30d)",
    text:
      "On-chain Layer-2 activity based on transactions and active addresses over the last 30 days.",
    url: `https://dune.com/queries/${QUERY_ID}`,
    timestamp: new Date(),
    tags: ["l2", "layer2", "onchain", "scaling"],
    rawMetadata: data,
  };

  await upsertSignal(signal);

  console.log("Inserted Dune signal");
  process.exit(0);
}

run().catch((err) => {
  console.error("Dune worker failed:", err);
  process.exit(1);
});
