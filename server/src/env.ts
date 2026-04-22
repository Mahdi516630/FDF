import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.string().optional().default("development"),
  PORT: z.coerce.number().optional().default(3000),
  DB_PATH: z.string().optional().default("fdf.sqlite"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters").default("dev_only_change_me_please"),
  CORS_ORIGIN: z.string().optional().default("*")
});

export const env = EnvSchema.parse(process.env);

