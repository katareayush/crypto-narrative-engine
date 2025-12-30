import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from '../../../../shared/db/client.js';
import { narratives } from "../../../../shared/db/schema.js";
import { validateLimit, validatePositiveInteger } from "../../../../shared/utils/validation.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limitValidation = validateLimit(req.query.limit);
    if (!limitValidation.isValid) {
      return res.status(400).json({ error: limitValidation.error });
    }

    const results = await db
      .select()
      .from(narratives)
      .orderBy(desc(narratives.score))
      .limit(limitValidation.limit!);

    res.json(results);
  } catch (error) {
    console.error("Failed to fetch narratives:", error);
    res.status(500).json({ 
      error: "Internal server error while fetching narratives" 
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const idValidation = validatePositiveInteger(req.params.id, "narrative ID");
    if (!idValidation.isValid) {
      return res.status(400).json({ error: idValidation.error });
    }

    const result = await db
      .select()
      .from(narratives)
      .where(eq(narratives.id, idValidation.parsed!))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ 
        error: "Narrative not found" 
      });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Failed to fetch narrative:", error);
    res.status(500).json({ 
      error: "Internal server error while fetching narrative" 
    });
  }
});

export default router;