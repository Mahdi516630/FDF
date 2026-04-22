import { Router } from "express";
import { db } from "../index.js";
import { requireAuth } from "../middleware/auth.js";
import { DesignationCreateSchema } from "../validation/designations.js";

export const designationsRouter = Router();
designationsRouter.use(requireAuth);

designationsRouter.get("/", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT
        id,date,jour,heure,teama,teamb,terrain,matchnumber,
        category_id as categoryid,
        central_id as centralid,
        assistant1_id as assistant1id,
        assistant2_id as assistant2id,
        fourth_id as fourthid,
        observateur
      FROM designations
      ORDER BY created_at DESC`
    )
    .all();
  res.json(rows);
});

designationsRouter.post("/", (req, res) => {
  const d = DesignationCreateSchema.parse(req.body);
  const roles = [d.centralid, d.assistant1id, d.assistant2id, d.fourthid];
  if (new Set(roles).size !== roles.length) return res.status(400).json({ error: "DuplicateRoles" });

  db.prepare(
    `INSERT INTO designations(
      id,date,jour,heure,teama,teamb,terrain,matchnumber,category_id,
      central_id,assistant1_id,assistant2_id,fourth_id,observateur,created_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    d.id,
    d.date,
    d.jour || "",
    d.heure || "",
    d.teama,
    d.teamb,
    d.terrain || "",
    d.matchnumber || "",
    d.categoryid,
    d.centralid,
    d.assistant1id,
    d.assistant2id,
    d.fourthid,
    d.observateur || "",
    new Date().toISOString()
  );
  res.status(201).json({ ok: true });
});

designationsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM designations WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

