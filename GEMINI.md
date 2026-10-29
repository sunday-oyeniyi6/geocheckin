# Contexte du Projet : GeoCheckin

**Description :**
"GeoCheckin" est un module d'émargement autonome (Self Check-In) 100% open-source, de type PWA. Il permet aux volontaires (Jambaar 26) de valider leur présence directement depuis leur propre smartphone lors de leur arrivée au Stade Abdoulaye Wade. C'est un projet Civic Tech indépendant, sans dépendance à un planning de shifts pré-enregistré.

**Périmètre des Données & Fonctionnalités :**
Le système gère des émargements instantanés et sécurisés. Il traite et valide de manière stricte :

- Le code volontaire.
- La date (verrouillée sur la date du jour du serveur).
- Les médias (capture de la photo du badge d'accréditation et pad de signature électronique manuscrite).
- La capture silencieuse des coordonnées GPS (Geofencing anti-triche).

**Stack Technique :**

- **Infrastructure :** Docker Compose, déploiement sur VPS OVHcloud.
- **Base de données :** PostgreSQL avec l'extension spatiale PostGIS.
- **Backend :** NestJS avec Prisma ORM.
- **Frontend :** Next.js (PWA mobile-first), React, Tailwind CSS, `react-signature-canvas`, Geolocation API HTML5.

**État de l'Architecture (Modèles Prisma) :**

1. `PointOfInterest` (Polygon) : Stocke la délimitation géographique exacte du Stade Abdoulaye Wade.
2. `Attendance` (Point) : Enregistre l'émargement (code volontaire, date, URL photo, URL signature, coordonnées GPS).

**Logique Spécifique (Règles pour l'IA) :**

- Privilégier une approche Mobile-First stricte pour le frontend.
- Les requêtes de validation spatiale dans le backend NestJS doivent utiliser des requêtes brutes PostGIS (`ST_Contains` ou `ST_DWithin`) via `$queryRaw` de Prisma.
- Fournir du code en TypeScript avec un typage strict.
