import cron from 'node-cron';
import fetch from 'node-fetch';
import Parser from 'rss-parser';
import { upsertSignal } from '../db/insertSignal.js';
import { processNarratives } from '../services/narrativeProcessor.js';
import { cleanupOldData } from '../db/dataCleanup.js';
import type { Signal } from '../types/signal.js';

let isJobRunning = false;
const jobStatus = {
  farcaster: { lastRun: null as Date | null, status: 'idle' as 'idle' | 'running' | 'error' },
  rss: { lastRun: null as Date | null, status: 'idle' as 'idle' | 'running' | 'error' },
  github: { lastRun: null as Date | null, status: 'idle' as 'idle' | 'running' | 'error' },
  dune: { lastRun: null as Date | null, status: 'idle' as 'idle' | 'running' | 'error' },
  narratives: { lastRun: null as Date | null, status: 'idle' as 'idle' | 'running' | 'error' },
  cleanup: { lastRun: null as Date | null, status: 'idle' as 'idle' | 'running' | 'error' }
};

const HUB_URL = "https://hub.pinata.cloud";
const DUNE_API_KEY = process.env.DUNE_API_KEY;
const GITHUB_API = "https://api.github.com";
const DUNE_QUERY_ID = 6434209;

// Farcaster worker logic
async function runFarcasterWorker() {
  if (jobStatus.farcaster.status === 'running') return;
  
  jobStatus.farcaster.status = 'running';
  
  try {
    const keywords = ["ai", "agent", "agents", "defi", "restaking", "rollup", "layer 2", "l2", "farcaster"];
    const popularFids = [2, 3, 5, 602, 1048, 3621, 6023];
    let inserted = 0;

    function containsKeyword(text: string): boolean {
      const lower = text.toLowerCase();
      return keywords.some(k => lower.includes(k));
    }

    for (const fid of popularFids) {
      try {
        const res = await fetch(`${HUB_URL}/v1/castsByFid?fid=${fid}&pageSize=10&reverse=true`);
        if (!res.ok) continue;
        
        const data = await res.json() as any;
        const casts = data.messages ?? [];
        
        for (const cast of casts) {
          const text = cast.data?.castAddBody?.text;
          if (!text || !containsKeyword(text)) continue;

          const signal: Signal = {
            source: "farcaster",
            externalId: cast.hash,
            text,
            url: `https://warpcast.com/${fid}/${cast.hash}`,
            timestamp: new Date(Number(cast.data?.timestamp || Date.now() / 1000) * 1000),
            tags: [],
            rawMetadata: cast,
          };

          await upsertSignal(signal);
          inserted++;
        }
      } catch (error) {
        console.warn(`Error fetching casts for FID ${fid}:`, error);
      }
    }

    jobStatus.farcaster.status = 'idle';
    jobStatus.farcaster.lastRun = new Date();
  } catch (error) {
    console.error('[Jobs] Farcaster worker failed:', error);
    jobStatus.farcaster.status = 'error';
  }
}

// RSS worker logic
async function runRSSWorker() {
  if (jobStatus.rss.status === 'running') return;
  
  jobStatus.rss.status = 'running';
  
  try {
    const parser = new Parser({ timeout: 10000 });
    const feeds = [
      "https://electriccapital.substack.com/feed",
      "https://a16zcrypto.substack.com/feed"
    ];
    let inserted = 0;

    for (const feedUrl of feeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        for (const item of feed.items) {
          if (!item.link || !item.title) continue;

          const signal: Signal = {
            source: "rss",
            externalId: item.link,
            title: item.title,
            text: item.contentSnippet || item.content || item.summary || "",
            url: item.link,
            timestamp: item.pubDate ? new Date(item.pubDate) : new Date(),
            tags: [],
            rawMetadata: item,
          };

          await upsertSignal(signal);
          inserted++;
        }
      } catch (err: any) {
        console.warn(`Failed to fetch RSS feed: ${feedUrl}`, err?.message);
      }
    }

    jobStatus.rss.status = 'idle';
    jobStatus.rss.lastRun = new Date();
  } catch (error) {
    console.error('[Jobs] RSS worker failed:', error);
    jobStatus.rss.status = 'error';
  }
}

