// =============================================================================
// server/src/middleware/auth.ts
// =============================================================================
import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../security/jwt.js";

export type AuthedRequest = Request & {
  user?: { id: string; email: string; role: "admin" | "user" };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = verifyJwt(match[1]);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
