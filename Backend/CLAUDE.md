# CLAUDE.md — Backend HomeCycl'Home

Ce fichier complète le `CLAUDE.md` racine avec les spécificités du Backend.
Il est lu automatiquement par Claude Code quand tu travailles dans ce dossier.

---

## 1. Stack Backend

| Outil               | Usage                                         |
| ------------------- | --------------------------------------------- |
| NestJS + TypeScript | Framework API REST                            |
| Prisma              | ORM — accès base de données                   |
| PostgreSQL          | Base de données relationnelle                 |
| JWT + Refresh Token | Authentification stateless                    |
| Cookie HttpOnly     | Stockage sécurisé des tokens (protection XSS) |
| bcrypt              | Hashage des mots de passe                     |
| class-validator     | Validation des DTOs                           |
| Jest + Supertest    | Tests unitaires et d'intégration API          |

---

## 2. Architecture — Clean Architecture pragmatique NestJS

Séparation stricte entre trois couches :

- **Domaine** : entités, règles métier, interfaces
- **Application** : use cases, DTOs, orchestration
- **Infrastructure** : Prisma, HTTP controllers, services externes

**Règle fondamentale :** la logique métier ne dépend jamais de l'infrastructure.
Un use case ne doit pas importer Prisma directement.

---

## 3. Structure des dossiers

```
src/
├── app/                         # Noyau NestJS
│   ├── app.module.ts            # Module racine
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts                  # Bootstrap + config cookies, CORS, pipes
│
├── config/                      # Configuration globale (env, JWT, cookies...)
│
├── features/                    # Modules métier (un dossier = un module NestJS)
│   ├── auth/                    # Authentification
│   ├── cycle/                   # Gestion des cycles client
│   ├── intervention/            # Gestion des interventions
│   └── planning/                # Créneaux et planification
│
├── shared/                      # Éléments transversaux
│   ├── database/                # Module Prisma partagé
│   └── prisma/                  # PrismaService injectable
│
└── test/                        # Tests d'intégration globaux (Supertest)
```

**Structure interne d'une feature (pattern à respecter) :**

```
features/<nom>/
├── <nom>.module.ts
├── controllers/
│   └── <nom>.controller.ts              # HTTP uniquement — délègue aux use cases
├── use-cases/
│   ├── get-<nom>.use-case.ts            # 1 fichier = 1 opération métier
│   ├── create-<nom>.use-case.ts
│   ├── update-<nom>.use-case.ts
│   ├── delete-<nom>.use-case.ts
│   └── *.use-case.spec.ts               # Test unitaire colocalisé avec le use case
├── repositories/
│   ├── <nom>.repository.interface.ts    # Contrat TypeScript (interface)
│   └── <nom>.prisma.repository.ts       # Implémentation Prisma
└── dto/
    ├── input/     # DTOs validés avec class-validator (données entrantes)
    └── output/    # DTOs de réponse (jamais le modèle Prisma brut)
```

**Référence :** le module `admin` est l'implémentation de référence de ce pattern.

---

## 4. Conventions de code

**Nommage :**

- Modules/Controllers/Services : `PascalCase` avec suffixe explicite
- DTOs : `PascalCase` préfixé `Create` | `Update` | `Response`
- Fichiers : `kebab-case` (ex: `intervention.service.ts`)
- Variables/fonctions : `camelCase`

**DTOs :**

- Toujours valider avec `class-validator` (`@IsString()`, `@IsEmail()`...)
- Toujours transformer avec `class-transformer`
- Ne jamais exposer le `password_hash` dans un DTO de réponse

**Controllers :**

- Responsabilité unique : recevoir la requête HTTP, appeler le use case, retourner la réponse
- Pas de logique métier dans un controller
- Injectent les use cases (pas le repository directement)

**Use Cases :**

- Une classe = une opération métier (ex: `CreateUserUseCase`)
- Dépendent d'une interface repository — jamais de `PrismaService` directement
- Lancent des exceptions NestJS (`NotFoundException`, `ConflictException`...)
- Contiennent toute la logique métier : vérifications, règles, transformations

**Repository :**

- L'interface (`<nom>.repository.interface.ts`) définit le contrat : quelles méthodes existent
- L'implémentation (`<nom>.prisma.repository.ts`) contient les appels Prisma réels
- Le module fait le lien via un token d'injection (voir `admin.module.ts` comme référence)
- Ce découplage permet de remplacer Prisma par un appel HTTP (microservice futur)
  sans toucher à la logique des use cases

---

## 5. Sécurité

**Authentification JWT + Cookie HttpOnly :**

- Le `access_token` et le `refresh_token` sont envoyés en cookie `HttpOnly`
- Configuration cookie : `httpOnly: true`, `secure: true`, `sameSite: 'strict'`
- Ne jamais retourner le token dans le body de la réponse
- Le renouvellement du token se fait via un endpoint dédié `/auth/refresh`

**RBAC (Role Based Access Control) :**

- Trois rôles : `client` | `technicien` | `admin`
- Utiliser des Guards NestJS pour protéger les routes (`@UseGuards(JwtAuthGuard, RolesGuard)`)
- Décorer les routes avec `@Roles('admin')` etc.
- Un client ne peut accéder qu'à ses propres ressources

**Autres mesures :**

- Mots de passe hashés avec `bcrypt` (jamais stockés en clair)
- Validation systématique des entrées via `ValidationPipe` global
- CORS configuré pour n'autoriser que le domaine frontend
- Rate limiting sur les endpoints sensibles (auth notamment)
- Aucune donnée bancaire stockée — paiement physique uniquement

---

## 6. Prisma

- `PrismaService` est injectable via `shared/prisma/`
- Le schéma Prisma est défini dans `prisma/schema.prisma` à la racine du Backend
- Toujours utiliser les transactions Prisma pour les opérations critiques
  (ex: créer une intervention ET marquer le créneau indisponible en une seule transaction)
- Ne jamais exposer les modèles Prisma bruts en réponse API — toujours passer par un DTO

**Règle critique :**
La création d'une intervention et la mise à jour de `is_disponible = false` sur le créneau
doivent être atomiques (transaction Prisma) pour éviter les conflits de réservation.

---

## 7. Stratégie de tests (TDD)

- **Écrire les tests avant le code** sur les règles métier critiques
- Tests unitaires Jest : dans chaque feature (`<nom>.spec.ts`)
- Tests d'intégration Supertest : dans `test/`
- Priorités de test :
    - Gestion des créneaux (disponibilité, conflits)
    - Vérification de zone géographique
    - Contrôle des rôles (RBAC)
    - Création d'intervention (transaction atomique)

---

## 8. Règles métier critiques à ne pas contourner

- Un créneau ne peut être réservé que si `is_disponible = true`
- L'adresse client doit être dans une zone active avant toute réservation
- La durée d'une intervention est déterminée par le forfait — non modifiable par le client
- Un technicien ne peut voir que les interventions de sa zone
- Un client ne peut accéder qu'à ses propres interventions et cycles
- Le statut d'une intervention suit ce flux strict :
  `Planifiée` → `Terminée` | `Annulée`
