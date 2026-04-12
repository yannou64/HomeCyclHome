# Log des décisions — HomeCycl'Home

Journal chronologique append-only des décisions techniques et organisationnelles.
Ne jamais modifier ou supprimer une entrée existante — uniquement ajouter.

Format : `## [YYYY-MM-DD] <type> | <titre>`
Types : `decision` | `changement` | `apprentissage` | `configuration`

---

## [2026-04-12] changement | Intégration du composant Footer

Création du composant Footer avec ses styles SCSS dédiés et intégration dans la page `Home`. Mise à jour des styles globaux (`_base.scss`, `_reset.scss`) pour assurer la cohérence visuelle (fond brun foncé, liens légaux, copyright LeCycleLyonnais).
Fichiers concernés : `shared/components/Footer/Footer.tsx`, `Footer.module.scss`, `pages/Home.tsx`, `app/styles/_base.scss`, `app/styles/_reset.scss`

---

## [2026-04-12] changement | Implémentation du composant Header et MobileMenu

Création du header principal avec navigation responsive : version desktop (logo + liens Connexion/S'inscrire) et version mobile via un drawer orange (`MobileMenu`). Ajout d'icônes SVG utilitaires (email, téléphone, œil ouvert/fermé) et mise à jour du `LoginForm` associé.
Fichiers concernés : `shared/components/Header/Header.tsx`, `MobileMenu/MobileMenu.tsx`, `features/auth/components/LoginForm/LoginForm.tsx`, `app/styles/_variables.scss`

---

## [2026-04-11] changement | Ajout en cours du module d'authentification frontend

Mise en place des fondations de l'authentification côté React : `AuthContext`, `ProtectedRoute`, `LoginForm`, hook `useLogin`, `authService` et client API centralisé (`apiClient.ts`).
Fichiers concernés : `authContext/AuthContext.tsx`, `ProtectedRoute.tsx`, `features/auth/`, `shared/services/apiClient.ts`

---

## [2026-04-09] configuration | Validation du hook post-commit wiki

Vérification du bon fonctionnement du hook Git post-commit chargé de mettre à jour automatiquement `docs/wiki/log.md` après chaque commit.
Fichiers concernés : `.claude/settings.json` (hook), `docs/wiki/log.md`

---

## [2026-04-09] configuration | Mise en place de l'environnement IA

Configuration de Claude Code CLI comme agent de développement principal.
- Création des fichiers CLAUDE.md (racine, frontend, backend)
- Initialisation du wiki projet dans `docs/wiki/`
- Livrables placés dans `docs/annexes/`

---

## [2026-03-00] decision | Architecture découplée React + NestJS retenue

Architecture SPA React + API REST NestJS choisie pour la séparation claire
frontend/backend et la cohérence avec le référentiel CDA.
Alternative écartée : Next.js (fullstack trop couplé pour les objectifs pédagogiques).

---

## [2026-03-00] decision | PostgreSQL + Prisma retenus

PostgreSQL pour la robustesse et la gestion des contraintes relationnelles.
Prisma pour la génération automatique de types TypeScript.
Alternative écartée : TypeORM (typage moins strict).

---

## [2026-03-00] decision | JWT stocké en cookie HttpOnly

Les tokens JWT (access + refresh) sont stockés en cookie HttpOnly.
Raison : protection XSS — le token est inaccessible au JavaScript.
Impact frontend : pas de gestion manuelle du token dans Axios,
le navigateur l'envoie automatiquement.

---

## [2026-03-00] decision | Infrastructure VPS avec deux stacks Docker isolées

Deux environnements Docker Compose (prod port 8081, staging port 8080)
sur le même VPS pour optimiser les coûts tout en maintenant l'isolation.
Nginx hôte + Certbot gèrent le SSL et le routage par sous-domaine.

---

## [2026-03-00] decision | SCSS Modules choisi à la place de Tailwind

Styles scopés par composant via SCSS Modules.
Tokens centralisés dans `src/app/styles/_variables.scss`.
Raison : meilleure maîtrise du CSS, cohérence avec les maquettes Figma.