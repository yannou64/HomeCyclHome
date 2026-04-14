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

### User stories

| ID    | Story                         | Points | Statut              |
| ----- | ----------------------------- | ------ | ------------------- |
| US-01 | S'authentifier (login/logout) | 3      | 🔄 Backend ✅ / Frontend ⏳ |
| US-02 | Créer un compte client        | 3      | 🔄 Backend ✅ / Frontend ⏳ |
| US-03 | Gérer son profil              | 2      | ⏳ À faire          |
| US-04 | Ajouter / modifier un cycle   | 3      | ⏳ À faire          |
| US-05 | Lister ses cycles             | 1      | ⏳ À faire          |

---

### Objectifs techniques du sprint

**Backend (✅ Terminé)**
- [x] Schéma Prisma — modèle `Utilisateur` + migration
- [x] PrismaService injectable + DatabaseModule global
- [x] Module auth — register, confirm-email, login, logout
- [x] JWT access token (15min) + refresh token (7j) en cookies HttpOnly
- [x] Email de confirmation via Nodemailer + Mailpit en dev
- [x] Validation des DTOs via `class-validator`
- [x] Guards JWT + Strategy Passport

**Frontend (🔄 En cours)**
- [ ] `authService.ts` — ajout de `register()`
- [ ] Hook `useRegister`
- [ ] Composant `RegisterForm` + SCSS
- [ ] Page `ConfirmEmailPage`
- [ ] Pages `LoginPage` + `RegisterPage`
- [ ] Routing `App.tsx` — `/login`, `/inscription`, `/confirmer-email`

**Tests**
- [ ] Tests Jest sur les règles d'authentification (TDD)

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
