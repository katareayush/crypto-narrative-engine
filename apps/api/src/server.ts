import express from "express";
import dotenv from "dotenv";
import healthRoute from './routes/health.ts';
import narrativesRoute from './routes/narratives.ts';
import ideasRoute from './routes/ideas.ts';
import jobsRoute from './routes/jobs.ts';
import { startJobScheduler } from "../../../shared/services/jobScheduler.ts";
import { errorHandler, notFoundHandler, asyncHandler } from "../../../shared/middleware/errorHandler.ts";
import { apiLimiter, heavyLimiter, postLimiter } from "../../../shared/middleware/rateLimiter.ts";
import { cacheMiddleware } from "../../../shared/middleware/cache.ts";

dotenv.config();

const app = express();

app.use(express.json());

// Trust proxy for rate limiting in Render
app.set('trust proxy', 1);


// Apply rate limiting
app.use(apiLimiter);

// Add caching and routes
app.use('/health', healthRoute);
app.use('/narratives', cacheMiddleware(5), narrativesRoute);
app.use('/ideas', cacheMiddleware(10), ideasRoute);
app.use('/jobs', jobsRoute);

// Manual trigger for ingestion (optional)
app.post("/ingest/run", postLimiter, (req, res) => {
  res.json({
    message: "Jobs are running automatically via scheduler",
    jobs: {}
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  
  // Warm up database connection
  try {
    const { db } = await import("../../../shared/db/client.ts");
  } catch (error) {
  }
  
  // Start job scheduler after server is ready (but don't wait for it)
  setImmediate(() => {
    startJobScheduler();
  });
  
  // Preload critical data for faster first requests
  setImmediate(async () => {
    try {
      const { getTopNarratives } = await import("./ideas/service.ts");
      await getTopNarratives(5);
    } catch (error) {
    }
  });
});

export default app;