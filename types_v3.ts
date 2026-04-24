// =============================================================================
// TYPES TYPESCRIPT — Système Gestion Arbitres v3 (SDMON)
// Miroir exact du schéma PostgreSQL schema_v3.sql
// =============================================================================

// ---------------------------------------------------------------------------
// ENUMS (doivent correspondre aux PostgreSQL ENUM)
// ---------------------------------------------------------------------------

export const REFEREE_LEVELS = [
  'Élite',
  'International',
  'National A',
  'National B',
  'Régional',
  'Stagiaire',
] as const;

export type RefereeLevel = typeof REFEREE_LEVELS[number];

export type UserRole = 'admin' | 'user';

// ---------------------------------------------------------------------------
// ENTITÉS DE BASE (lignes telles que retournées par l'API)
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  role: UserRole;
  approvedAt: string | null;   // ISO 8601, null = en attente
  createdAt: string;
}

export interface Referee {
  id: string;
  name: string;
  phone: string | null;
  level: RefereeLevel | null;
  photoUrl: string | null;     // Phase 2
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  centralFee: number;          // FDJ
  assistantFee: number;        // FDJ
  fourthFee: number;           // FDJ
}

export interface Designation {
  id: string;
  date: string;                // ISO 8601 date (YYYY-MM-DD)
  jour: string | null;         // "LUNDI", "MARDI" … (pour export)
  heure: string | null;        // "17H00" (affichage)
  startTime: string | null;    // "HH:MM" (calculs)
  endTime: string | null;      // "HH:MM"
  teamA: string;
  teamB: string;
  terrain: string | null;
  matchNumber: string | null;
  observateur: string | null;
  categoryId: string;
  centralId: string;
  assistant1Id: string;
  assistant2Id: string;
  fourthId: string;
  createdBy: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// VUE DÉNORMALISÉE (v_designation_detail)
// Ce type correspond à ce que retourne la vue PostgreSQL
// ---------------------------------------------------------------------------

export interface DesignationDetail {
  id: string;
  date: string;
  jour: string | null;
  heure: string | null;
  startTime: string | null;
  endTime: string | null;
  teamA: string;
  teamB: string;
  terrain: string | null;
  matchNumber: string | null;
  observateur: string | null;
  createdAt: string;

  // Catégorie
  categoryId: string;
  categoryName: string;
  centralFee: number;
  assistantFee: number;
  fourthFee: number;
  totalMatchFee: number;

  // Arbitres (4 rôles)
  centralId: string;
  centralName: string;
  centralPhone: string | null;
  centralLevel: RefereeLevel | null;

  assistant1Id: string;
  assistant1Name: string;
  assistant1Phone: string | null;
  assistant1Level: RefereeLevel | null;

  assistant2Id: string;
  assistant2Name: string;
  assistant2Phone: string | null;
  assistant2Level: RefereeLevel | null;

  fourthId: string;
  fourthName: string;
  fourthPhone: string | null;
  fourthLevel: RefereeLevel | null;
}

// ---------------------------------------------------------------------------
// VUE NET À PAYER (v_referee_net_payer)
// ---------------------------------------------------------------------------

export interface RefereeNetPayer {
  id: string;
  name: string;
  phone: string | null;
  level: RefereeLevel | null;
  categoryName: string;
  categoryId: string;
  totalFee: number;
  matchCount: number;
  firstMatch: string;
  lastMatch: string;
}

// ---------------------------------------------------------------------------
// PAYLOADS API (corps des requêtes POST / PATCH)
// ---------------------------------------------------------------------------

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface CreateRefereePayload {
  name: string;
  phone?: string;
  level?: RefereeLevel;
  photoUrl?: string;
}

export interface UpdateRefereePayload extends Partial<CreateRefereePayload> {}

export interface CreateCategoryPayload {
  name: string;
  centralFee: number;
  assistantFee: number;
  fourthFee: number;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

export interface CreateDesignationPayload {
  date: string;             // YYYY-MM-DD
  jour?: string;
  heure?: string;
  startTime?: string;       // HH:MM
  endTime?: string;
  teamA: string;
  teamB: string;
  terrain?: string;
  matchNumber?: string;
  observateur?: string;
  categoryId: string;
  centralId: string;
  assistant1Id: string;
  assistant2Id: string;
  fourthId: string;
}

export interface UpdateDesignationPayload extends Partial<CreateDesignationPayload> {}

// ---------------------------------------------------------------------------
// RÉPONSES API STANDARD
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// ---------------------------------------------------------------------------
// FILTRES (requêtes GET avec query params)
// ---------------------------------------------------------------------------

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface DesignationFilters {
  period?: TimePeriod;
  categoryId?: string;
  refereeId?: string;
  dateFrom?: string;   // YYYY-MM-DD
  dateTo?: string;     // YYYY-MM-DD
}
