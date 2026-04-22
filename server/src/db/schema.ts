export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta(
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users(
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0,
  approved_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS referees(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  level TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  central_fee INTEGER NOT NULL,
  assistant_fee INTEGER NOT NULL,
  fourth_fee INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS designations(
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  jour TEXT,
  heure TEXT,
  teama TEXT NOT NULL,
  teamb TEXT NOT NULL,
  terrain TEXT,
  matchnumber TEXT,
  category_id TEXT NOT NULL,
  central_id TEXT NOT NULL,
  assistant1_id TEXT NOT NULL,
  assistant2_id TEXT NOT NULL,
  fourth_id TEXT NOT NULL,
  observateur TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY(central_id) REFERENCES referees(id) ON DELETE RESTRICT,
  FOREIGN KEY(assistant1_id) REFERENCES referees(id) ON DELETE RESTRICT,
  FOREIGN KEY(assistant2_id) REFERENCES referees(id) ON DELETE RESTRICT,
  FOREIGN KEY(fourth_id) REFERENCES referees(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_designations_category ON designations(category_id);
CREATE INDEX IF NOT EXISTS idx_designations_created ON designations(created_at);
`;

