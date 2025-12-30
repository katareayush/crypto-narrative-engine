import Parser from "rss-parser";
import { upsertSignal } from "../../shared/db/insertSignal.js";
import type { Signal } from "../../shared/types/signal.js";

const parser = new Parser({
  timeout: 10000,
});

const FEEDS = [
  "https://electriccapital.substack.com/feed",
  "https://a16zcrypto.substack.com/feed",
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("Fetching RSS feeds...");

  let inserted = 0;

  for (const feedUrl of FEEDS) {
    try {
      console.log(`→ Fetching feed: ${feedUrl}`);

      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        const signal: Signal = {
          source: "rss",
          externalId: item.link,
          title: item.title,
          text:
            item.contentSnippet ||
            item.content ||
            item.summary ||
            "",
          url: item.link,
          timestamp: item.pubDate
            ? new Date(item.pubDate)
            : new Date(),
          tags: [],
          rawMetadata: item,
        };

        await upsertSignal(signal);
        inserted++;
      }
    } catch (err: any) {
      if (err?.message?.includes("429")) {
        console.warn(`⚠️  Rate limited on feed: ${feedUrl}, skipping`);
      } else {
        console.warn(
          `⚠️  Failed to fetch feed: ${feedUrl}`,
          err?.message || err
        );
      }
    }

    await sleep(3000);
  }

  console.log(`Inserted ${inserted} RSS signals`);
  process.exit(0);
}

run().catch((err) => {
  console.error("RSS worker crashed:", err);
  process.exit(1);
});
