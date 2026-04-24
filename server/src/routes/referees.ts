import { Router } from "express";
import { db } from "../db/client.js";
import { referees } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { requireApproved } from "../middleware/approved.js";
import { RefereeCreateSchema, RefereeUpdateSchema } from "../validation/referees.js";

export const refereesRouter = Router();
refereesRouter.use(requireAuth, requireApproved);

refereesRouter.get("/", async (_req, res, next) => {
  try {
    const rows = await db.select().from(referees).orderBy(asc(referees.name));
    res.json(rows);
  } catch (err) { next(err); }
});

refereesRouter.post("/", async (req, res, next) => {
  try {
    const body = RefereeCreateSchema.parse(req.body);
    const [created] = await db.insert(referees).values(body).returning();
    res.status(201).json(created);
  } catch (err) { next(err); }
});

refereesRouter.put("/:id", async (req, res, next) => {
  try {
    const patch = RefereeUpdateSchema.parse(req.body);
    const [updated] = await db.update(referees).set(patch)
      .where(eq(referees.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ error: "NotFound" });
    res.json(updated);
  } catch (err) { next(err); }
});

refereesRouter.delete("/:id", async (req, res, next) => {
  try {
    await db.delete(referees).where(eq(referees.id, req.params.id));
    res.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "23503") return res.status(409).json({ error: "RefereeInUse" });
    next(err);
  }
});
