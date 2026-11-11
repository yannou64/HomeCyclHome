# HomeCycl'Home — Backend

API REST NestJS de l'application HomeCycl'Home (réservation d'interventions de réparation et
d'entretien de vélos à domicile). Voir le [README racine](../README.md) pour la présentation
générale du projet.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Jest](https://img.shields.io/badge/Jest-TDD-C21325?logo=jest)

## Architecture

Clean Architecture pragmatique adaptée à NestJS — trois couches (domaine, application,
infrastructure), organisées autour d'une règle unique : la logique métier ne dépend jamais de
l'infrastructure. Chaque feature suit le même pattern :

```
features/<nom>/
├── controllers/     # HTTP uniquement — délègue aux use cases
├── use-cases/       # 1 fichier = 1 opération métier, testée en isolation
├── repositories/     # Interface (contrat) + implémentation Prisma
└── dto/              # input/ (validés class-validator) et output/
```

Détails complets : [`CLAUDE.md`](./CLAUDE.md) (conventions) et
[`docs/wiki/architecture.md`](../docs/wiki/architecture.md) (structure détaillée).

## Prérequis

- Node.js 20+
- PostgreSQL 16 (ou via Docker)

## Variables d'environnement

Copier `.env.example` vers `.env` et renseigner les valeurs :

```bash
cp .env.example .env
```

| Variable                | Description                                                        |
|--------------------------|---------------------------------------------------------------------|
| `NODE_ENV`               | `development` \| `production` — désactive Swagger en production    |
| `PORT`                   | Port d'écoute de l'API (défaut `3000`)                              |
| `DATABASE_URL`           | Chaîne de connexion PostgreSQL, utilisée par Prisma                 |
| `JWT_ACCESS_SECRET`      | Secret de signature de l'access token (15 min)                      |
| `JWT_REFRESH_SECRET`     | Secret de signature du refresh token (7 jours)                      |
| `FRONTEND_URL`           | URL du frontend — CORS et liens dans les emails transactionnels     |
| `MAIL_HOST`              | Hôte SMTP                                                            |
| `MAIL_PORT`              | Port SMTP                                                            |
| `MAIL_USER`              | Identifiant SMTP                                                     |
| `MAIL_PASS`              | Mot de passe SMTP                                                    |
| `MAIL_FROM`              | Adresse d'expédition des emails transactionnels                     |
| `AWS_REGION`              | Région AWS du bucket S3 (photos d'intervention)                     |
| `AWS_S3_BUCKET`           | Nom du bucket S3                                                     |
| `AWS_ACCESS_KEY_ID`       | Identifiant de clé AWS — lu automatiquement par le SDK AWS          |
| `AWS_SECRET_ACCESS_KEY`   | Clé secrète AWS — lue automatiquement par le SDK AWS                |

## Installation et lancement

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

- API disponible sur `http://localhost:3000/api`
- Documentation Swagger sur `http://localhost:3000/api-docs` (hors production)

## Scripts disponibles

```bash
npm run start:dev     # démarrage en mode watch
npm run build          # compilation TypeScript
npm run start:prod     # démarrage depuis le build (dist/)
npm run lint            # ESLint avec correction automatique
npm run format          # Prettier
```

## Tests (TDD)

```bash
npm run test           # tests unitaires (Jest) — un fichier .spec.ts par use case
npm run test:watch     # mode watch
npm run test:cov       # couverture de code
npm run test:e2e       # tests d'intégration (Supertest)
```

Les tests s'exécutent automatiquement sur chaque push via GitHub Actions ; un échec bloque le
déploiement.

## Documentation

| Document | Contenu |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | Conventions de code, architecture, sécurité, règles métier |
| [`docs/wiki/architecture.md`](../docs/wiki/architecture.md) | Structure des dossiers, modules NestJS |
| [`docs/wiki/metier.md`](../docs/wiki/metier.md) | Entités, règles métier, MCD/MLD |
| Swagger UI (`/api-docs`) | Documentation interactive de chaque endpoint |
