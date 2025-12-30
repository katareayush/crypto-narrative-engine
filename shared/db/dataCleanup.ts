import { db } from './client.ts';
import { signals, narratives } from './schema.ts';
import { lt, eq, desc, and } from 'drizzle-orm';

const SIGNAL_RETENTION_DAYS = 7;
const NARRATIVE_RETENTION_DAYS = 14;
const MAX_SIGNALS_PER_SOURCE = 1000;

export async function cleanupOldData(): Promise<void> {
  
  const signalCutoffDate = new Date(Date.now() - SIGNAL_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  
  const deletedSignalsResult = await db
    .delete(signals)
    .where(lt(signals.timestamp, signalCutoffDate));
  
  
  const narrativeCutoffDate = new Date(Date.now() - NARRATIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  
  const deletedNarrativesResult = await db
    .delete(narratives)
    .where(lt(narratives.created_at, narrativeCutoffDate));
  
  
  await cleanupExcessSignalsPerSource();
  
}

async function cleanupExcessSignalsPerSource(): Promise<void> {
  const sources = ['farcaster', 'rss', 'github', 'dune'];
  
  for (const source of sources) {
    const sourceSignals = await db
      .select()
      .from(signals)
      .where(eq(signals.source, source))
      .orderBy(desc(signals.timestamp))
      .limit(MAX_SIGNALS_PER_SOURCE + 100);
    
    if (sourceSignals.length > MAX_SIGNALS_PER_SOURCE) {
      const signalsToKeep = sourceSignals.slice(0, MAX_SIGNALS_PER_SOURCE);
      const oldestKeptTimestamp = signalsToKeep[signalsToKeep.length - 1].timestamp;
      
      await db
        .delete(signals)
        .where(
          and(
            eq(signals.source, source),
            lt(signals.timestamp, oldestKeptTimestamp)
          )
        );
      
    }
  }
}