// GitHub worker logic
async function runGitHubWorker() {
  if (jobStatus.github.status === 'running') return;
  
  jobStatus.github.status = 'running';
  
  try {
    const topics = ["farcaster", "web3", "defi", "ai-agent", "zk", "restaking"];
    let inserted = 0;

    for (const topic of topics) {
      try {
        const url = `${GITHUB_API}/search/repositories?q=topic:${topic}&sort=updated&order=desc&per_page=10`;
        const res = await fetch(url, {
          headers: { "accept": "application/vnd.github+json" }
        });
        
        if (!res.ok) continue;
        
        const data = await res.json() as any;
        const repos = data.items ?? [];
        
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
      } catch (error) {
        console.warn(`Error fetching GitHub repos for topic ${topic}:`, error);
      }
    }

    jobStatus.github.status = 'idle';
    jobStatus.github.lastRun = new Date();
  } catch (error) {
    console.error('[Jobs] GitHub worker failed:', error);
    jobStatus.github.status = 'error';
  }
}

// Dune worker logic
async function runDuneWorker() {
  if (jobStatus.dune.status === 'running') return;
  
  jobStatus.dune.status = 'running';
  
  try {
    if (!DUNE_API_KEY) {
      jobStatus.dune.status = 'idle';
      return;
    }

    const res = await fetch(
      `https://api.dune.com/api/v1/query/${DUNE_QUERY_ID}/results`,
      {
        headers: { "x-dune-api-key": DUNE_API_KEY! }
      }
    );

    if (!res.ok) {
      jobStatus.dune.status = 'error';
      return;
    }

    const data = await res.json();
    const signal: Signal = {
      source: "dune",
      externalId: String(DUNE_QUERY_ID),
      title: "Layer-2 Activity Trend (30d)",
      text: "On-chain Layer-2 activity based on transactions and active addresses over the last 30 days.",
      url: `https://dune.com/queries/${DUNE_QUERY_ID}`,
      timestamp: new Date(),
      tags: ["l2", "layer2", "onchain", "scaling"],
      rawMetadata: data,
    };

    await upsertSignal(signal);
    jobStatus.dune.status = 'idle';
    jobStatus.dune.lastRun = new Date();
  } catch (error) {
    console.error('[Jobs] Dune worker failed:', error);
    jobStatus.dune.status = 'error';
  }
}

// Narrative processing worker
async function runNarrativeProcessor() {
  if (jobStatus.narratives.status === 'running') return;
  
  jobStatus.narratives.status = 'running';
  
  try {
    await processNarratives();
    jobStatus.narratives.status = 'idle';
    jobStatus.narratives.lastRun = new Date();
  } catch (error) {
    console.error('[Jobs] Narrative processor failed:', error);
    jobStatus.narratives.status = 'error';
  }
}

// Data cleanup worker
async function runDataCleanup() {
  if (jobStatus.cleanup.status === 'running') return;
  
  jobStatus.cleanup.status = 'running';
  
  try {
    await cleanupOldData();
    jobStatus.cleanup.status = 'idle';
    jobStatus.cleanup.lastRun = new Date();
  } catch (error) {
    console.error('[Jobs] Data cleanup failed:', error);
    jobStatus.cleanup.status = 'error';
  }
}

export function startJobScheduler() {
  
  setTimeout(() => {
    runFarcasterWorker().catch(console.error);
  }, 10000);
  
  // Schedule recurring jobs
  // Farcaster every 3 minutes
  cron.schedule('*/3 * * * *', runFarcasterWorker);
  
  // RSS every 45 minutes
  cron.schedule('*/45 * * * *', runRSSWorker);
  
  // GitHub every 35 minutes
  cron.schedule('*/35 * * * *', runGitHubWorker);
  
  // Dune every 6 hours
  cron.schedule('0 */6 * * *', runDuneWorker);
  
  // Narrative processing every 10 minutes
  cron.schedule('*/10 * * * *', runNarrativeProcessor);
  
  // Data cleanup every day at 2 AM
  cron.schedule('0 2 * * *', runDataCleanup);
  
}

export function getJobStatus() {
  return jobStatus;
}