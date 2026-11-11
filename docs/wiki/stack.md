---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Stack technique — HomeCycl'Home

Justification des choix techniques retenus pour le projet.
Ces choix sont **définitifs** — ne pas les remettre en question sans raison majeure.
Référence complète → `docs/annexes/Livrable_HomeCyclehome.pdf` section 2. 2.
Cahier des charges initial → `docs/annexes/CDC_HomeCyclehome.pdf`

---

## Frontend

**React + Vite + TypeScript**
Architecture découplée retenue pour la séparation claire frontend/backend,
la lisibilité architecturale et la cohérence avec une API REST NestJS.

**SCSS Modules**
Styles scopés par composant. Les tokens du design system sont centralisés
dans `src/app/styles/_variables.scss`.

**React Router**
Routing SPA côté client avec protection des routes par rôle (`PrivateRoute`).

**FullCalendar (version gratuite)**
Affichage des créneaux disponibles par technicien (vue jour/semaine/mois).
Retenu pour sa maturité, sa richesse fonctionnelle et son intégration React.

---

## Backend

**NestJS + TypeScript**
Retenu pour son architecture modulaire native, son système avancé de gestion
des rôles et sa cohérence avec le frontend React (même écosystème TypeScript).

**Clean Architecture pragmatique**
Séparation domaine / application / infrastructure.
Permet la testabilité (TDD) et l'évolutivité du projet.

---

## Base de données

**PostgreSQL**
Retenu pour sa robustesse, sa gestion avancée des contraintes et transactions,
et sa compatibilité avec l'écosystème Node/NestJS.
Modèle fortement relationnel — cohérent avec les entités du domaine.

**Prisma**
ORM retenu pour la génération automatique de types TypeScript, son schéma
centralisé et sa meilleure sécurité à la compilation vs TypeORM.

---

## Sécurité

**JWT + Refresh Token + Cookie HttpOnly**
Authentification stateless adaptée à une API REST découplée.
Les tokens sont stockés en cookie `HttpOnly` (inaccessible au JS — protection XSS).
Complété par : bcrypt, class-validator, CORS, Helmet, rate limiting, HTTPS obligatoire.

**Helmet**
Headers de sécurité HTTP (X-Frame-Options, HSTS, CSP...) posés via middleware
Express dans `main.ts`. CSP stricte en production ; désactivée hors production
pour ne pas bloquer Swagger UI (déjà désactivé en production).

**@nestjs/throttler (rate limiting)**
`ThrottlerGuard` enregistré globalement (`APP_GUARD`) : 100 req/min/IP par défaut
sur toute l'API. Limite resserrée à 5 req/min/IP via `@Throttle()` sur les routes
auth non authentifiées (`register`, `confirm-email`, `login`, `refresh`) pour
limiter le brute-force et le spam de comptes.

**RBAC (Role Based Access Control)**
Trois rôles : `client` | `technicien` | `admin`.
Implémenté via Guards NestJS (JwtAuthGuard + RolesGuard).

---

## Géolocalisation

**Google Maps Platform**
Retenu pour la précision du géocodage, l'autocomplétion et la stabilité
de l'écosystème. Utilisé pour valider les adresses et vérifier les zones.
APIs utilisées : Geocoding API + Maps JavaScript API (Autocomplete).

---

## DevOps

**GitHub + GitHub Actions**
CI/CD via un fichier `ci-cd.yml` unique.

- Push `feature/*` ou `dev` → lint + tests
- Push `dev` → déploiement staging
- Push `main` → déploiement production

**Docker + Docker Compose**
Conteneurisation production uniquement.
Deux stacks isolées sur le même VPS (prod port 8081, staging port 8080).
Images publiées sur GitHub Container Registry (`ghcr.io/yannou64`).

**Nginx + Certbot**
Nginx hôte gère la terminaison SSL et le routage vers les stacks Docker.
Certbot gère les certificats Let's Encrypt automatiquement.

---

## Stockage de fichiers

**AWS S3 (Simple Storage Service)**
Retenu pour le stockage des photos d'intervention (client et technicien).
Bucket `homecyclhome-images` en région `eu-west-3` (Paris).
Pattern choisi : **backend proxy** — le backend reçoit les fichiers via Multer, les valide
(MIME, taille), les pousse vers S3 via `@aws-sdk/client-s3`, puis persiste les URLs en base.
Les credentials AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) restent côté serveur.

**Multer**
Middleware multipart/form-data intégré à NestJS via `@nestjs/platform-express`.
Utilisé pour parser les fichiers entrants (`FilesInterceptor`).
Configuration : max 5 fichiers par upload, 30 Mo par fichier,
MIME filter (`image/jpeg`, `image/png`, `image/webp`).

---

## Tests

**Jest + Supertest (approche TDD)**

- Jest : tests unitaires sur les règles métier critiques
- Supertest : tests d'intégration API
- Exécution automatique dans la pipeline GitHub Actions
- Un échec bloque le déploiement

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
