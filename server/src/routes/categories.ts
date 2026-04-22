import { Router } from "express";
import { db } from "../index.js";
import { requireAuth } from "../middleware/auth.js";
import { CategoryCreateSchema, CategoryUpdateSchema } from "../validation/categories.js";

export const categoriesRouter = Router();
categoriesRouter.use(requireAuth);

categoriesRouter.get("/", (_req, res) => {
  const rows = db
    .prepare(
      "SELECT id,name,central_fee as centralfee, assistant_fee as assistantfee, fourth_fee as fourthfee FROM categories ORDER BY name COLLATE NOCASE ASC"
    )
    .all();
  res.json(rows);
});

categoriesRouter.post("/", (req, res) => {
  const c = CategoryCreateSchema.parse(req.body);
  db.prepare("INSERT INTO categories(id,name,central_fee,assistant_fee,fourth_fee) VALUES (?,?,?,?,?)").run(
    c.id,
    c.name.trim(),
    c.centralfee,
    c.assistantfee,
    c.fourthfee
  );
  res.status(201).json({ ok: true });
});

categoriesRouter.put("/:id", (req, res) => {
  const c = CategoryUpdateSchema.parse(req.body);
  db.prepare("UPDATE categories SET name=?, central_fee=?, assistant_fee=?, fourth_fee=? WHERE id=?").run(
    c.name.trim(),
    c.centralfee,
    c.assistantfee,
    c.fourthfee,
    req.params.id
  );
  res.json({ ok: true });
});

categoriesRouter.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM categories WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  } catch {
    res.status(409).json({ error: "CategoryInUse" });
  }
});

