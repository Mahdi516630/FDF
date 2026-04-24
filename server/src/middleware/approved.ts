import type { Response, NextFunction } from "express";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { AuthedRequest } from "./auth.js";

export async function requireApproved(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  try {
    const [user] = await db
      .select({ approvedAt: users.approvedAt })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);
    if (!user?.approvedAt) return res.status(403).json({ error: "NotApproved" });
    return next();
  } catch (err) {
    return next(err);
  }
}
