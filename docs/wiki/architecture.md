---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Architecture — HomeCycl'Home

Description de l'architecture applicative frontend et backend.
Consulter ce fichier avant toute décision structurelle.

---

## Vue d'ensemble

Application web découplée :

- **Frontend** : React SPA servi par Nginx
- **Backend** : API REST NestJS
- **Communication** : HTTP/JSON via Axios (frontend → backend)
- **Auth** : Cookie HttpOnly (JWT) géré automatiquement par le navigateur

```
Client navigateur
      ↓
  Frontend React (Nginx)
      ↓ API REST
  Backend NestJS
      ↓
  PostgreSQL (Prisma)
```

---

## Frontend — Architecture feature-based

```
src/
├── app/                    # Noyau applicatif
│   ├── config/             # Constantes, variables d'environnement
│   ├── providers/
│   │   └── authContext/    # Contexte auth global (AuthContext, useAuth)
│   ├── router/             # Routes React Router + PrivateRoute
│   ├── styles/             # SCSS global (_variables, _mixins, _reset, _fonts...)
│   ├── App.tsx
│   └── main.tsx
│
├── assets/                 # Images, fonts, icônes
│
├── features/               # Modules métier (feature-based)
│   └── <feature>/
│       ├── components/     # Composants groupés par domaine métier
│       │   ├── layout/     # Composants de structure (Layout, Sidebar...)
│       │   ├── <entité>/   # Composants d'une entité (table, dialogs...)
│       │   └── ...
│       ├── hooks/          # Hooks spécifiques
│       ├── services/       # Appels API spécifiques
│       └── types/          # Types TypeScript spécifiques
│
├── pages/                  # Pages (1 fichier = 1 route)
│
└── shared/                 # Éléments transversaux
    ├── components/         # Composants génériques réutilisables
    ├── hooks/              # Hooks génériques
    ├── services/           # Instance Axios, intercepteurs JWT
    ├── types/              # Types globaux partagés
    └── utils/              # Fonctions utilitaires pures
```

**Règle de tri :**

- Spécifique à une feature → `features/<nom>/`
- Réutilisable entre plusieurs features → `shared/`
- Une page orchestre des composants de `features/` et `shared/`

**Pattern de flux de données :**

```
Page → Composant → Hook → Service → API Backend
```

---

## Backend — Clean Architecture NestJS

### Les trois couches

**Infrastructure** (couche externe)

- Controllers NestJS : reçoivent les requêtes HTTP
- PrismaService : accès base de données
- Services externes : Google Maps

**Application** (couche intermédiaire)

- Use cases : une classe = une opération métier, dépendent des interfaces repository
- DTOs : valident et transforment les données entrantes/sortantes
- Guards : contrôlent l'accès (JWT, RBAC)

**Domaine** (couche interne)

- Entités : représentent les concepts métier
- Règles métier : logique indépendante de l'infrastructure

**Règle fondamentale : les couches internes ne dépendent jamais des couches externes.**

### Structure des dossiers

```
src/
├── app/                         # Module racine NestJS
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts                  # Bootstrap, cookies, CORS, pipes globaux
│
├── config/                      # Configuration (env, JWT, cookies)
│
├── features/                    # Modules métier
│   ├── auth/                    # Authentification + JWT
│   ├── admin/                   # Administration (users CRUD, RBAC, stats)
│   ├── referentiel/             # Données de référence partagées
│   │   ├── marques/             # CRUD Marque (admin only)
│   │   └── type-cycles/         # CRUD TypeCycle (admin only)
│   ├── users/                   # Profil utilisateur (client)
│   ├── cycle/                   # Gestion des cycles client (HOM-251)
│   ├── adresses/                # Carnet d'adresses client (HOM-300)
│   ├── zones/                   # Zones géographiques + vérification point-in-polygon
│   ├── affectations/            # Affectation technicien ↔ zone
│   ├── forfaits/                # Catalogue des prestations + historique des prix
│   ├── planning/                # Modèles de planification, pauses, indisponibilités, créneaux
│   ├── intervention/            # Réservation, annulation, upload photos
│   └── email/                   # Service technique d'envoi d'emails (pas de controller)
│
├── shared/
│   ├── database/                # Module base de données
│   ├── prisma/                  # PrismaService injectable
│   ├── guards/                  # RolesGuard (RBAC)
│   ├── decorators/               # @Roles()
│   └── storage/                 # StorageService — upload AWS S3
│
└── test/                        # Configuration Jest e2e (aucun test d'intégration écrit à ce jour)
```

