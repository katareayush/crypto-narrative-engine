# Crypto Narrative Engine

A backend service that continuously ingests crypto signals from multiple sources, detects current narratives, and generates actionable app ideas for minidev templates.

## Features

- **Multi-source Ingestion**: Farcaster, Dune Analytics, GitHub, RSS feeds
- **Narrative Detection**: Keyword-based analysis with confidence scoring
- **App Idea Generation**: Produces minidev-compatible template specifications
- **Automated Processing**: Continuous ingestion and analysis

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd crypto-narrative-engine
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `DUNE_API_KEY`: Dune Analytics API key

## API Endpoints

- `GET /health` - Health check
- `GET /narratives?limit=10` - Get ranked narratives
- `GET /narratives/:id` - Get specific narrative
- `GET /ideas?limit=50` - Get app ideas from narratives
- `GET /ideas/:id` - Get specific app idea

## Deployment on Render

### Quick Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables in Render dashboard:
   - `DATABASE_URL` (from your Render PostgreSQL service)
   - `DUNE_API_KEY`
4. Deploy with these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev`

### Database Setup
1. Create a PostgreSQL database on Render (free tier: 1GB)
2. Copy the connection string to `DATABASE_URL`
3. Run migrations on first deploy

## Data Sources

### Farcaster
- Fetches recent casts from crypto-focused accounts
- Keywords: ai, agent, defi, restaking, rollup, layer 2

### Dune Analytics  
- Layer-2 activity metrics
- Cached for 6 hours to preserve API credits

### GitHub
- Tracks repositories by crypto topics
- Rate-limited to 60 requests/hour (unauthenticated)

### RSS Feeds
- Electric Capital Substack
- a16z Crypto Substack

## Adding New Sources

1. Create worker in `/workers/<source>/worker.ts`
2. Implement `Signal` interface normalization
3. Add to job scheduler in main server
4. Update documentation

## Architecture

See `/docs/ARCHITECTURE.md` for detailed system design.

## Sample Output

See `/docs/sample-output.json` for example API responses.