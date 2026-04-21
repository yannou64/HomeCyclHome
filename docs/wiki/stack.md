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
Complété par : bcrypt, class-validator, CORS, rate limiting, HTTPS obligatoire.

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

## Tests

**Jest + Supertest (approche TDD)**

- Jest : tests unitaires sur les règles métier critiques
- Supertest : tests d'intégration API
- Exécution automatique dans la pipeline GitHub Actions
- Un échec bloque le déploiement
