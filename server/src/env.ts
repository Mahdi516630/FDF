// =============================================================================
// server/src/env.ts
// Validation Zod des variables d'environnement — fail fast au boot
// Remplace la version FDF (qui avait DB_PATH SQLite)
// =============================================================================

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),

  PORT: z.coerce.number().optional().default(3000),

  // Neon PostgreSQL — obligatoire
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL doit être une URL valide")
    .startsWith("postgresql://", "DATABASE_URL doit commencer par postgresql://"),

  // JWT — obligatoire, min 32 chars
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET doit faire au moins 32 caractères"),

  CORS_ORIGIN: z.string().optional().default("*"),

  // Phase 2 — Email (optionnel pour Phase 1)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

// Parse et expose — le serveur refuse de démarrer si une var obligatoire manque
export const env = EnvSchema.parse(process.env);

export type Env = z.infer<typeof EnvSchema>;
