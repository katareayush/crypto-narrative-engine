import { db } from "./client";
import { signals } from "./schema";

async function run() {
  await db.insert(signals).values({
    source: "test",
    externalId: "test-1",
    title: "Test signal",
    text: "testing db connection",
    url: "https://www.katareayush.com",
    timestamp: new Date(),
    tags: ["test"],
    rawMetadata: { ok: true },
  });

  console.log("Fake signal inserted");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
