// =============================================================================
// server/src/db/client.ts
// Connexion Neon PostgreSQL + instance Drizzle
// Point d'entrée unique pour toutes les requêtes DB
// =============================================================================

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "../env.js";
import * as schema from "./schema.js";

// Connexion HTTP Neon (serverless-safe, fonctionne sur Render.com)
const sql = neon(env.DATABASE_URL);

// Instance Drizzle avec le schéma complet
// Le { schema } active db.query.* pour les jointures relationnelles
export const db = drizzle(sql, { schema });

// Type de l'instance — utile pour les fonctions qui reçoivent db en paramètre
export type DB = typeof db;
