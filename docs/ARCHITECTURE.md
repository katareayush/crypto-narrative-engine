# Architecture Documentation

## System Overview

The Crypto Narrative Engine is a real-time signal processing system that ingests data from multiple crypto-related sources, detects emerging narratives, and generates actionable app ideas for development.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Sources  │    │   Ingestion     │    │   Processing    │
│                 │    │                 │    │                 │
│ • Farcaster     │───▶│ • Workers       │───▶│ • Narrative     │
│ • Dune          │    │ • Normalization │    │   Detection     │
│ • GitHub        │    │ • Validation    │    │ • Scoring       │
│ • RSS Feeds     │    │                 │    │ • App Ideas     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   Database      │    │   API Layer     │
                    │                 │    │                 │
                    │ • Signals       │    │ • REST Endpoints│
                    │ • Narratives    │    │ • Response      │
                    │ • Metadata      │    │   Formatting    │
                    └─────────────────┘    └─────────────────┘
```

## Components

### 1. Data Ingestion Layer

**Workers** (`/workers/`)
- Independent processes that fetch data from external sources
- Normalize data into common `Signal` schema
- Handle rate limiting and error recovery
- Run on scheduled intervals

**Sources:**
- **Farcaster**: Recent casts from crypto accounts via Hubble API
- **Dune**: On-chain metrics via query results API
- **GitHub**: Repository activity for crypto topics
- **RSS**: Research posts from crypto funds/analysts

### 2. Data Storage Layer

**Database Schema** (`/shared/db/schema.ts`)
```sql
signals (
  id: UUID PRIMARY KEY,
  source: TEXT NOT NULL,
  external_id: TEXT NOT NULL,
  title: TEXT,
  text: TEXT NOT NULL,
  url: TEXT,
  timestamp: TIMESTAMP WITH TIME ZONE,
  tags: TEXT[],
  raw_metadata: JSONB,
  UNIQUE(source, external_id)
)

narratives (
  id: SERIAL PRIMARY KEY,
  narrative_name: TEXT NOT NULL UNIQUE,
  score: DOUBLE PRECISION NOT NULL,
  confidence: TEXT NOT NULL,
  why_now: TEXT NOT NULL,
  evidence: JSONB NOT NULL
)
```

### 3. Processing Layer

**Narrative Detection** (`/shared/services/narrativeDetection.ts`)
- Keyword-based classification with configurable weights
- Supports primary/secondary keyword matching
- Calculates strength scores and confidence levels

**Narrative Scoring** (`/shared/services/narrativeScoring.ts`)
- Multi-factor scoring algorithm:
  - Base score: keyword strength × source weight × recency
  - Momentum bonus: recent activity spikes
  - Diversity multiplier: multiple source validation
  - Penalties: single source, weak keywords

**App Idea Generation** (`/apps/api/src/ideas/`)
- Generates 3-5 app concepts per narrative
- Includes target users, core flows, technical requirements
- Produces minidev template specifications

### 4. API Layer

**REST Endpoints** (`/apps/api/src/`)
- `GET /health` - System health check
- `GET /narratives` - Ranked list of current narratives
- `GET /narratives/:id` - Detailed narrative with evidence
- `GET /ideas` - Generated app ideas with templates
- `GET /ideas/:id` - Specific app idea details

## Data Flow

1. **Ingestion**: Workers fetch data every 2-60 minutes
2. **Normalization**: External data → `Signal` objects → Database
3. **Processing**: Periodic narrative detection on accumulated signals
4. **Scoring**: Calculate narrative relevance and confidence
5. **Generation**: Create app ideas from top narratives
6. **Serving**: API endpoints provide formatted results

## Deployment Architecture (Render Free Tier)

```
┌─────────────────────────────────────┐
│         Single Node.js Process     │
│                                     │
│  ┌─────────────┐ ┌─────────────────┐│
│  │   Express   │ │   Job Scheduler ││
│  │   Server    │ │                 ││
│  │             │ │ • Workers       ││
│  │ • Routes    │ │ • Intervals     ││
│  │ • Middleware│ │ • Error Handling││
│  └─────────────┘ └─────────────────┘│
└─────────────────────────────────────┘
              │
              ▼
    ┌─────────────────┐
    │ PostgreSQL      │
    │ (Free Tier)     │
    │ • 1GB Storage   │
    │ • 30-day expiry │
    └─────────────────┘
```

**Constraints & Adaptations:**
- **Spin-down**: 15 min inactivity → cold starts
- **Storage**: 1GB limit → aggressive data retention
- **Memory**: Single process → combined workers + API
- **Scaling**: No horizontal scaling → optimized algorithms

## Configuration

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection
- `DUNE_API_KEY`: Dune Analytics API key

**Narrative Detection Config** (`/shared/config/narratives.ts`)
- Keyword definitions for each narrative
- Scoring weights and thresholds
- Confidence level criteria

## Error Handling & Resilience

- **Worker Failures**: Continue with other sources
- **API Rate Limits**: Exponential backoff, caching
- **Database Issues**: Connection pooling, retry logic
- **Cold Starts**: Optimized initialization order

## Performance Considerations

- **Data Retention**: 7-day signal cleanup for storage limits
- **Caching**: In-memory for frequently accessed data
- **Indexing**: Optimized queries on timestamp/source fields
- **Batch Processing**: Minimize database round trips