import express from "express";
import healthRoute from './routes/health.ts';

const app = express();

app.use('/health', healthRoute);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default app;