**Note :** `email` et `referentiel` sont des features réduites/techniques (pas de règles métier propres) — voir [[01 - features/index]] pour le détail de toutes les features, dont les dépendances croisées entre modules.

### Structure interne d'une feature

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
│   └── *.use-case.spec.ts               # Test unitaire colocalisé
├── repositories/
│   ├── <nom>.repository.interface.ts    # Contrat TypeScript (interface)
│   └── <nom>.prisma.repository.ts       # Implémentation Prisma
└── dto/
    ├── input/     # DTOs validés avec class-validator (données entrantes)
    └── output/    # DTOs de réponse (jamais le modèle Prisma brut)
```

**Référence :** le module `admin` (users) et `referentiel` (marques, type-cycles) sont les implémentations de référence de ce pattern.

### Convention : feature vs référentiel

- **Feature autonome** (`auth`, `users`, `cycle`…) : domaine avec règles métier propres, cycle de vie, complexité
- **Référentiel** (`referentiel/marques`, `referentiel/type-cycles`…) : données de configuration simples (`id` + `libelle`), administrées par l'admin mais **lues par tous les domaines**. Ne pas les placer dans `admin/` pour éviter le couplage inter-features.

### Convention : double controller dans un module référentiel

Un module référentiel peut exposer **deux controllers distincts** selon l'audience :
- `admin-<nom>.controller.ts` → CRUD complet, `@Roles('admin')`
- `referentiel-<nom>.controller.ts` → lecture seule `GET`, `JwtAuthGuard` uniquement (accessible aux clients)

Exemple : `GET /referentiel/marques` et `GET /referentiel/type-cycles` permettent au frontend client de peupler les selects du formulaire cycle sans accès admin.

### Convention : ownership dans les use cases client

Pour toute feature où un client gère **ses propres ressources** (cycles, interventions…) :
- Le controller extrait le `userId` du token JWT via `req.user`
- Le use case reçoit `userId` en paramètre et vérifie l'ownership avant toute mutation
- `ForbiddenException` si le `utilisateurId` de la ressource ≠ `userId` courant
- `NotFoundException` si la ressource n'existe pas
- Le repository `include` les relations nécessaires pour que le DTO retourné soit complet (jamais de modèle Prisma brut)

---

## Sécurité — flux d'authentification

```
1. POST /auth/login
   → NestJS vérifie les credentials
   → Génère access_token + refresh_token
   → Les envoie en cookie HttpOnly (jamais dans le body)

2. Requêtes suivantes
   → Le navigateur envoie automatiquement les cookies
   → JwtAuthGuard valide le token
   → RolesGuard vérifie le rôle

3. POST /auth/refresh
   → Renouvelle l'access_token silencieusement
```

---

## Sécurité — durcissement HTTP (ajouté 2026-07-12)

- **Helmet** (`config/helmet.config.ts`) : headers HTTP de sécurité (CSP, HSTS, X-Frame-Options…) appliqués globalement dans `main.ts`.
- **Rate limiting** (`@nestjs/throttler`, `config/throttler.config.ts`) : 100 req/min globalement (`ThrottlerGuard` en `APP_GUARD`), 5 req/min sur les routes sensibles de `auth` (`register`, `confirm-email`, `login`, `refresh`).
- **Swagger** (`@nestjs/swagger`) : documentation interactive sur `/api-docs`, désactivée en production, protégée par cookie `access_token` en environnement non-prod.
- **Upload de fichiers** : `StorageModule`/`StorageService` (`shared/storage/`) — upload vers AWS S3, filtre MIME (JPEG/PNG/WebP) et limite de taille (30 Mo/fichier, 5 fichiers max) appliqués au niveau du controller `intervention`.

---

## Infrastructure de déploiement

```
Internet (HTTPS)
      ↓
Nginx hôte + Certbot (SSL)
      ↓
  ┌─────────────────────────────┐
  │ Stack Production (port 8081)│
  │  Nginx interne              │
  │    /     → Frontend React   │
  │    /api  → Backend NestJS   │
  │  PostgreSQL (volume isolé)  │
  └─────────────────────────────┘
  ┌─────────────────────────────┐
  │ Stack Staging (port 8080)   │
  │  (même structure)           │
  └─────────────────────────────┘
```

- Production : `homecyclhome.yannickbiot.fr`
- Staging : `staging.homecyclhome.yannickbiot.fr`
- Aucun code source sur le VPS — uniquement des images Docker

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
