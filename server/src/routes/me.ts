import { Router } from "express";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const meRouter = Router();
meRouter.use(requireAuth);

meRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const [user] = await db.select({ email: users.email, role: users.role })
      .from(users).where(eq(users.id, req.user!.id)).limit(1);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    res.json({ email: user.email, role: user.role, isAdmin: user.role === "admin" });
  } catch (err) { next(err); }
});
