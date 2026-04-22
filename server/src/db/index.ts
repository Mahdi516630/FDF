import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { env } from "../env.js";
import { SCHEMA_SQL } from "./schema.js";
import { seedIfEmpty } from "./seedIfEmpty.js";

export type Db = Database.Database;

export function openDb(): Db {
  const dbPath = env.DB_PATH;
  const dir = path.dirname(dbPath);
  if (dir && dir !== "." && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA_SQL);
  seedIfEmpty(db);
  return db;
}

