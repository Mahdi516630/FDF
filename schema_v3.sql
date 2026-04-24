-- =============================================================================
-- SYSTÈME DE GESTION DES ARBITRES — v3 (SDMON)
-- Schéma PostgreSQL final
-- Fusion CCA (TypeScript/Postgres) + FDF (features métier)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()


-- ---------------------------------------------------------------------------
-- ENUM : niveaux arbitres
-- Centralisé ici pour éviter les chaînes libres en base
-- ---------------------------------------------------------------------------
CREATE TYPE referee_level AS ENUM (
  'Élite',
  'International',
  'National A',
  'National B',
  'Régional',
  'Stagiaire'
);


-- ---------------------------------------------------------------------------
-- ENUM : rôles utilisateurs
-- ---------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM (
  'admin',
  'user'
);


-- =============================================================================
-- TABLE : users
-- Gestion des comptes avec approbation admin (issu de FDF)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          user_role   NOT NULL DEFAULT 'user',
  approved_at   TIMESTAMPTZ,                -- NULL = en attente d'approbation
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour accélérer le login par email
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Index pour lister rapidement les comptes en attente
CREATE INDEX IF NOT EXISTS idx_users_pending ON users (approved_at)
  WHERE approved_at IS NULL;

-- Commentaires
COMMENT ON TABLE  users                IS 'Comptes utilisateurs du système';
COMMENT ON COLUMN users.approved_at   IS 'NULL = compte en attente d''approbation admin';
COMMENT ON COLUMN users.role          IS 'admin ou user';


-- =============================================================================
-- TABLE : referees
-- Les arbitres avec niveau/grade (issu de FDF) + champs CCA
-- =============================================================================
CREATE TABLE IF NOT EXISTS referees (
  id         TEXT          PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name       TEXT          NOT NULL,
  phone      TEXT,
  level      referee_level,               -- NULL acceptable (niveau non renseigné)
  photo_url  TEXT,                        -- URL photo de profil (v3 - Phase 2)
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referees_name  ON referees (name);
CREATE INDEX IF NOT EXISTS idx_referees_level ON referees (level);

COMMENT ON TABLE  referees           IS 'Arbitres enregistrés dans le système';
COMMENT ON COLUMN referees.level     IS 'Grade officiel de l''arbitre (enum referee_level)';
COMMENT ON COLUMN referees.photo_url IS 'URL vers la photo de profil (stockage externe)';


-- =============================================================================
-- TABLE : categories
-- Catégories de matchs avec tarifs par rôle (CCA + FDF identiques)
-- =============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id            TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name          TEXT    NOT NULL UNIQUE,
  central_fee   INTEGER NOT NULL CHECK (central_fee   >= 0),
  assistant_fee INTEGER NOT NULL CHECK (assistant_fee >= 0),
  fourth_fee    INTEGER NOT NULL CHECK (fourth_fee    >= 0)
);

COMMENT ON TABLE  categories               IS 'Catégories de compétition (Ligue 1, Coupe FDF, etc.)';
COMMENT ON COLUMN categories.central_fee   IS 'Indemnité arbitre central (FDJ)';
COMMENT ON COLUMN categories.assistant_fee IS 'Indemnité arbitre assistant (FDJ)';
COMMENT ON COLUMN categories.fourth_fee    IS 'Indemnité 4ème arbitre (FDJ)';


