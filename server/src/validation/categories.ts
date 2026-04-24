// =============================================================================
// server/src/validation/categories.ts
// =============================================================================
import { z } from "zod";

const FeeSchema = z.number().int().nonnegative();

export const CategoryCreateSchema = z.object({
  name:         z.string().min(1).max(80).transform(s => s.trim()),
  centralFee:   FeeSchema,
  assistantFee: FeeSchema,
  fourthFee:    FeeSchema,
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial();
