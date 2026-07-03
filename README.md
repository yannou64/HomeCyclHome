# HomeCycl'Home

> Application de réservation d'interventions de réparation et d'entretien de vélos à domicile.
> Projet de certification CDA — LeCycleLyonnais

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

## Présentation

HomeCycl'Home permet aux clients de réserver un technicien à domicile pour réparer ou entretenir leur vélo. L'application couvre le cycle complet : validation de l'adresse client via Google Maps, vérification de la zone couverte, sélection du forfait et du créneau, création de l'intervention, puis paiement physique à l'issue de la prestation.

## Démonstration

| Environnement     | URL                                                  |
|-------------------|------------------------------------------------------|
| Production        | https://homecyclhome.yannickbiot.fr                  |
| Staging           | https://staging.homecyclhome.yannickbiot.fr          |
| Documentation API | http://localhost:3000/api-docs *(local)*             |

## Rôles utilisateurs

| Rôle          | Responsabilités                                                      |
|---------------|----------------------------------------------------------------------|
| `client`      | Réserve et suit ses interventions                                    |
| `technicien`  | Réalise et clôture les interventions affectées à sa zone             |
| `admin`       | Configure les zones, forfaits, planning et supervise l'activité      |

## Architecture

```
┌─────────────────────┐        API REST        ┌──────────────────────┐
│   Frontend React    │ ◄────────────────────► │   Backend NestJS     │
│   Vite · TypeScript │     JWT HttpOnly cookie │   Clean Architecture │
└─────────────────────┘                        └──────────┬───────────┘
                                                          │
                                          ┌───────────────┼───────────────┐
                                          ▼               ▼               ▼
                                    PostgreSQL        AWS S3          Google Maps
                                    (Prisma)          (photos)        (géoloc)
```

Séparation stricte en trois couches : **Domaine** (entités, règles) · **Application** (use cases) · **Infrastructure** (Prisma, HTTP, services externes).

## Stack technique

| Couche          | Technologie                  | Décision                                             |
|-----------------|------------------------------|------------------------------------------------------|
| Frontend        | React 18 + Vite + TypeScript | SPA performante, typage strict bout en bout          |
| Backend         | NestJS + Clean Architecture  | Modules découplés, use cases testables en isolation  |
| Base de données | PostgreSQL + Prisma           | Schéma centralisé, migrations versionnées            |
| Auth            | JWT + cookies HttpOnly        | Token inaccessible au JavaScript — protection XSS   |
| Géolocalisation | Google Maps Platform          | Geocoding + vérification zone par polygone           |
| Déploiement     | Docker + GitHub Actions       | CI/CD automatisé sur VPS Ubuntu (prod + staging)     |

## Lancer le projet en local

### Prérequis

- Node.js 20+
- PostgreSQL (ou Docker)
- Copier et renseigner les variables d'environnement :
  - `Backend/.env` (voir `.env.example`)
  - `Frontend/.env` (voir `.env.example`)

### Backend

```bash
cd Backend
npm install
npx prisma migrate dev
npm run start:dev
# → API disponible sur http://localhost:3000
# → Swagger sur http://localhost:3000/api-docs
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
# → Interface disponible sur http://localhost:5173
```

## Documentation

| Document | Contenu |
|---|---|
| [Documentation API](http://localhost:3000/api-docs) | 68 endpoints documentés — Swagger UI interactif *(local)* |
| [Architecture](docs/wiki/architecture.md) | Structure des couches, modules NestJS, conventions |
| [Domaine métier](docs/wiki/metier.md) | Entités, règles métier, flux de réservation |
| [Choix techniques](docs/wiki/stack.md) | Justification de chaque technologie retenue |
| [Journal de décisions](docs/wiki/log.md) | Décisions architecturales horodatées (append-only) |

## Tests

```bash
cd Backend
npm run test          # tests unitaires (Jest)
npm run test:e2e      # tests d'intégration (Supertest)
```

Les tests s'exécutent automatiquement à chaque push via GitHub Actions. Un échec bloque le déploiement.

---

*Yannick Biot · LeCycleLyonnais · Certification CDA 2025–2026*
