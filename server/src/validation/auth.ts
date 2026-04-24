// =============================================================================
// server/src/validation/auth.ts
// =============================================================================
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
});
