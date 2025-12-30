import express from "express";
import { getJobStatus } from "../../../../shared/services/jobScheduler.ts";

const router = express.Router();

router.get("/status", (req, res) => {
  res.json({
    status: "active",
    jobs: getJobStatus()
  });
});

export default router;