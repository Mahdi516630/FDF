import { z } from "zod";
import { IdSchema } from "./common.js";

export const RefereeSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  phone: z.string().optional().default(""),
  level: z.string().optional().default(""),
});

export const RefereeCreateSchema = RefereeSchema;

export const RefereeUpdateSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().default(""),
  level: z.string().optional().default(""),
});

