// =============================================================================
// server/src/routes/reporting.ts
// Fix sécurité : remplace sql.raw() + string concat par Drizzle sql`` tagged template
// Les valeurs sont bindées comme paramètres PostgreSQL $1, $2 — pas de SQL injection
// =============================================================================
import { Router } from "express";
import { db } from "../db/client.js";
import { sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { requireApproved } from "../middleware/approved.js";
import { ReportingFiltersSchema } from "../validation/designations.js";

export const reportingRouter = Router();
reportingRouter.use(requireAuth, requireApproved);

reportingRouter.get("/net-a-payer", async (req, res, next) => {
  try {
    const filters = ReportingFiltersSchema.parse(req.query);

    // Utilisation de sql`` tagged template — Drizzle binde les valeurs automatiquement
    // Aucune concaténation string — zéro risque d'injection SQL
    const dateFromCondition = filters.dateFrom
      ? sql`AND d.date >= ${filters.dateFrom}::date`
      : sql``;
    const dateToCondition = filters.dateTo
      ? sql`AND d.date <= ${filters.dateTo}::date`
      : sql``;
    const categoryCondition = filters.categoryId
      ? sql`AND d.category_id = ${filters.categoryId}`
      : sql``;

    const query = sql`
      WITH all_fees AS (
        SELECT d.date, rc.id AS referee_id, rc.name, rc.phone, rc.level,
               c.central_fee AS fee, c.name AS category_name, c.id AS category_id
        FROM designations d
        JOIN referees rc ON rc.id = d.central_id
        JOIN categories c ON c.id = d.category_id
        WHERE 1=1 ${dateFromCondition} ${dateToCondition} ${categoryCondition}

        UNION ALL
        SELECT d.date, ra1.id, ra1.name, ra1.phone, ra1.level,
               c.assistant_fee, c.name, c.id
        FROM designations d
        JOIN referees ra1 ON ra1.id = d.assistant1_id
        JOIN categories c ON c.id = d.category_id
        WHERE 1=1 ${dateFromCondition} ${dateToCondition} ${categoryCondition}

        UNION ALL
        SELECT d.date, ra2.id, ra2.name, ra2.phone, ra2.level,
               c.assistant_fee, c.name, c.id
        FROM designations d
        JOIN referees ra2 ON ra2.id = d.assistant2_id
        JOIN categories c ON c.id = d.category_id
        WHERE 1=1 ${dateFromCondition} ${dateToCondition} ${categoryCondition}

        UNION ALL
        SELECT d.date, r4.id, r4.name, r4.phone, r4.level,
               c.fourth_fee, c.name, c.id
        FROM designations d
        JOIN referees r4 ON r4.id = d.fourth_id
        JOIN categories c ON c.id = d.category_id
        WHERE 1=1 ${dateFromCondition} ${dateToCondition} ${categoryCondition}
      )
      SELECT
        referee_id                AS id,
        name,
        phone,
        level,
        category_name             AS "categoryName",
        category_id               AS "categoryId",
        SUM(fee)::int             AS "totalFee",
        COUNT(*)::int             AS "matchCount",
        MIN(date)::text           AS "firstMatch",
        MAX(date)::text           AS "lastMatch"
      FROM all_fees
      GROUP BY referee_id, name, phone, level, category_name, category_id
      ORDER BY name, category_name
    `;

    const result = await db.execute(query);
    res.json(result.rows);
  } catch (err) { next(err); }
});
