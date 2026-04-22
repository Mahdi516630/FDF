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
    .prepare("SELECT id,email,password_hash FROM users WHERE email = ?")
    .get(body.email.toLowerCase()) as { id: string; email: string; password_hash: string } | undefined;
  if (!user) return res.status(401).json({ error: "InvalidCredentials" });
  if (!verifyPassword(body.password, user.password_hash))
    return res.status(401).json({ error: "InvalidCredentials" });
  const token = signJwt({ sub: user.id, email: user.email });
  return res.json({ token, user: { email: user.email } });
});

authRouter.post("/register", (req, res) => {
  const body = RegisterSchema.parse(req.body);
  const email = body.email.toLowerCase();
  const exists = db.prepare("SELECT 1 FROM users WHERE email=?").get(email);
  if (exists) return res.status(409).json({ error: "EmailExists" });
  const id = nanoid();
  const hash = hashPassword(body.password);
  db.prepare("INSERT INTO users(id,email,password_hash,created_at) VALUES (?,?,?,?)").run(
    id,
    email,
    hash,
    new Date().toISOString()
  );
  const token = signJwt({ sub: id, email });
  return res.status(201).json({ token, user: { email } });
});