-- =============================================================================
-- TABLE : designations
-- Fusion complète CCA + FDF :
--   - terrain, observateur, jour, heure (FDF)
--   - startTime, endTime (CCA)
--   - matchnumber commun aux deux
-- =============================================================================
CREATE TABLE IF NOT EXISTS designations (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,

  -- Informations match
  date          DATE        NOT NULL,
  jour          TEXT,                        -- Ex: "LUNDI", "MARDI" (pour export Excel)
  heure         TEXT,                        -- Ex: "17H00" (affichage)
  start_time    TIME,                        -- Heure début (format TIME pour calculs)
  end_time      TIME,                        -- Heure fin   (issu CCA)
  team_a        TEXT        NOT NULL,
  team_b        TEXT        NOT NULL,
  terrain       TEXT,                        -- Lieu du match (issu FDF)
  match_number  TEXT,

  -- Catégorie
  category_id   TEXT        NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

  -- Arbitres (4 rôles fixes)
  central_id    TEXT        NOT NULL REFERENCES referees(id)   ON DELETE RESTRICT,
  assistant1_id TEXT        NOT NULL REFERENCES referees(id)   ON DELETE RESTRICT,
  assistant2_id TEXT        NOT NULL REFERENCES referees(id)   ON DELETE RESTRICT,
  fourth_id     TEXT        NOT NULL REFERENCES referees(id)   ON DELETE RESTRICT,

  -- Supervision
  observateur   TEXT,                        -- Nom de l'observateur (issu FDF)

  -- Métadonnées
  created_by    TEXT        REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index de performance pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_desig_date        ON designations (date DESC);
CREATE INDEX IF NOT EXISTS idx_desig_category    ON designations (category_id);
CREATE INDEX IF NOT EXISTS idx_desig_central     ON designations (central_id);
CREATE INDEX IF NOT EXISTS idx_desig_assistant1  ON designations (assistant1_id);
CREATE INDEX IF NOT EXISTS idx_desig_assistant2  ON designations (assistant2_id);
CREATE INDEX IF NOT EXISTS idx_desig_fourth      ON designations (fourth_id);
CREATE INDEX IF NOT EXISTS idx_desig_created_at  ON designations (created_at DESC);

COMMENT ON TABLE  designations             IS 'Désignations d''arbitres pour chaque match';
COMMENT ON COLUMN designations.jour        IS 'Nom du jour en français (pour affichage et export Excel)';
COMMENT ON COLUMN designations.heure       IS 'Heure affichée (ex: 17H00)';
COMMENT ON COLUMN designations.start_time  IS 'Heure de début structurée pour calculs';
COMMENT ON COLUMN designations.terrain     IS 'Lieu / stade du match';
COMMENT ON COLUMN designations.observateur IS 'Nom de l''observateur présent au match';
COMMENT ON COLUMN designations.created_by  IS 'Utilisateur ayant créé la désignation';


-- =============================================================================
-- CONTRAINTE : un arbitre ne peut pas être désigné deux fois dans le même match
-- (Détection de conflits - v3 Phase 2)
-- =============================================================================

-- Fonction utilitaire : vérifie qu'un arbitre n'occupe pas deux rôles dans la même désignation
CREATE OR REPLACE FUNCTION check_no_duplicate_referee()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.central_id    = NEW.assistant1_id OR
     NEW.central_id    = NEW.assistant2_id OR
     NEW.central_id    = NEW.fourth_id     OR
     NEW.assistant1_id = NEW.assistant2_id OR
     NEW.assistant1_id = NEW.fourth_id     OR
     NEW.assistant2_id = NEW.fourth_id
  THEN
    RAISE EXCEPTION 'Un arbitre ne peut pas être désigné deux fois dans le même match';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_duplicate_referee
  BEFORE INSERT OR UPDATE ON designations
  FOR EACH ROW EXECUTE FUNCTION check_no_duplicate_referee();


-- =============================================================================
-- VUE : v_designation_detail
-- Vue dénormalisée pour les écrans liste et export — évite les jointures répétées côté API
-- =============================================================================
CREATE OR REPLACE VIEW v_designation_detail AS
SELECT
  d.id,
  d.date,
  d.jour,
  d.heure,
  d.start_time,
  d.end_time,
  d.team_a,
  d.team_b,
  d.terrain,
  d.match_number,
  d.observateur,
  d.created_at,

  -- Catégorie
  c.id            AS category_id,
  c.name          AS category_name,
  c.central_fee,
  c.assistant_fee,
  c.fourth_fee,

  -- Arbitre central
  rc.id           AS central_id,
  rc.name         AS central_name,
  rc.phone        AS central_phone,
  rc.level        AS central_level,

  -- Assistant 1
  ra1.id          AS assistant1_id,
  ra1.name        AS assistant1_name,
  ra1.phone       AS assistant1_phone,
  ra1.level       AS assistant1_level,

  -- Assistant 2
  ra2.id          AS assistant2_id,
  ra2.name        AS assistant2_name,
  ra2.phone       AS assistant2_phone,
  ra2.level       AS assistant2_level,

  -- 4ème arbitre
  r4.id           AS fourth_id,
  r4.name         AS fourth_name,
  r4.phone        AS fourth_phone,
  r4.level        AS fourth_level,

  -- Frais total du match
  (c.central_fee + c.assistant_fee * 2 + c.fourth_fee) AS total_match_fee

FROM designations d
JOIN categories c   ON c.id  = d.category_id
JOIN referees   rc  ON rc.id = d.central_id
JOIN referees   ra1 ON ra1.id = d.assistant1_id
JOIN referees   ra2 ON ra2.id = d.assistant2_id
JOIN referees   r4  ON r4.id  = d.fourth_id;

COMMENT ON VIEW v_designation_detail IS
  'Vue dénormalisée — liste complète des désignations avec noms, niveaux et frais';


-- =============================================================================
-- VUE : v_referee_net_payer
-- Calcul "Net à Payer" par arbitre sur une période — pour le rapport Excel
-- Usage : SELECT * FROM v_referee_net_payer WHERE date BETWEEN '...' AND '...'
-- =============================================================================
CREATE OR REPLACE VIEW v_referee_net_payer AS
WITH all_fees AS (
  -- Central
  SELECT d.date, d.category_id, rc.id AS referee_id, rc.name, rc.phone, rc.level,
         c.central_fee AS fee, c.name AS category_name
  FROM designations d
  JOIN referees rc ON rc.id = d.central_id
  JOIN categories c ON c.id = d.category_id

  UNION ALL

  -- Assistant 1
  SELECT d.date, d.category_id, ra1.id, ra1.name, ra1.phone, ra1.level,
         c.assistant_fee, c.name
  FROM designations d
  JOIN referees ra1 ON ra1.id = d.assistant1_id
  JOIN categories c ON c.id = d.category_id

  UNION ALL

  -- Assistant 2
  SELECT d.date, d.category_id, ra2.id, ra2.name, ra2.phone, ra2.level,
         c.assistant_fee, c.name
  FROM designations d
  JOIN referees ra2 ON ra2.id = d.assistant2_id
  JOIN categories c ON c.id = d.category_id

  UNION ALL

  -- 4ème arbitre
  SELECT d.date, d.category_id, r4.id, r4.name, r4.phone, r4.level,
         c.fourth_fee, c.name
  FROM designations d
  JOIN referees r4 ON r4.id = d.fourth_id
  JOIN categories c ON c.id = d.category_id
)
SELECT
  referee_id  AS id,
  name,
  phone,
  level,
  category_name,
  category_id,
  SUM(fee)    AS total_fee,
  COUNT(*)    AS match_count,
  MIN(date)   AS first_match,
  MAX(date)   AS last_match
FROM all_fees
GROUP BY referee_id, name, phone, level, category_name, category_id
ORDER BY name, category_name;

COMMENT ON VIEW v_referee_net_payer IS
  'Frais cumulés par arbitre et par catégorie — base du rapport Net à Payer';


-- =============================================================================
-- DONNÉES INITIALES (SEED)
-- Catégories par défaut — basées sur les seeds FDF
-- =============================================================================
INSERT INTO categories (id, name, central_fee, assistant_fee, fourth_fee) VALUES
  ('cat-ligue1',  'Ligue 1',   8000, 5000, 3000),
  ('cat-ligue2',  'Ligue 2',   6000, 4000, 2500),
  ('cat-coupe',   'Coupe FDF', 10000, 6500, 4000)
ON CONFLICT (name) DO NOTHING;


-- =============================================================================
-- RÉSUMÉ DES TABLES
-- =============================================================================
--
--  users          → comptes + rôles + approbation admin
--  referees       → arbitres + grade (enum) + photo
--  categories     → compétitions + 3 tarifs
--  designations   → matchs avec 4 arbitres + terrain + observateur
--
--  v_designation_detail   → vue lecture pour l'API (liste + détail)
--  v_referee_net_payer    → vue calcul frais (rapport Excel)
--
--  trg_no_duplicate_referee → contrainte anti-doublon arbitre par match
--
-- =============================================================================
