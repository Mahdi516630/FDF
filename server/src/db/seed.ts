// =============================================================================
// server/src/db/seed.ts
// Données initiales — exécuté si les tables sont vides
// Lance avec : tsx server/src/db/seed.ts
// Ou automatiquement au boot via migrate.ts si NODE_ENV !== 'production'
// =============================================================================

import { db } from "./client.js";
import { users, referees, categories, designations } from "./schema.js";
import { hashPassword } from "../security/password.js";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Données seed
// Reprises des données FDF (SEED_REFS, SEED_CATS, SEED_DESIGS)
// ---------------------------------------------------------------------------

const SEED_USERS = [
  {
    email: "admin@fdf.dj",
    password: "admin123",
    role: "admin" as const,
    approvedAt: new Date(),
  },
];

const SEED_REFEREES = [
  { id: "r1", name: "Abdi Hassan Omar",   phone: "77831245", level: "International" as const },
  { id: "r2", name: "Fadumo Warsame Ali", phone: "77913467", level: "National A"    as const },
  { id: "r3", name: "Mahad Ismail Dirie", phone: "77567890", level: "Élite"         as const },
  { id: "r4", name: "Hodan Jama Elmi",    phone: "77234512", level: "National B"    as const },
  { id: "r5", name: "Daher Guirreh Aden", phone: "77678901", level: "Régional"      as const },
  { id: "r6", name: "Said Ali Ahmed",     phone: "77658774", level: "Stagiaire"     as const },
  { id: "r7", name: "Moussa Dirieh",      phone: "77112233", level: "National A"    as const },
];

const SEED_CATEGORIES = [
  { id: "cat-ligue1", name: "Ligue 1",   centralFee: 8000,  assistantFee: 5000, fourthFee: 3000 },
  { id: "cat-ligue2", name: "Ligue 2",   centralFee: 6000,  assistantFee: 4000, fourthFee: 2500 },
  { id: "cat-coupe",  name: "Coupe FDF", centralFee: 10000, assistantFee: 6500, fourthFee: 4000 },
];

const SEED_DESIGNATIONS = [
  {
    id:          "d1",
    date:        "2026-04-21",
    jour:        "LUNDI",
    heure:       "17H00",
    teamA:       "AS Port",
    teamB:       "Artar Sihid",
    terrain:     "Académie Douda",
    matchNumber: "61",
    categoryId:  "cat-coupe",
    centralId:   "r1",
    assistant1Id:"r2",
    assistant2Id:"r3",
    fourthId:    "r4",
    observateur: "Med Ali Farah",
  },
  {
    id:          "d2",
    date:        "2026-04-21",
    jour:        "LUNDI",
    heure:       "19H00",
    teamA:       "ASAS Télécom",
    teamB:       "FC Obock",
    terrain:     null,
    matchNumber: "62",
    categoryId:  "cat-coupe",
    centralId:   "r5",
    assistant1Id:"r6",
    assistant2Id:"r7",
    fourthId:    "r1",
    observateur: "Ourouke",
  },
  {
    id:          "d3",
    date:        "2026-04-22",
    jour:        "MARDI",
    heure:       "17H00",
    teamA:       "AS Arta",
    teamB:       "Dikhil FC",
    terrain:     "El Hadj Hassan",
    matchNumber: "01",
    categoryId:  "cat-ligue1",
    centralId:   "r2",
    assistant1Id:"r3",
    assistant2Id:"r4",
    fourthId:    "r5",
    observateur: null,
  },
  {
    id:          "d4",
    date:        "2026-04-22",
    jour:        "MARDI",
    heure:       "19H00",
    teamA:       "FC Djibouti",
    teamB:       "Gendarmerie",
    terrain:     "El Hadj Hassan",
    matchNumber: "02",
    categoryId:  "cat-ligue1",
    centralId:   "r6",
    assistant1Id:"r7",
    assistant2Id:"r1",
    fourthId:    "r2",
    observateur: null,
  },
  {
    id:          "d5",
    date:        "2026-04-23",
    jour:        "MERCREDI",
    heure:       "17H00",
    teamA:       "Police FC",
    teamB:       "AS Tadjourah",
    terrain:     "El Hadj Hassan",
    matchNumber: "03",
    categoryId:  "cat-ligue2",
    centralId:   "r3",
    assistant1Id:"r4",
    assistant2Id:"r5",
    fourthId:    "r6",
    observateur: null,
  },
];

// ---------------------------------------------------------------------------
// Fonction principale
// ---------------------------------------------------------------------------

async function seed() {
  console.log("🌱 Démarrage du seed...");

  // ── Users ────────────────────────────────────────────────────────────────
  const usersCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  if (usersCount[0].count === 0) {
    console.log("  → Création du compte admin...");
    for (const u of SEED_USERS) {
      await db.insert(users).values({
        email:        u.email,
        passwordHash: await hashPassword(u.password),
        role:         u.role,
        approvedAt:   u.approvedAt,
      });
    }
  } else {
    // Garantir que l'admin reste admin + approuvé même après reset partiel
    await db.execute(
      sql`UPDATE users SET role = 'admin', approved_at = COALESCE(approved_at, NOW())
          WHERE email = 'admin@fdf.dj'`
    );
    console.log("  → Users déjà présents, admin vérifié.");
  }

  // ── Referees ─────────────────────────────────────────────────────────────
  const refsCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(referees);

  if (refsCount[0].count === 0) {
    console.log("  → Insertion des arbitres...");
    await db.insert(referees).values(SEED_REFEREES);
  } else {
    console.log("  → Arbitres déjà présents, skip.");
  }

  // ── Categories ───────────────────────────────────────────────────────────
  const catsCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(categories);

  if (catsCount[0].count === 0) {
    console.log("  → Insertion des catégories...");
    await db.insert(categories).values(SEED_CATEGORIES);
  } else {
    console.log("  → Catégories déjà présentes, skip.");
  }

  // ── Designations ─────────────────────────────────────────────────────────
  const desCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(designations);

  if (desCount[0].count === 0) {
    console.log("  → Insertion des désignations exemple...");
    await db.insert(designations).values(SEED_DESIGNATIONS);
  } else {
    console.log("  → Désignations déjà présentes, skip.");
  }

  console.log("✅ Seed terminé.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erreur seed :", err);
  process.exit(1);
});
