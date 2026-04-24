// =============================================================================
// server/src/index.ts
// Point d'entrée Express v3 — remplace FDF/CCA index.ts
// Sert aussi le client React buildé en production (Render.com single service)
// =============================================================================
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "./env.js";
import { runMigrations } from "./db/migrate.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { adminRouter } from "./routes/admin.js";
import { refereesRouter } from "./routes/referees.js";
import { categoriesRouter } from "./routes/categories.js";
import { designationsRouter } from "./routes/designations.js";
import { reportingRouter } from "./routes/reporting.js";
import { errorHandler, notFound } from "./middleware/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function bootstrap() {
  // 1. Migrations DB
  await runMigrations();

  const app = express();

  // ── Sécurité ────────────────────────────────────────────────────────────
  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: false })); // CSP géré par Vite en prod
  app.use(
    cors({
      origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map(s => s.trim()),
      credentials: true,
    })
  );

  // ── Parsing & logs ───────────────────────────────────────────────────────
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  // ── Rate limiting ────────────────────────────────────────────────────────
  const globalLimiter = rateLimit({
    windowMs: 60_000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "TooManyRequests" },
  });
  const authLimiter = rateLimit({
    windowMs: 60_000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "TooManyRequests" },
  });

  // Rate limit global sur toutes les routes API
  app.use("/api", globalLimiter);

  // ── Health check ─────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => res.json({ ok: true, env: env.NODE_ENV }));

  // ── Routes API ───────────────────────────────────────────────────────────
  app.use("/api/auth",         authLimiter, authRouter);
  app.use("/api/auth/me",      meRouter);
  app.use("/api/admin",        adminRouter);
  app.use("/api/referees",     refereesRouter);
  app.use("/api/categories",   categoriesRouter);
  app.use("/api/designations", designationsRouter);
  app.use("/api/reporting",    reportingRouter);

  // ── Frontend statique (Render single service) ────────────────────────────
  // En dev Vite tourne en parallèle — le proxy Vite gère le /api
  // En production le build React est servi ici
  if (env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "../../../client/dist");
    app.use(express.static(distPath));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // ── Erreurs ──────────────────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.PORT, () => {
    console.log(`✅ Server running on :${env.PORT} [${env.NODE_ENV}]`);
  });
}

bootstrap().catch(err => {
  console.error("❌ Bootstrap failed:", err);
  process.exit(1);
});
