import { Router } from "express";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { eq, isNull } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/pending-users", async (_req, res, next) => {
  try {
    const pending = await db
      .select({ id: users.id, email: users.email, createdAt: users.createdAt })
      .from(users)
      .where(isNull(users.approvedAt))
      .orderBy(users.createdAt);
    res.json(pending);
  } catch (err) { next(err); }
});

adminRouter.post("/approve/:id", async (req, res, next) => {
  try {
    await db.update(users).set({ approvedAt: new Date() }).where(eq(users.id, req.params.id));
    res.json({ ok: true });
  } catch (err) { next(err); }
});

adminRouter.delete("/reject/:id", async (req, res, next) => {
  try {
    await db.delete(users).where(eq(users.id, req.params.id));
    res.json({ ok: true });
  } catch (err) { next(err); }
});
