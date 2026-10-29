# GeoCheckin 📍

GeoCheckin est une application web progressive (PWA) open-source conçue pour faciliter l'émargement autonome des volontaires (Jambaar 26) lors des événements au Stade Abdoulaye Wade de Dakar.

## 🚀 Fonctionnalités Clés

- **Authentification Simple :** Connexion rapide via le Code Volontaire.
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
- [Docker](https://www.docker.com/) et Docker Compose
- [Git](https://git-scm.com/)

## ⚙️ Installation et Lancement (Environnement Local)

**1. Cloner le dépôt**
```bash
git clone https://github.com/sunday-oyeniyi6/geocheckin.git
cd geocheckin
```

**2. Configurer les variables d'environnement**
Copiez le fichier d'exemple et ajustez les variables si nécessaire :
```bash
cp .env.example .env
```

**3. Démarrer la base de données (PostGIS)**
```bash
docker-compose up -d db
```

**4. Initialiser Prisma et la Base de données**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

**5. Lancer l'application**

- **Backend (NestJS) :** `npm run start:dev` (dans le dossier `/backend`)
- **Frontend (Next.js) :** `npm run dev` (dans le dossier `/frontend` après un `npm install`)
