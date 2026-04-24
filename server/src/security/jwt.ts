import jwt from "jsonwebtoken";
import { env } from "../env.js";

export type JwtPayload = {
  sub: string;   // user id
  email: string;
  role: "admin" | "user";
};

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
