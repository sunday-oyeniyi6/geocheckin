# GeoCheckin 📍

GeoCheckin est une application web progressive (PWA) open-source conçue pour faciliter l'émargement autonome des volontaires (Jambaar 26) lors des événements au Stade Abdoulaye Wade de Dakar.

## 🚀 Fonctionnalités Clés

- **Inscription unique :** prénom, nom, code volontaire et téléphone.
- **Connexion par code :** saisie du seul code volontaire (format `012346-00`) ; inscription proposée si le compte n'existe pas.
- **Validation Temporelle Anti-Triche :** Verrouillage du calendrier sur la date du jour.
- **Geofencing PostGIS :** Validation stricte de la position physique du volontaire à l'intérieur ou à proximité immédiate du stade.
- **Capture de Preuves :** Prise de photo du badge d'accréditation et signature électronique manuscrite.
- **PWA Mobile-First :** Interface optimisée pour une utilisation fluide sur smartphone.

## 🛠️ Stack Technique

- **Frontend :** Next.js, React, Tailwind CSS, React Signature Canvas
- **Backend :** NestJS, Prisma ORM
- **Base de données :** PostgreSQL + PostGIS
- **Infrastructure :** Docker, Docker Compose

## 📦 Prérequis

- [Node.js](https://nodejs.org/) (v20+)
- [Docker](https://www.docker.com/) et Docker Compose v2
- [Git](https://git-scm.com/)

## 🗂️ Structure du dépôt

```text
geocheckin/
├── backend/             # API NestJS + Prisma (PostGIS)
├── frontend/            # PWA Next.js (App Router) + Tailwind CSS
├── docker-compose.yml   # Base PostgreSQL + PostGIS
└── .env.example         # Variables d'environnement (un seul .env à la racine)
```

## ⚙️ Installation et Lancement (Environnement Local)

**1. Cloner le dépôt**

```bash
git clone https://github.com/sunday-oyeniyi6/geocheckin.git
cd geocheckin
```

**2. Configurer les variables d'environnement**

Un seul fichier `.env` à la racine est utilisé par Docker, le backend et le frontend :

```bash
cp .env.example .env
```

> PostGIS est exposé sur le port `5433` pour ne pas entrer en conflit avec un PostgreSQL local.

**3. Démarrer la base de données (PostGIS)**

```bash
docker compose up -d db
docker compose exec db psql -U geocheckin -d geocheckin -c "SELECT PostGIS_Version();"
```

**4. Initialiser Prisma et la base de données**

```bash
cd backend
npm install          # lance aussi `prisma generate` (postinstall)
npx prisma db push   # crée les tables PointOfInterest et Attendance
```

> Le `.env` contient aussi le secret de session `JWT_SECRET` : en production, générez-en un avec `openssl rand -base64 48`.

**5. Lancer l'application**

- **Backend (NestJS) :** `npm run start:dev` dans `/backend` → <http://localhost:3001/health>
- **Frontend (Next.js) :** `npm install && npm run dev` dans `/frontend` → <http://localhost:3000>

## 🔌 API

| Méthode | Route          | Description                                                      |
| ------- | -------------- | ---------------------------------------------------------------- |
| `GET`   | `/health`      | État de l'API et de la base                                      |
| `POST`  | `/volunteers`  | Inscription (`firstName`, `lastName`, `code`, `phone`) + session |
| `POST`  | `/auth/login`  | Connexion par `code` ; `404 VOLUNTEER_NOT_FOUND` si inconnu      |
| `GET`   | `/auth/me`     | Volontaire connecté + `checkedInToday`                           |
| `POST`  | `/auth/logout` | Fermeture de la session                                          |

La session est un JWT dans le cookie `httpOnly` `geocheckin_session`. `/auth/login` et `/volunteers` sont limités à `THROTTLE_LIMIT` requêtes par `THROTTLE_TTL_MS` et par IP.

## 🔐 Variables d'environnement

| Variable                            | Description                                           |
| ----------------------------------- | ----------------------------------------------------- |
| `POSTGRES_*`, `DATABASE_URL`        | Connexion PostGIS                                     |
| `BACKEND_PORT`, `FRONTEND_URL`      | Port de l'API, origine autorisée (CORS)               |
| `JWT_SECRET`                        | Secret de signature des sessions (fort en production) |
| `JWT_TTL`                           | Durée de session en secondes (défaut 900)             |
| `THROTTLE_TTL_MS`, `THROTTLE_LIMIT` | Limitation de débit (défaut 30 requêtes / minute)     |
| `NEXT_PUBLIC_API_URL`               | URL de l'API appelée par le frontend                  |

## 🧪 Tests et qualité

| Commande            | Backend | Frontend | Description                                                       |
| ------------------- | :-----: | :------: | ----------------------------------------------------------------- |
| `npm test`          |   ✅    |    ✅    | Tests unitaires Jest                                              |
| `npm run test:e2e`  |   ✅    |          | Tests e2e (base démarrée ; données de test `99xxxx-xx` nettoyées) |
| `npm run test:cov`  |   ✅    |    ✅    | Couverture de code                                                |
| `npm run lint`      |   ✅    |    ✅    | ESLint                                                            |
| `npm run typecheck` |         |    ✅    | Vérification TypeScript                                           |
| `npm run build`     |   ✅    |    ✅    | Build de production                                               |
