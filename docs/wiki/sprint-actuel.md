# Sprint actuel — HomeCycl'Home

Ce fichier est mis à jour à chaque début de sprint.
Il représente l'état courant du développement.

---

## Sprint 0 — Fondations (Mars)

**Objectif :** Sécuriser le socle technique avant le démarrage du développement.

**Statut :** ✅ Terminé

---

### Réalisé

**DevOps & Infrastructure**

- [x] Dépôt GitHub configuré (branches `main`, `dev`, `feature/*`)
- [x] Conventional Commits enforced (Husky + Commitlint)
- [x] ESLint + Prettier configurés (frontend + backend)
- [x] Pipeline CI/CD GitHub Actions opérationnelle
- [x] Docker Compose prod + staging configurés
- [x] VPS déployé — Nginx hôte + Certbot (SSL)
- [x] Domaines actifs : prod + staging

**Architecture & Structure**

- [x] Structure frontend feature-based en place
- [x] Structure backend NestJS modulaire en place
- [x] SCSS global configuré (variables, mixins, reset, fonts)
- [x] AuthContext provider initialisé

**Conception**

- [x] Maquette page d'accueil (desktop + mobile)
- [x] Design system défini (couleurs, typographie)
- [x] Configuration IA — CLAUDE.md (racine, frontend, backend)
- [x] Wiki projet initialisé

---

## Sprint 1 — Authentification & Cycles (Avril)

**Objectif :** Permettre à un utilisateur de créer un compte, se connecter
et gérer ses cycles.

**Statut :** 🔄 En cours

---

### User stories — Gestion des utilisateurs (HOM-164)

| Ticket   | Story                          | Statut       |
| -------- | ------------------------------ | ------------ |
| HOM-221  | S'authentifier (login/logout)  | ✅ Terminé   |
| HOM-226  | Créer un compte utilisateur    | ✅ Terminé   |
| HOM-231  | Gérer son profil               | ⏳ À faire   |
| HOM-236  | Administrer les utilisateurs   | ⏳ À faire   |
| HOM-241  | Supprimer son compte           | ⏳ À faire   |

### User stories — Gestion des cycles client (HOM-165)

| Ticket   | Story                          | Statut       |
| -------- | ------------------------------ | ------------ |
| HOM-246  | Administrer les types de cycles| ⏳ À faire   |
| HOM-251  | Gérer ses cycles               | ⏳ À faire   |

---

### Objectifs techniques du sprint

**HOM-221 + HOM-226 — Auth complète (✅ Terminé)**
- [x] Schéma Prisma — modèle `Utilisateur` + migration
- [x] PrismaService injectable + DatabaseModule global
- [x] Module auth — register, confirm-email, login, logout
- [x] JWT access token (15min) + refresh token (7j) en cookies HttpOnly
- [x] Email de confirmation via Nodemailer + Mailpit en dev
- [x] Validation des DTOs via `class-validator`
- [x] Guards JWT + Strategy Passport
- [x] `authService.ts` — register(), logout()
- [x] Hooks `useRegister`, `useLogout`
- [x] Composant `RegisterForm` + SCSS
- [x] Pages `LoginPage`, `RegisterPage`, `ConfirmEmailPage`
- [x] Routing `/login`, `/inscription`, `/confirmer-email`
- [x] Header — logout câblé sur `useLogout`
- [x] Tests Jest — AuthService (11 tests)

**HOM-231 — Gérer son profil (⏳ À faire)**
- [ ] Endpoint `GET /api/users/me` — retourner les infos du profil
- [ ] Endpoint `PATCH /api/users/me` — modifier prénom, nom, téléphone
- [ ] Page `ProfilPage` + formulaire frontend

**HOM-236 — Administrer les utilisateurs (⏳ À faire)**
- [ ] Endpoint `GET /api/admin/users` — lister tous les utilisateurs (admin only)
- [ ] Endpoint `PATCH /api/admin/users/:id` — modifier rôle / statut

**HOM-241 — Supprimer son compte (⏳ À faire)**
- [ ] Endpoint `DELETE /api/users/me` — suppression + déconnexion

**HOM-246 — Administrer les types de cycles (⏳ À faire)**
- [ ] Schéma Prisma — modèle `TypeCycle`
- [ ] CRUD `TypeCycle` (admin only)

**HOM-251 — Gérer ses cycles (⏳ À faire)**
- [ ] Schéma Prisma — modèle `Cycle`
- [ ] Endpoints CRUD cycle (client authentifié)
- [ ] Page frontend liste + formulaire ajout/modification

---

### Jalon associé

**J3** — fin avril : Authentification et gestion des cycles fonctionnelles.

---

## Prochains sprints

| Sprint   | Période | Objectif principal                       |
| -------- | ------- | ---------------------------------------- |
| Sprint 2 | Mai     | Prestations + zones géographiques        |
| Sprint 3 | Juin    | Planification + création d'interventions |
| Sprint 4 | Juillet | Suivi, paiement, clôture                 |
