import type Database from "better-sqlite3";
import { nanoid } from "../util/nanoid.js";
import { hashPassword } from "../security/password.js";
import { SEED_CATS, SEED_DESIGS, SEED_REFS } from "./seed.js";

export function seedIfEmpty(db: Database.Database) {
  const refsCount = db.prepare("SELECT COUNT(*) as c FROM referees").get() as { c: number };
  const catsCount = db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number };
  const desCount = db.prepare("SELECT COUNT(*) as c FROM designations").get() as { c: number };
  const usersCount = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };

  const now = new Date().toISOString();

  if (usersCount.c === 0) {
    const pwHash = hashPassword("admin123");
    db.prepare(
      "INSERT INTO users(id,email,password_hash,created_at) VALUES (?,?,?,?)"
    ).run(nanoid(), "admin@fdf.dj", pwHash, now);
  }

  if (refsCount.c === 0) {
    const stmt = db.prepare(
      "INSERT INTO referees(id,name,phone,level,created_at) VALUES (?,?,?,?,?)"
    );
    const tx = db.transaction(() => {
      for (const r of SEED_REFS) stmt.run(r.id, r.name, r.phone || "", r.level || "", now);
    });
    tx();
  }

  if (catsCount.c === 0) {
    const stmt = db.prepare(
      "INSERT INTO categories(id,name,central_fee,assistant_fee,fourth_fee) VALUES (?,?,?,?,?)"
    );
    const tx = db.transaction(() => {
      for (const c of SEED_CATS) stmt.run(c.id, c.name, c.centralfee, c.assistantfee, c.fourthfee);
    });
    tx();
  }

  if (desCount.c === 0) {
    const stmt = db.prepare(
      `INSERT INTO designations(
        id,date,jour,heure,teama,teamb,terrain,matchnumber,category_id,
        central_id,assistant1_id,assistant2_id,fourth_id,observateur,created_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    );
    const tx = db.transaction(() => {
      for (const d of SEED_DESIGS)
        stmt.run(
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
          now
        );
    });
    tx();
  }
}

