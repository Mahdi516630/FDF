import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./env.js";
import { openDb } from "./db/index.js";
import { authRouter } from "./routes/auth.js";
import { errorHandler } from "./middleware/errors.js";
import rateLimit from "express-rate-limit";
import { refereesRouter } from "./routes/referees.js";
import { categoriesRouter } from "./routes/categories.js";
import { designationsRouter } from "./routes/designations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const db = openDb();

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use(
  "/api/auth",
  rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false }),
  authRouter
);
app.use("/api/referees", refereesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/designations", designationsRouter);

app.use(errorHandler);

// Frontend static hosting (Render single service)
const distPath = path.resolve(__dirname, "../../my-app/dist");
app.use(express.static(distPath));
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on :${env.PORT} (db: ${env.DB_PATH})`);
});

