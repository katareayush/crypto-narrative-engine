import express from "express";
import dotenv from "dotenv";
import healthRoute from './routes/health.js';
import narrativesRoute from './routes/narratives.js';
import ideasRoute from './routes/ideas.js';
import jobsRoute from './routes/jobs.js';
import { startJobScheduler } from "../../../shared/services/jobScheduler.js";
import { startHealthPoller } from "../../../shared/services/healthPoller.js";
import { errorHandler, notFoundHandler, asyncHandler } from "../../../shared/middleware/errorHandler.js";
import { apiLimiter, heavyLimiter, postLimiter } from "../../../shared/middleware/rateLimiter.js";
import { cacheMiddleware } from "../../../shared/middleware/cache.js";

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
    const { db } = await import("../../../shared/db/client.js");
  } catch (error) {
  }
  
  // Start job scheduler after server is ready (but don't wait for it)
  setImmediate(() => {
    startJobScheduler();
    startHealthPoller();
  });
  
  // Preload critical data for faster first requests
  setImmediate(async () => {
    try {
      const { getTopNarratives } = await import("./ideas/service.js");
      await getTopNarratives(5);
    } catch (error) {
    }
  });
});

export default app;