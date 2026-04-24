import { z } from "zod";
import { REFEREE_LEVELS } from "../db/schema.js";

export const RefereeCreateSchema = z.object({
  name:     z.string().min(1).max(120).transform(s => s.trim()),
  phone:    z.string().max(30).optional(),
  level:    z.enum(REFEREE_LEVELS).optional(),
  photoUrl: z.string().url().optional(),
});

export const RefereeUpdateSchema = RefereeCreateSchema.partial();
