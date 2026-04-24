import { Router } from "express";
import { db } from "../db/client.js";
import { categories } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { requireApproved } from "../middleware/approved.js";
import { CategoryCreateSchema, CategoryUpdateSchema } from "../validation/categories.js";

export const categoriesRouter = Router();
categoriesRouter.use(requireAuth, requireApproved);

categoriesRouter.get("/", async (_req, res, next) => {
  try {
    const rows = await db.select().from(categories).orderBy(asc(categories.name));
    res.json(rows);
  } catch (err) { next(err); }
});

categoriesRouter.post("/", async (req, res, next) => {
  try {
    const body = CategoryCreateSchema.parse(req.body);
    const [created] = await db.insert(categories).values(body).returning();
    res.status(201).json(created);
  } catch (err: any) {
    if (err?.code === "23505") return res.status(409).json({ error: "NameExists" });
    next(err);
  }
});

categoriesRouter.put("/:id", async (req, res, next) => {
  try {
    const patch = CategoryUpdateSchema.parse(req.body);
    const [updated] = await db.update(categories).set(patch)
      .where(eq(categories.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ error: "NotFound" });
    res.json(updated);
  } catch (err) { next(err); }
});

categoriesRouter.delete("/:id", async (req, res, next) => {
  try {
    await db.delete(categories).where(eq(categories.id, req.params.id));
    res.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "23503") return res.status(409).json({ error: "CategoryInUse" });
    next(err);
  }
});
