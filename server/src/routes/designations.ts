import { Router } from "express";
import { db } from "../db/client.js";
import { designations } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { requireApproved } from "../middleware/approved.js";
import { DesignationCreateSchema, DesignationUpdateSchema } from "../validation/designations.js";

export const designationsRouter = Router();
designationsRouter.use(requireAuth, requireApproved);

designationsRouter.get("/", async (_req, res, next) => {
  try {
    const rows = await db.query.designations.findMany({
      orderBy: [desc(designations.date), desc(designations.createdAt)],
      with: { category: true, central: true, assistant1: true, assistant2: true, fourth: true },
    });
    res.json(rows);
  } catch (err) { next(err); }
});

designationsRouter.get("/:id", async (req, res, next) => {
  try {
    const row = await db.query.designations.findFirst({
      where: eq(designations.id, req.params.id),
      with: { category: true, central: true, assistant1: true, assistant2: true, fourth: true },
    });
    if (!row) return res.status(404).json({ error: "NotFound" });
    res.json(row);
  } catch (err) { next(err); }
});

designationsRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const body = DesignationCreateSchema.parse(req.body);
    const [created] = await db.insert(designations)
      .values({ ...body, createdBy: req.user!.id })
      .returning();
    res.status(201).json(created);
  } catch (err: any) {
    if (err?.message?.includes("deux fois")) return res.status(400).json({ error: "DuplicateRoles" });
    next(err);
  }
});

designationsRouter.put("/:id", async (req, res, next) => {
  try {
    const patch = DesignationUpdateSchema.parse(req.body);
    const [updated] = await db.update(designations).set(patch)
      .where(eq(designations.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ error: "NotFound" });
    res.json(updated);
  } catch (err: any) {
    if (err?.message?.includes("deux fois")) return res.status(400).json({ error: "DuplicateRoles" });
    next(err);
  }
});

designationsRouter.delete("/:id", async (req, res, next) => {
  try {
    await db.delete(designations).where(eq(designations.id, req.params.id));
    res.json({ ok: true });
  } catch (err) { next(err); }
});
