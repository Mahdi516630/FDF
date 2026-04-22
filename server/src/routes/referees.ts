import { Router } from "express";
import { db } from "../index.js";
import { RefereeCreateSchema, RefereeUpdateSchema } from "../validation/referees.js";
import { requireAuth } from "../middleware/auth.js";

export const refereesRouter = Router();
refereesRouter.use(requireAuth);

refereesRouter.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT id,name,phone,level,created_at as createdAt FROM referees ORDER BY name COLLATE NOCASE ASC")
    .all();
  res.json(rows);
});

refereesRouter.post("/", (req, res) => {
  const r = RefereeCreateSchema.parse(req.body);
  db.prepare("INSERT INTO referees(id,name,phone,level,created_at) VALUES (?,?,?,?,?)").run(
    r.id,
    r.name.trim(),
    (r.phone || "").trim(),
    r.level || "",
    new Date().toISOString()
  );
  res.status(201).json({ ok: true });
});

refereesRouter.put("/:id", (req, res) => {
  const patch = RefereeUpdateSchema.parse(req.body);
  db.prepare("UPDATE referees SET name=?, phone=?, level=? WHERE id=?").run(
    patch.name.trim(),
    (patch.phone || "").trim(),
    patch.level || "",
    req.params.id
  );
  res.json({ ok: true });
});

refereesRouter.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM referees WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(409).json({ error: "RefereeInUse" });
  }
});

