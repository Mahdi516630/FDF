# Architecture — Système Gestion Arbitres v3
**SDMON · Fusion CCA + FDF · Monorepo client/server**

---

## Vue d'ensemble

```
referee-manager-v3/
├── .env.example
├── .gitignore
├── package.json          ← scripts root (dev, build, start, db:push, db:seed)
├── README.md
│
├── server/               ← Express + TypeScript + Drizzle + Neon Postgres
└── client/               ← React 19 + TypeScript + Vite + shadcn/ui
```

---

## SERVER `server/`

```
server/
├── package.json
├── tsconfig.json
│
└── src/
    ├── index.ts                    ← app Express + sert le client buildé en prod
    ├── env.ts                      ← Zod parse(process.env) — fail fast au boot
    │
    ├── db/                         ← NOUVEAU : Drizzle ORM remplace better-sqlite3
    │   ├── client.ts               ← connexion Neon (@neondatabase/serverless)
    │   ├── schema.ts               ← tables + enums Drizzle (sync avec schema_v3.sql)
    │   ├── seed.ts                 ← catégories par défaut au 1er boot
    │   └── migrate.ts              ← drizzle-kit push au démarrage
    │
    ├── middleware/                 ← hérité FDF, +1 nouveau
    │   ├── auth.ts                 ← verifyJWT → req.user
    │   ├── admin.ts                ← role === 'admin'
    │   ├── approved.ts             ← NOUVEAU : approved_at IS NOT NULL
    │   └── errors.ts               ← handler global 404 + 500
    │
    ├── security/                   ← hérité FDF intégralement
    │   ├── jwt.ts                  ← sign / verify
    │   └── password.ts             ← bcrypt hash / compare
    │
    ├── validation/                 ← Zod — un fichier par ressource (hérité FDF)
    │   ├── auth.ts
    │   ├── referees.ts             ← + validation enum RefereeLevel
    │   ├── categories.ts
    │   ├── designations.ts         ← + check 4 referee IDs distincts
    │   └── common.ts
    │
    ├── routes/                     ← fusion CCA + FDF, +1 nouveau
    │   ├── auth.ts                 ← POST /api/auth/register|login
    │   ├── me.ts                   ← GET  /api/auth/me
    │   ├── referees.ts             ← CRUD /api/referees
    │   ├── categories.ts           ← CRUD /api/categories
    │   ├── designations.ts         ← CRUD /api/designations
    │   ├── reporting.ts            ← NOUVEAU : GET /api/reporting/net-a-payer
    │   └── admin.ts                ← GET/PATCH /api/admin/users (admin only)
    │
    └── util/
        ├── nanoid.ts               ← hérité FDF
        └── mailer.ts               ← PHASE 2 : Nodemailer envoi email désignation
```

**Règle serveur :** les `routes/` valident (Zod) puis appellent `db/`. Zéro SQL dans les routes.

---

## CLIENT `client/`

