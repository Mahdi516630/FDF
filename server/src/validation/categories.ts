import { z } from "zod";
import { IdSchema } from "./common.js";

export const CategoryCreateSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  centralfee: z.number().int().nonnegative(),
  assistantfee: z.number().int().nonnegative(),
  fourthfee: z.number().int().nonnegative(),
});

export const CategoryUpdateSchema = z.object({
  name: z.string().min(1),
  centralfee: z.number().int().nonnegative(),
  assistantfee: z.number().int().nonnegative(),
  fourthfee: z.number().int().nonnegative(),
});

