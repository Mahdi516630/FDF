// =============================================================================
// server/src/db/migrate.ts
// Applique les migrations Drizzle au démarrage du serveur
// En dev  : drizzle-kit push (sync immédiat sans fichiers migration)
// En prod : drizzle-kit migrate (fichiers versionnés dans server/drizzle/)
// =============================================================================

import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "./client.js";
import { env } from "../env.js";

export async function runMigrations() {
  if (env.NODE_ENV === "production") {
    // En production : applique les fichiers SQL générés par drizzle-kit generate
    console.log("🔄 Application des migrations Drizzle...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations appliquées.");
  } else {
    // En dev : le schéma est synchronisé via `npm run db:push` manuellement
    // Pas de migration automatique en dev pour éviter les surprises
    console.log("ℹ️  Dev mode — utilisez `npm run db:push` pour synchroniser le schéma.");
  }
}


// =============================================================================
// drizzle.config.ts  (à placer à la racine de server/)
// =============================================================================
//
// import { defineConfig } from "drizzle-kit";
// import { env } from "./src/env.js";   // ← remplacer par process.env.DATABASE_URL si circulaire
//
// export default defineConfig({
//   schema:    "./src/db/schema.ts",
//   out:       "./drizzle",              // dossier des fichiers migration SQL générés
//   dialect:   "postgresql",
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//   },
//   verbose: true,
//   strict:  true,
// });
//
// SCRIPTS à ajouter dans server/package.json :
//   "db:generate" : "drizzle-kit generate"    ← génère les fichiers SQL de migration
//   "db:push"     : "drizzle-kit push"         ← sync direct en dev (sans fichiers)
//   "db:studio"   : "drizzle-kit studio"       ← interface visuelle Drizzle Studio
//   "db:migrate"  : "tsx src/db/migrate.ts"    ← applique les migrations en prod
