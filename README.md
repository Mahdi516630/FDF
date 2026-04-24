# Referee Manager v3
**SDMON · Système de Gestion des Arbitres · Fusion CCA + FDF**

---

## Stack

| Couche | Technologie |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| UI | shadcn/ui + Tailwind + Recharts |
| Backend | Express 5 + TypeScript |
| ORM | Drizzle ORM |
| Base de données | Neon PostgreSQL (serverless) |
| Auth | JWT + bcrypt |
| Export | ExcelJS + jsPDF |
| Déploiement | Render.com (single Web Service) |

---

## Démarrage rapide

### 1. Prérequis
- Node.js ≥ 20
- Compte [Neon](https://neon.tech) (gratuit) → créer une base → copier `DATABASE_URL`

### 2. Installation
```bash
git clone https://github.com/votre-org/referee-manager-v3
cd referee-manager-v3

# Installer toutes les dépendances (root + server + client)
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Variables d'environnement
```bash
cp .env.example .env
# Remplir DATABASE_URL et JWT_SECRET dans .env
```

### 4. Initialiser la base de données
```bash
# Synchroniser le schéma Drizzle sur Neon
npm run db:push

# Insérer les données de démonstration
npm run db:seed
```

### 5. Lancer en développement
```bash
npm run dev
# → Server Express : http://localhost:3000
# → Client Vite :   http://localhost:5173
```

**Compte admin par défaut :** `admin@fdf.dj` / `admin123`

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance server + client en parallèle |
| `npm run build` | Build production client + server |
| `npm start` | Démarre le serveur de production |
| `npm run db:push` | Sync schéma Drizzle → Neon (dev) |
| `npm run db:generate` | Génère les fichiers de migration SQL |
| `npm run db:seed` | Insère les données de démonstration |
| `npm run db:studio` | Ouvre Drizzle Studio (UI base de données) |

---

## Déploiement sur Render.com

1. Créer un **Web Service** sur Render
2. Build command : `npm install && npm --prefix server install && npm --prefix client install && npm run build`
3. Start command : `npm start`
4. Variables d'environnement à configurer :
   - `DATABASE_URL` — URL Neon PostgreSQL
   - `JWT_SECRET` — clé secrète (min 32 chars)
   - `NODE_ENV=production`
   - `CORS_ORIGIN` — URL de votre app Render

---

## Structure du projet

```
referee-manager-v3/
├── server/                 ← Express + Drizzle + Neon
│   └── src/
│       ├── db/             ← schema, client, seed, migrate
│       ├── middleware/     ← auth, admin, approved, errors
│       ├── security/       ← jwt, password
│       ├── validation/     ← Zod schemas
│       └── routes/         ← auth, me, admin, referees, categories, designations, reporting
│
└── client/                 ← React 19 + TypeScript
    └── src/
        ├── api/            ← fetch wrappers (seul endroit avec fetch)
        ├── features/       ← auth, dashboard, referees, categories, designations, reporting, admin
        ├── utils/          ← format, dates
        ├── constants/      ← levels
        └── app/            ← App.tsx (shell)
```

---

## Fonctionnalités

- ✅ Auth JWT avec approbation admin des comptes
- ✅ CRUD Arbitres avec 6 niveaux/grades
- ✅ CRUD Catégories avec 3 tarifs (central, assistant, 4ème)
- ✅ Désignations : 4 arbitres + terrain + observateur + jour + heure
- ✅ Détection de doublon (un arbitre = un seul rôle par match)
- ✅ Dashboard avec graphiques Recharts
- ✅ Rapport "Net à Payer" par arbitre et catégorie
- ✅ Export Excel désignations (format FDF officiel)
- ✅ Export Excel Net à Payer stylisé (ExcelJS)
- ✅ Export PDF rapport (jsPDF + autoTable)
- ✅ Interface responsive (sidebar desktop + nav mobile)
- ✅ Gestion admin des comptes en attente

---

## Développé par SDMON
**Société de Développements de Maintenance et d'Outils Numériques**  
Djibouti · [sdmon.dj](https://sdmon.dj)
