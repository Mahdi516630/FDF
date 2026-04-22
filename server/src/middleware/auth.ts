import type { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../security/jwt.js";

export type AuthedRequest = Request & {
  user?: { id: string; email: string };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const h = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (!m) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = verifyJwt(m[1]);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

