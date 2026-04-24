import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "ValidationError", details: err.flatten() });
  }
  const msg = err instanceof Error ? err.message : "InternalError";
  const status = (err as any)?.status ?? 500;
  if (status >= 500) console.error("[error]", err);
  return res.status(status).json({ error: msg });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "NotFound" });
}
