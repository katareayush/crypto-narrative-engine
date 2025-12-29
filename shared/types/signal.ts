export type SignalSource = "farcaster" | "github" | "rss" | "dune";

export interface Signal {
  source: SignalSource;
  externalId: string;

  title?: string;
  text: string;
  url?: string;

  timestamp: Date;
  tags: string[];

  rawMetadata: any;
}
