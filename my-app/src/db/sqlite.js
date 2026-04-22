import initSqlJs from "sql.js";

const DB_NAME = "fdf-referee-manager";
const STORE_NAME = "kv";
const KEY_DB = "sqlite-db";

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openIDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const st = tx.objectStore(STORE_NAME);
    const req = st.get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function idbSet(key, value) {
  const db = await openIDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const st = tx.objectStore(STORE_NAME);
    const req = st.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

function nowIso() {
  return new Date().toISOString();
}

export function createFdfSchemaSQL() {
  return `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta(
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users(
  email TEXT PRIMARY KEY,
  password TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_designations_refs ON designations(central_id, assistant1_id, assistant2_id, fourth_id);
`;
}

export function seedFdfSQL({ seedRefs, seedCats, seedDesigs }) {
  // Inserts if empty; keep deterministic ids from seed.
  const insertRefs = seedRefs
    .map(
      (r) =>
        `INSERT OR IGNORE INTO referees(id,name,phone,level,created_at) VALUES (${q(
          r.id
        )},${q(r.name)},${q(r.phone || "")},${q(r.level || "")},${q(
          r.createdAt || r.created_at || nowIso()
        )});`
    )
    .join("\n");

  const insertCats = seedCats
    .map(
      (c) =>
        `INSERT OR IGNORE INTO categories(id,name,central_fee,assistant_fee,fourth_fee) VALUES (${q(
          c.id
        )},${q(c.name)},${n(c.centralfee)},${n(c.assistantfee)},${n(
          c.fourthfee
        )});`
    )
    .join("\n");

  const insertDesigs = seedDesigs
    .map(
      (d) =>
        `INSERT OR IGNORE INTO designations(
          id,date,jour,heure,teama,teamb,terrain,matchnumber,category_id,
          central_id,assistant1_id,assistant2_id,fourth_id,observateur,created_at
        ) VALUES (
          ${q(d.id)},${q(d.date)},${q(d.jour || "")},${q(d.heure || "")},
          ${q(d.teama)},${q(d.teamb)},${q(d.terrain || "")},${q(
          d.matchnumber || ""
        )},${q(d.categoryid)},
          ${q(d.centralid)},${q(d.assistant1id)},${q(d.assistant2id)},${q(
          d.fourthid
        )},${q(d.observateur || "")},${q(nowIso())}
        );`
    )
    .join("\n");

  // Default admin user
  const insertAdmin = `INSERT OR IGNORE INTO users(email,password,created_at) VALUES ('admin@fdf.dj','admin123',${q(
    nowIso()
  )});`;

  return `
${insertAdmin}
${insertRefs}
${insertCats}
${insertDesigs}
`;
}

function q(v) {
  const s = String(v ?? "");
  return `'${s.replace(/'/g, "''")}'`;
}
function n(v) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? String(Math.trunc(x)) : "0";
}

export async function initFdfDb({ locateFile, seed }) {
  const SQL = await initSqlJs({
    locateFile:
      locateFile ||
      ((file) => new URL(`/node_modules/sql.js/dist/${file}`, import.meta.url).toString()),
  });

  const saved = await idbGet(KEY_DB);
  const db = saved ? new SQL.Database(new Uint8Array(saved)) : new SQL.Database();

  db.exec(createFdfSchemaSQL());

  const hasMeta = db.exec(`SELECT value FROM meta WHERE key='schema_version'`);
  if (!hasMeta?.[0]?.values?.length) {
    db.exec(`INSERT OR REPLACE INTO meta(key,value) VALUES ('schema_version','1');`);
  }

  // Seed if empty
  const refsCount = db.exec("SELECT COUNT(*) as c FROM referees")[0]?.values?.[0]?.[0] ?? 0;
  const catsCount = db.exec("SELECT COUNT(*) as c FROM categories")[0]?.values?.[0]?.[0] ?? 0;
  const desCount = db.exec("SELECT COUNT(*) as c FROM designations")[0]?.values?.[0]?.[0] ?? 0;
  if (seed && (refsCount === 0 || catsCount === 0 || desCount === 0)) {
    db.exec(seedFdfSQL(seed));
  }

  await persistDb(db);

  return {
    SQL,
    db,
    persist: () => persistDb(db),
  };
}

export async function persistDb(db) {
  const binary = db.export();
  await idbSet(KEY_DB, binary);
}

export function selectAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export function run(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
}

