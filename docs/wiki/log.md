# Log des décisions — HomeCycl'Home

Journal chronologique append-only des décisions techniques et organisationnelles.
Ne jamais modifier ou supprimer une entrée existante — uniquement ajouter.

Format : `## [YYYY-MM-DD] <type> | <titre>`
Types : `decision` | `changement` | `apprentissage` | `configuration`

---

## [2026-04-19] configuration | Correction des problèmes de pipeline CI/CD

Résolution des erreurs bloquant la pipeline GitHub Actions : ajustements du workflow `ci-cd.yml` et corrections dans `auth.service.spec.ts` pour que les tests Jest passent en environnement CI.
Fichiers concernés : `.github/workflows/ci-cd.yml`, `Backend/src/features/auth/services/auth.service.spec.ts`

---

## [2026-04-19] fix | Suppression de l'import useNavigate inutilisé dans useRegister

Retrait de l'import `useNavigate` non utilisé dans le hook `useRegister.ts`, corrigeant un warning TypeScript/ESLint. Le hook n'effectue pas de navigation après inscription — il délègue ce comportement au composant appelant.
Fichiers concernés : `Frontend/src/features/auth/hooks/useRegister.ts`

---

## [2026-04-19] changement | Authentification frontend complète + tests unitaires AuthService

Intégration finale du cycle auth côté React : `RegisterForm` (mise en page 2 colonnes, SCSS dédié), hooks `useRegister` et `useLogout`, `authService`, pages `LoginPage` / `RegisterPage` / `ConfirmEmailPage`, routage dans `App.tsx`. Corrections backend associées : `main.ts` (prefix `/api`), `cookie.config.ts` (path refresh token), `PrismaService`. Tests unitaires Jest : 11 cas couvrant `register`, `confirmEmail`, `login`, `logout` dans `auth.service.spec.ts`.
Fichiers concernés : `features/auth/hooks/useRegister.ts`, `useLogout.ts`, `authService.ts`, `RegisterForm/`, `pages/LoginPage.tsx`, `RegisterPage.tsx`, `ConfirmEmailPage.tsx`, `App.tsx`, `Header.tsx`, `auth.service.ts`, `auth.service.spec.ts`, `main.ts`, `cookie.config.ts`, `prisma.service.ts`

---

## [2026-04-19] changement | Diagrammes de séquence — Login & Register

Création des diagrammes de séquence pour les flux Login et Register dans le cadre de la préparation à la présentation CDA. Chaque diagramme couvre deux niveaux : macro (Navigateur / React App / NestJS API / BDD / SMTP) et micro (acteurs internes : LoginForm, useLogin, authService, apiClient, AuthController, AuthService, JwtService, PrismaService). Les flux d'erreurs sont représentés en fragments `alt` : email en double (409), DTO invalide (400), mot de passe incorrect (401), compte inactif (403). Stratégie retenue : 5-6 diagrammes pour les flux complexes uniquement (Login, Register, Créer intervention, Vérification zone).

---

## [2026-04-19] fix | Corrections bugs post-intégration frontend/backend

Trois corrections suite aux tests manuels en navigateur :
- `main.ts` — ajout de `setGlobalPrefix('api')` : toutes les routes préfixées `/api/*` pour correspondre à `VITE_API_URL` et à la config Nginx en production
- `ConfirmEmailPage.tsx` — ajout d'un `useRef` comme verrou pour éviter le double appel API causé par React Strict Mode (l'effet s'exécutait deux fois, consommant le token puis échouant sur le second appel)
- `cookie.config.ts` — correction du `path` du cookie `refresh_token` : `/auth/refresh` → `/api/auth/refresh` pour correspondre au préfixe global

Fichiers concernés : `src/app/main.ts`, `Frontend/src/pages/ConfirmEmailPage.tsx`, `src/config/cookie.config.ts`

---

## [2026-04-19] changement | Tests Jest AuthService + logs NestJS