```
client/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
│
└── src/
    ├── main.tsx
    ├── index.css                   ← variables CSS globales + reset
    ├── types.ts                    ← SOURCE DE VÉRITÉ TypeScript (= types_v3.ts)
    │
    ├── api/                        ← seul endroit qui appelle fetch()
    │   ├── client.ts               ← wrapper fetch + injection JWT header
    │   ├── auth.ts                 ← login(), register(), me()
    │   ├── referees.ts             ← list(), create(), update(), remove()
    │   ├── categories.ts
    │   ├── designations.ts
    │   ├── reporting.ts            ← NOUVEAU : netAPayer(filters)
    │   └── admin.ts                ← listPending(), approveUser()
    │
    ├── ui/                         ← aucune logique métier ici
    │   ├── components/             ← shadcn/ui (hérité CCA : button, card, dialog…)
    │   ├── icons.tsx               ← Lucide centralisé (pattern FDF)
    │   ├── primitives.tsx          ← StatCard, Badge, Btn (pattern FDF)
    │   └── toast.tsx               ← hook useToast + Toaster
    │
    ├── constants/
    │   └── levels.ts               ← REFEREE_LEVELS as const (sync avec types.ts)
    │
    ├── utils/
    │   ├── format.ts               ← fmt() — FDJ, dates, heures (hérité FDF)
    │   ├── dates.ts                ← date-fns helpers (filterByPeriod, startOfWeek…)
    │   └── conflicts.ts            ← PHASE 2 : detectConflict()
    │
    ├── features/                   ← architecture feature-based (hérité FDF)
    │   │
    │   ├── auth/
    │   │   └── AuthScreen.tsx      ← login + register (hérité FDF)
    │   │
    │   ├── dashboard/
    │   │   ├── Dashboard.tsx       ← stats cards + liste récente (hérité FDF)
    │   │   └── ChartDesignations.tsx  ← NOUVEAU : Recharts matchs/période
    │   │
    │   ├── referees/
    │   │   ├── RefereesTab.tsx     ← liste + recherche (fusion)
    │   │   └── RefereeForm.tsx     ← formulaire création/édition + niveau
    │   │
    │   ├── categories/
    │   │   ├── CategoriesTab.tsx
    │   │   └── CategoryForm.tsx    ← nom + 3 tarifs
    │   │
    │   ├── designations/
    │   │   ├── DesignationsTab.tsx    ← liste + filtres (fusion)
    │   │   ├── DesignationForm.tsx    ← 4 arbitres + terrain + observateur (fusion)
    │   │   ├── exportExcel.ts         ← export désignations Excel (hérité FDF)
    │   │   └── ConflictAlert.tsx      ← PHASE 2 : alerte doublon arbitre
    │   │
    │   ├── reporting/
    │   │   ├── ReportingTab.tsx       ← vue Net à Payer + filtres période (fusion)
    │   │   ├── exportNetAPayer.ts     ← Excel stylisé (hérité FDF)
    │   │   └── exportPDF.ts           ← PDF rapport arbitre (hérité CCA)
    │   │
    │   └── admin/
    │       └── PendingUsersTab.tsx    ← comptes en attente + approbation (hérité FDF)
    │
    └── app/
        └── App.tsx                    ← shell : tabs nav + routing entre features
```

**Règle client :** les `features/` n'importent jamais entre elles. Tout passe par `api/` ou `ui/`.

---

## Dépendances retenues

### Client
| Package                  | Source        |
|--------------------------|---------------|
| react@19, react-dom      | fusion        |
| typescript, vite         | CCA           |
| tailwindcss@4            | CCA           |
| shadcn/ui + lucide-react | CCA           |
| exceljs                  | fusion        |
| jspdf + jspdf-autotable  | CCA           |
| **recharts**             | **nouveau v3**|
| date-fns                 | CCA           |
| sonner                   | CCA           |
| clsx + tailwind-merge    | CCA           |

### Server
| Package                       | Source        |
|-------------------------------|---------------|
| express@5                     | fusion        |
| typescript + tsx               | FDF           |
| @neondatabase/serverless       | CCA           |
| **drizzle-orm + drizzle-kit** | **nouveau v3**|
| bcryptjs                       | fusion        |
| jsonwebtoken                   | fusion        |
| zod@4                          | FDF           |
| helmet + morgan + rate-limit   | FDF           |
| **nodemailer**                 | **Phase 2**   |
| ~~better-sqlite3~~             | supprimé      |
| ~~firebase~~                   | supprimé      |

---

## 5 règles d'architecture

**1. `features/` = seul endroit avec des composants métier**
Chaque feature ne dépend que de `api/` et `ui/`. Les features ne s'importent jamais entre elles.

**2. `api/` = seul endroit qui appelle `fetch()`**
Les composants React passent par `api/referees.ts`, jamais `fetch()` directement. Le token JWT est injecté une seule fois dans `api/client.ts`.

**3. `ui/` = aucune logique métier**
Primitives pures et réutilisables. Zéro appel API, zéro state global, zéro import de `features/`.

**4. `types.ts` = source de vérité TypeScript unique**
Importé par `api/` ET par `features/`. Synchronisé avec `server/src/db/schema.ts`. Si un champ change en base, il change dans les deux.

**5. `server/routes/` = aucun SQL**
Les routes valident (Zod) puis délèguent à `db/`. Toutes les requêtes Drizzle vivent uniquement dans `server/src/db/`.

---

## Variables d'environnement (`.env.example`)

```env
DATABASE_URL=postgresql://...@...neon.tech/neondb?sslmode=require
JWT_SECRET=changez-moi-openssl-rand-base64-32
PORT=3000
NODE_ENV=development

# Phase 2 — Emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre@email.com
SMTP_PASS=app-password
```

## Scripts root (`package.json`)

```json
{
  "scripts": {
    "dev":     "concurrently \"npm --prefix server run dev\" \"npm --prefix client run dev\"",
    "build":   "npm --prefix client run build && npm --prefix server run build",
    "start":   "node server/dist/index.js",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx server/src/db/seed.ts"
  }
}
```
