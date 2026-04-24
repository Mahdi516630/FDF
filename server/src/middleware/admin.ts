import type { Response, NextFunction } from "express";
import type { AuthedRequest } from "./auth.js";

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  return next();
}
