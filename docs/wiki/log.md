# Log des décisions — HomeCycl'Home

Journal chronologique append-only des décisions techniques et organisationnelles.
Ne jamais modifier ou supprimer une entrée existante — uniquement ajouter.

Format : `## [YYYY-MM-DD] <type> | <titre>`
Types : `decision` | `changement` | `apprentissage` | `configuration`

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