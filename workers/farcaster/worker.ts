import fetch from "node-fetch";
import { upsertSignal } from "../../shared/db/insertSignal.ts";
import type { Signal } from "../../shared/types/signal.ts";

const HUB_URL = "https://hub.pinata.cloud";

const KEYWORDS = [
  "ai",
  "agent",
  "agents",
  "defi",
  "restaking",
  "rollup",
  "layer 2",
  "l2",
  "farcaster",
];

function containsKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.some((k) => lower.includes(k));
}

async function fetchRecentCasts() {
  // Popular FIDs to fetch recent casts from
  const popularFids = [2, 3, 5, 602, 1048, 3621, 6023];
  const allCasts: any[] = [];

  for (const fid of popularFids) {
    try {
      const res = await fetch(`${HUB_URL}/v1/castsByFid?fid=${fid}&pageSize=10&reverse=true`);
      
      if (!res.ok) {
        console.warn(`Failed to fetch casts for FID ${fid}: ${res.status}`);
        continue;
      }

      const data = await res.json() as any;
      const casts = data.messages ?? [];
      allCasts.push(...casts);
    } catch (error) {
      console.warn(`Error fetching casts for FID ${fid}:`, error);
    }
  }

  return allCasts;
}

async function run() {
  console.log("Fetching Farcaster casts from Hubble...");

  const casts = await fetchRecentCasts();
  let inserted = 0;

  for (const cast of casts) {
    const text = cast.data?.castAddBody?.text;
    if (!text || !containsKeyword(text)) continue;

    const fid = cast.data?.fid;
    const hash = cast.hash;

    const signal: Signal = {
      source: "farcaster",
      externalId: hash,
      text,
      url: `https://warpcast.com/${fid}/${hash}`,
      timestamp: new Date(Number(cast.data?.timestamp || Date.now() / 1000) * 1000),
      tags: [],
      rawMetadata: cast,
    };

    await upsertSignal(signal);
    inserted++;
  }

  console.log(`Inserted ${inserted} Farcaster signals`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
