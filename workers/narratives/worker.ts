import { db } from "../../shared/db/client.js";
import { signals } from "../../shared/db/schema.js";
import { desc, gt } from "drizzle-orm";
import { processSignalsIntoNarratives } from "../../shared/services/narrativeProcessor.js";
import { upsertNarratives, type NarrativeData } from "../../shared/db/upsertNarrative.js";

const MAX_NARRATIVES_TO_PERSIST = 10;

async function run() {
  console.log("Running narrative detection worker...");

  const since = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const recentSignals = await db
    .select()
    .from(signals)
    .where(gt(signals.timestamp, since))
    .orderBy(desc(signals.timestamp));

  const processedNarratives = processSignalsIntoNarratives(recentSignals);
  const topNarratives = processedNarratives.slice(0, MAX_NARRATIVES_TO_PERSIST);
  
  if (topNarratives.length > 0) {
    const narrativesToPersist: NarrativeData[] = topNarratives.map(n => ({
      narrative_name: n.narrative_name,
      score: n.score,
      confidence: n.confidence,
      why_now: n.why_now,
      evidence: n.evidence,
    }));

    await upsertNarratives(narrativesToPersist);
    console.log(`Persisted ${topNarratives.length} narratives to database`);
  } else {
    console.log("No narratives met quality threshold");
  }

  console.log("\nTop narratives detected:");
  topNarratives.forEach((narrative, i) => {
    console.log(`${i + 1}. ${narrative.narrative_name} (${narrative.confidence}) - Score: ${narrative.score}`);
  });

  process.exit(0);
}

run().catch((err) => {
  console.error("Narrative worker failed:", err);
  process.exit(1);
});