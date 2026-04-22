import { Router } from "express";
import { db } from "../index.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/pending-users", (_req, res) => {
  const rows = db
    .prepare("SELECT id,email,created_at as createdAt FROM users WHERE approved_at IS NULL AND is_admin=0 ORDER BY created_at DESC")
    .all();
  res.json(rows);
});

adminRouter.post("/approve/:id", (req, res) => {
  db.prepare("UPDATE users SET approved_at=? WHERE id=? AND is_admin=0").run(new Date().toISOString(), req.params.id);
  res.json({ ok: true });
});

adminRouter.post("/reject/:id", (req, res) => {
  db.prepare("DELETE FROM users WHERE id=? AND is_admin=0").run(req.params.id);
  res.json({ ok: true });
});

