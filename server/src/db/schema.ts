// =============================================================================
// server/src/db/schema.ts — Drizzle ORM v3
// Fix : REFEREE_LEVELS exporté explicitement pour validation/referees.ts
// =============================================================================
import { pgTable, pgEnum, text, integer, timestamp, date, time, index } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Exporté explicitement — utilisé par validation/referees.ts ET client/src/constants/levels.ts
export const REFEREE_LEVELS = [
  "Élite", "International", "National A", "National B", "Régional", "Stagiaire",
] as const;

export type RefereeLevel = typeof REFEREE_LEVELS[number];
export type UserRole = "admin" | "user";

export const refereeLevelEnum = pgEnum("referee_level", REFEREE_LEVELS);
export const userRoleEnum     = pgEnum("user_role", ["admin", "user"]);

export const users = pgTable("users", {
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email:        text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role:         userRoleEnum("role").notNull().default("user"),
  approvedAt:   timestamp("approved_at", { withTimezone: true }),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  index("idx_users_pending").on(t.approvedAt).where(sql`${t.approvedAt} IS NULL`),
]);

export const referees = pgTable("referees", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:      text("name").notNull(),
  phone:     text("phone"),
  level:     refereeLevelEnum("level"),
  photoUrl:  text("photo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  index("idx_referees_name").on(t.name),
  index("idx_referees_level").on(t.level),
]);

export const categories = pgTable("categories", {
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:         text("name").notNull().unique(),
  centralFee:   integer("central_fee").notNull().default(0),
  assistantFee: integer("assistant_fee").notNull().default(0),
  fourthFee:    integer("fourth_fee").notNull().default(0),
});

export const designations = pgTable("designations", {
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  date:         date("date").notNull(),
  jour:         text("jour"),
  heure:        text("heure"),
  startTime:    time("start_time"),
  endTime:      time("end_time"),
  teamA:        text("team_a").notNull(),
  teamB:        text("team_b").notNull(),
  terrain:      text("terrain"),
  matchNumber:  text("match_number"),
  categoryId:   text("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
  centralId:    text("central_id").notNull().references(() => referees.id, { onDelete: "restrict" }),
  assistant1Id: text("assistant1_id").notNull().references(() => referees.id, { onDelete: "restrict" }),
  assistant2Id: text("assistant2_id").notNull().references(() => referees.id, { onDelete: "restrict" }),
  fourthId:     text("fourth_id").notNull().references(() => referees.id, { onDelete: "restrict" }),
  observateur:  text("observateur"),
  createdBy:    text("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  index("idx_desig_date").on(t.date),
  index("idx_desig_category").on(t.categoryId),
  index("idx_desig_central").on(t.centralId),
  index("idx_desig_created_at").on(t.createdAt),
]);

export const usersRelations = relations(users, ({ many }) => ({
  designations: many(designations),
}));

export const refereesRelations = relations(referees, ({ many }) => ({
  centralDesignations:    many(designations, { relationName: "central" }),
  assistant1Designations: many(designations, { relationName: "assistant1" }),
  assistant2Designations: many(designations, { relationName: "assistant2" }),
  fourthDesignations:     many(designations, { relationName: "fourth" }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  designations: many(designations),
}));

export const designationsRelations = relations(designations, ({ one }) => ({
  category:      one(categories, { fields: [designations.categoryId],   references: [categories.id] }),
  central:       one(referees,   { fields: [designations.centralId],    references: [referees.id], relationName: "central" }),
  assistant1:    one(referees,   { fields: [designations.assistant1Id], references: [referees.id], relationName: "assistant1" }),
  assistant2:    one(referees,   { fields: [designations.assistant2Id], references: [referees.id], relationName: "assistant2" }),
  fourth:        one(referees,   { fields: [designations.fourthId],     references: [referees.id], relationName: "fourth" }),
  createdByUser: one(users,      { fields: [designations.createdBy],    references: [users.id] }),
}));

export type User              = typeof users.$inferSelect;
export type Referee           = typeof referees.$inferSelect;
export type Category          = typeof categories.$inferSelect;
export type Designation       = typeof designations.$inferSelect;
export type NewUser           = typeof users.$inferInsert;
export type NewReferee        = typeof referees.$inferInsert;
export type NewCategory       = typeof categories.$inferInsert;
export type NewDesignation    = typeof designations.$inferInsert;
export type DesignationWithDetails = Designation & {
  category: Category; central: Referee; assistant1: Referee; assistant2: Referee; fourth: Referee;
};
