// =============================================================================
// server/src/validation/designations.ts
// =============================================================================
import { z } from "zod";

export const DesignationCreateSchema = z
  .object({
    date:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD attendu"),
    jour:         z.string().max(20).optional(),
    heure:        z.string().max(10).optional(),
    startTime:    z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime:      z.string().regex(/^\d{2}:\d{2}$/).optional(),
    teamA:        z.string().min(1).max(100).transform(s => s.trim()),
    teamB:        z.string().min(1).max(100).transform(s => s.trim()),
    terrain:      z.string().max(100).optional(),
    matchNumber:  z.string().max(20).optional(),
    observateur:  z.string().max(100).optional(),
    categoryId:   z.string().min(1),
    centralId:    z.string().min(1),
    assistant1Id: z.string().min(1),
    assistant2Id: z.string().min(1),
    fourthId:     z.string().min(1),
  })
  .refine(
    d => new Set([d.centralId, d.assistant1Id, d.assistant2Id, d.fourthId]).size === 4,
    { message: "Un arbitre ne peut pas tenir deux rôles dans le même match" }
  );

export const DesignationUpdateSchema = DesignationCreateSchema.partial().refine(
  d => {
    const ids = [d.centralId, d.assistant1Id, d.assistant2Id, d.fourthId].filter(Boolean);
    return new Set(ids).size === ids.length;
  },
  { message: "Un arbitre ne peut pas tenir deux rôles dans le même match" }
);

export const ReportingFiltersSchema = z.object({
  dateFrom:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  categoryId: z.string().optional(),
});
