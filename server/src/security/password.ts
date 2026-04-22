import bcrypt from "bcryptjs";

const ROUNDS = 10;

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, ROUNDS);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

