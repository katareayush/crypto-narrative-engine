import fetch from "node-fetch";
import { upsertSignal } from "../../shared/db/insertSignal";
import type { Signal } from "../../shared/types/signal";

const GITHUB_API = "https://api.github.com";

const TOPICS = [
  "farcaster",
  "web3",
  "defi",
  "ai-agent",
  "zk",
  "restaking",
];

async function fetchReposByTopic(topic: string) {
  const url = `${GITHUB_API}/search/repositories?q=topic:${topic}&sort=updated&order=desc&per_page=10`;

  const res = await fetch(url, {
    headers: {
      "accept": "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub error ${res.status}: ${text}`);
  }

  const data = await res.json() as any;
  return data.items ?? [];
}

async function run() {
  console.log("Fetching GitHub repositories...");

  let inserted = 0;

  for (const topic of TOPICS) {
    const repos = await fetchReposByTopic(topic);

    for (const repo of repos) {
      if (!repo.description) continue;

      const signal: Signal = {
        source: "github",
        externalId: String(repo.id),
        title: repo.name,
        text: repo.description,
        url: repo.html_url,
        timestamp: new Date(repo.pushed_at),
        tags: repo.topics || [topic],
        rawMetadata: repo,
      };

      await upsertSignal(signal);
      inserted++;
    }
  }

  console.log(`Inserted ${inserted} GitHub signals`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
