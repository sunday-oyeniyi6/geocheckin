# Contexte du Projet : GeoCheckin

**Description :**
"GeoCheckin" est un module d'émargement autonome (Self Check-In) 100% open-source, de type PWA. Il permet aux volontaires (Jambaar 26) de valider leur présence directement depuis leur propre smartphone lors de leur arrivée au Stade Abdoulaye Wade. C'est un projet Civic Tech indépendant et **non officiel** : aucune connexion avec la plateforme officielle des volontaires, ni dépendance à un planning de shifts pré-enregistré.

**Parcours Volontaire :**

1. **Inscription (une seule fois) :** prénom, nom, code volontaire et numéro de téléphone. GeoCheckin tient son propre registre de volontaires.
2. **Connexion (à chaque émargement) :** le volontaire saisit uniquement son code. S'il existe, la session est ouverte ; sinon l'application propose de créer un compte (code pré-rempli).
3. **Émargement :** date du jour (serveur, fuseau Africa/Dakar), photo du badge d'accréditation, signature manuscrite et capture silencieuse des coordonnées GPS (Geofencing anti-triche).

Le code volontaire n'est pas un secret : l'anti-triche repose sur le geofencing, la photo du badge et la signature, contrôlés par le manager.

**Formats :**

| Champ           | Règle                                                           | Exemple                          |
| --------------- | --------------------------------------------------------------- | -------------------------------- |
| Code volontaire | `^\d{6}-\d{2}$`, unique                                         | `012346-00`                      |
| Prénom / nom    | 2–50 caractères, lettres (accents), espaces, `-` et `'`         | `Aïssatou`, `N'Diaye`            |
| Téléphone       | Mobile sénégalais (70, 75, 76, 77, 78), unique, stocké en E.164 | `77 123 45 67` → `+221771234567` |

Ces règles existent dans `backend/src/common/formats.ts` et `frontend/src/lib/formats.ts` : toujours modifier les deux.

**Données et rétention :**

- Toutes les données (comptes, émargements, photos, signatures) sont conservées **jusqu'à la fin des Jeux**, puis supprimées.
- Chaque jour, un fichier tableur des émargements est généré et déposé sur OneDrive pour le manager.

**Stack Technique :**

- **Infrastructure :** Docker Compose, déploiement sur VPS OVHcloud.
- **Base de données :** PostgreSQL avec l'extension spatiale PostGIS.
- **Backend :** NestJS avec Prisma ORM.
- **Frontend :** Next.js (PWA mobile-first), React, Tailwind CSS, `react-signature-canvas`, Geolocation API HTML5.

**État de l'Architecture (Modèles Prisma) :**

1. `PointOfInterest` (Polygon) : Stocke la délimitation géographique exacte du Stade Abdoulaye Wade.
2. `Volunteer` : Registre des volontaires (code unique, prénom, nom, téléphone unique).
3. `Attendance` (Point) : Enregistre l'émargement (volontaire, date, URL photo, URL signature, coordonnées GPS) — un seul par volontaire et par jour.

**Logique Spécifique (Règles pour l'IA) :**

- Privilégier une approche Mobile-First stricte pour le frontend.
- Les requêtes de validation spatiale dans le backend NestJS doivent utiliser des requêtes brutes PostGIS (`ST_Contains` ou `ST_DWithin`) via `$queryRaw` de Prisma.
- Fournir du code en TypeScript avec un typage strict.
- Session : JWT court dans un cookie `httpOnly` / `SameSite=Strict` ; ne jamais stocker de données volontaire dans `localStorage` / `sessionStorage`.

**Workflow Git (Règles pour l'IA) :**

- Ne jamais faire de `commit` ni de `push` soi-même. À la fin de chaque tâche, fournir le message de commit proposé.
- Ne jamais travailler directement sur la branche `develop`. Toujours créer une nouvelle branche avant de commencer, et demander le numéro de l'issue GitHub associée à la fonctionnalité/tâche.

### Convention de nommage des branches

| Type                   | Pattern                   | Exemple                         |
| ---------------------- | ------------------------- | ------------------------------- |
| Issue GitHub numérotée | `feature/geocheckin#XX`   | `feature/geocheckin#12`         |
| Correctif ciblé        | `feature/fix-description` | `feature/fix-geofencing-radius` |
| Fonctionnalité         | `feature/description`     | `feature/badge-photo-capture`   |

## Tests et couverture

```bash
npm test                # tests unitaires Jest
```
