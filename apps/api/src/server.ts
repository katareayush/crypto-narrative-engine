import express from "express";
import healthRoute from './routes/health.ts';
import narrativesRoute from './routes/narratives.ts';

const app = express();

app.use(express.json());

app.use('/health', healthRoute);
app.use('/narratives', narrativesRoute);

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

export default app;