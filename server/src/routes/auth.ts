import { Router } from "express";
import { db } from "../index.js";
import { LoginSchema, RegisterSchema } from "../validation/auth.js";
import { nanoid } from "../util/nanoid.js";
import { hashPassword, verifyPassword } from "../security/password.js";
import { signJwt } from "../security/jwt.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const body = LoginSchema.parse(req.body);
  const user = db
    .prepare("SELECT id,email,password_hash,is_admin,approved_at FROM users WHERE email = ?")
    .get(body.email.toLowerCase()) as
      | { id: string; email: string; password_hash: string; is_admin: number; approved_at: string | null }
      | undefined;
  if (!user) return res.status(401).json({ error: "InvalidCredentials" });
  if (!user.approved_at) return res.status(403).json({ error: "NotApproved" });
  if (!verifyPassword(body.password, user.password_hash))
    return res.status(401).json({ error: "InvalidCredentials" });
  const token = signJwt({ sub: user.id, email: user.email });
  return res.json({ token, user: { email: user.email, isAdmin: !!user.is_admin } });
});

authRouter.post("/register", (req, res) => {
  const body = RegisterSchema.parse(req.body);
  const email = body.email.toLowerCase();
  const exists = db.prepare("SELECT 1 FROM users WHERE email=?").get(email);
  if (exists) return res.status(409).json({ error: "EmailExists" });
  const id = nanoid();
  const hash = hashPassword(body.password);
  db.prepare("INSERT INTO users(id,email,password_hash,is_admin,approved_at,created_at) VALUES (?,?,?,?,?,?)").run(
    id,
    email,
    hash,
    0,
    null,
    new Date().toISOString()
  );
  // Registration requires admin approval.
  return res.status(201).json({ pending: true });
});

