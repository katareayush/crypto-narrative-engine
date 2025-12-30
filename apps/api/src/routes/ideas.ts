import express from "express";
import { generateAllAppIdeas, getAppIdeaById } from '../ideas/service.js';
import { validateLimit, validatePositiveInteger } from "../../../../shared/utils/validation.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const limitValidation = validateLimit(req.query.limit);
    if (!limitValidation.isValid) {
      return res.status(400).json({ error: limitValidation.error });
    }

    const ideas = await generateAllAppIdeas(limitValidation.limit);

    res.json({
      total: ideas.length,
      ideas
    });
  } catch (error) {
    console.error("Ideas endpoint error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const idValidation = validatePositiveInteger(req.params.id, "idea ID");
    if (!idValidation.isValid) {
      return res.status(400).json({ error: idValidation.error });
    }

    const idea = await getAppIdeaById(idValidation.parsed!);

    if (!idea) {
      return res.status(404).json({ 
        error: "App idea not found" 
      });
    }

    res.json(idea);
  } catch (error) {
    console.error("Ideas ID endpoint error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;