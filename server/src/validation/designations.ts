import { z } from "zod";
import { IdSchema } from "./common.js";

export const DesignationCreateSchema = z.object({
  id: IdSchema,
  date: z.string().min(1),
  jour: z.string().optional().default(""),
  heure: z.string().optional().default(""),
  teama: z.string().min(1),
  teamb: z.string().min(1),
  terrain: z.string().optional().default(""),
  matchnumber: z.string().optional().default(""),
  categoryid: z.string().min(1),
  centralid: z.string().min(1),
  assistant1id: z.string().min(1),
  assistant2id: z.string().min(1),
  fourthid: z.string().min(1),
  observateur: z.string().optional().default(""),
});