Ajout du Logger NestJS dans `AuthService` (niveaux `log`/`warn` par méthode, token tronqué à 8 caractères pour la sécurité). Création de `auth.service.spec.ts` avec 11 tests unitaires couvrant les 4 méthodes : `register` (2), `confirmEmail` (3), `login` (4), `logout` (1). Pattern de mock : `Test.createTestingModule` + `jest.spyOn(...).mockResolvedValue(...)`. Mock de `Response` Express via fonction utilitaire `mockRes()`. Tâche "Tests Jest" du Sprint 1 cochée.

Fichiers concernés : `src/features/auth/services/auth.service.ts`, `src/features/auth/services/auth.service.spec.ts`

---

## [2026-04-16] changement | Finalisation du cycle d'authentification frontend

Complétion du cycle auth côté React : hook `useRegister` + composant `RegisterForm` (2 colonnes prénom/nom, confirm password, case CGU, message succès), pages `LoginPage` / `RegisterPage` / `ConfirmEmailPage`, routing `/login`, `/inscription`, `/confirmer-email` dans `App.tsx` (lazy + Suspense). Hook `useLogout` câblé sur `POST /auth/logout` avec pattern `try/finally` (déconnexion locale garantie même en cas d'erreur réseau). Header mis à jour pour consommer `useLogout` au lieu de `logout` direct depuis `useAuth`.

Points notables :
- `ConfirmEmailPage` initialise son état depuis le token URL (`useState(token ? 'loading' : 'error')`) pour éviter un setState synchrone dans useEffect
- `useLogout` adopte le pattern `try/catch/finally` : l'appel API peut échouer sans bloquer la déconnexion locale
- Le `RegisterForm` ne navigue pas après inscription — il affiche un message de succès invitant à vérifier la boîte mail

Fichiers concernés : `features/auth/hooks/useRegister.ts`, `features/auth/hooks/useLogout.ts`, `features/auth/components/RegisterForm/`, `pages/LoginPage.tsx`, `pages/RegisterPage.tsx`, `pages/ConfirmEmailPage.tsx`, `app/App.tsx`, `shared/components/Header/Header.tsx`

---

## [2026-04-14] changement | Implémentation complète du backend authentification

Mise en place de l'intégralité du module auth backend : schéma Prisma (modèle `Utilisateur`), PrismaService injectable, DatabaseModule global, configuration JWT/cookies, EmailModule (Nodemailer + Mailpit), DTOs de validation, JWT Strategy Passport, AuthService (register/confirmEmail/login/logout), AuthController et AuthModule. Mise à jour de `main.ts` (cookieParser, CORS, ValidationPipe) et `AppModule`.

Points notables :
- `tsconfig.json` migré de `nodenext` vers `commonjs` (incompatibilité NestJS CLI + webpack)
- `nest-cli.json` — ajout de `entryFile: "app/main"` pour respecter l'architecture custom (`src/app/`)
- `prisma.config.ts` exclu de la compilation NestJS via `tsconfig.build.json`
- Architecture feature-based respectée : `controllers/`, `services/`, `modules/`, `strategies/`, `guards/` dans `features/auth/`
- Flux testé manuellement et validé : register → email Mailpit → confirm → login → cookies posés

Fichiers concernés : `prisma/schema.prisma`, `src/shared/prisma/`, `src/shared/database/`, `src/config/`, `src/features/email/`, `src/features/auth/`, `src/app/main.ts`, `src/app/app.module.ts`, `nest-cli.json`, `tsconfig.json`, `tsconfig.build.json`

---

## [2026-04-12] changement | Intégration de PageLayout, Carousel et HeroBrand

Création et intégration de trois composants partagés : `PageLayout` (structure de mise en page commune), `Carousel` (galerie défilante) et `HeroBrand` (bloc hero identitaire). Assemblage dans la page `Home`.
Fichiers concernés : `pages/Home.tsx`, `shared/components/PageLayout/`, `shared/components/Carousel/`, `shared/components/HeroBrand/`

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