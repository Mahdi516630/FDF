import { Router } from "express";
import { db } from "../index.js";
import { requireAuth } from "../middleware/auth.js";

export const meRouter = Router();
meRouter.use(requireAuth);

meRouter.get("/", (req, res) => {
  const id = (req as any).user?.id as string | undefined;
  if (!id) return res.status(401).json({ error: "Unauthorized" });
  const row = db.prepare("SELECT email,is_admin as isAdmin FROM users WHERE id=?").get(id) as
    | { email: string; isAdmin: number }
    | undefined;
  if (!row) return res.status(401).json({ error: "Unauthorized" });
  res.json({ email: row.email, isAdmin: !!row.isAdmin });
});

