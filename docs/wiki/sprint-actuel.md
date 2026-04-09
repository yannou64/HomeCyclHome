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

| ID    | Story                         | Points | Statut     |
| ----- | ----------------------------- | ------ | ---------- |
| US-01 | S'authentifier (login/logout) | 3      | ⏳ À faire |
| US-02 | Créer un compte client        | 3      | ⏳ À faire |
| US-03 | Gérer son profil              | 2      | ⏳ À faire |
| US-04 | Ajouter / modifier un cycle   | 3      | ⏳ À faire |
| US-05 | Lister ses cycles             | 1      | ⏳ À faire |

---

### Objectifs techniques du sprint

- Implémenter le module `auth` (backend) — JWT + cookies HttpOnly
- Implémenter le module `cycle` (backend)
- Implémenter les écrans login, inscription, profil (frontend)
- Implémenter la liste et la gestion des cycles (frontend)
- Écrire les tests Jest sur les règles d'authentification (TDD)

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
