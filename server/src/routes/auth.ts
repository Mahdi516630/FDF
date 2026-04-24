// =============================================================================
// server/src/routes/auth.ts
// =============================================================================
import { Router } from "express";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { LoginSchema, RegisterSchema } from "../validation/auth.js";
import { hashPassword, verifyPassword } from "../security/password.js";
import { signJwt } from "../security/jwt.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = LoginSchema.parse(req.body);
    const [user] = await db.select().from(users)
      .where(eq(users.email, body.email.toLowerCase()))
      .limit(1);

    if (!user) return res.status(401).json({ error: "InvalidCredentials" });
    if (!user.approvedAt) return res.status(403).json({ error: "NotApproved" });
    if (!(await verifyPassword(body.password, user.passwordHash)))
      return res.status(401).json({ error: "InvalidCredentials" });

    const token = signJwt({ sub: user.id, email: user.email, role: user.role });
    return res.json({
      token,
      user: { email: user.email, role: user.role, isAdmin: user.role === "admin" },
    });
  } catch (err) { next(err); }
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = RegisterSchema.parse(req.body);
    const email = body.email.toLowerCase();
    const [exists] = await db.select({ id: users.id }).from(users)
      .where(eq(users.email, email)).limit(1);
    if (exists) return res.status(409).json({ error: "EmailExists" });

    await db.insert(users).values({
      email,
      passwordHash: await hashPassword(body.password),
      role: "user",
      approvedAt: null,
    });
    return res.status(201).json({ pending: true });
  } catch (err) { next(err); }
});
