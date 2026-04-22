import type { Response, NextFunction } from "express";
import { db } from "../index.js";
import type { AuthedRequest } from "./auth.js";

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const u = req.user;
  if (!u) return res.status(401).json({ error: "Unauthorized" });
  const row = db.prepare("SELECT is_admin FROM users WHERE id=?").get(u.id) as { is_admin: number } | undefined;
  if (!row?.is_admin) return res.status(403).json({ error: "Forbidden" });
  return next();
}

