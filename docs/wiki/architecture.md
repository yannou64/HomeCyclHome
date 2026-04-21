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
│       ├── components/     # Composants spécifiques
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

- Services NestJS : orchestrent les use cases
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
│   ├── cycle/                   # Gestion des cycles client
│   ├── intervention/            # Gestion des interventions
│   └── planning/                # Créneaux et planification
│
├── shared/
│   ├── database/                # Module base de données
│   └── prisma/                  # PrismaService injectable
│
└── test/                        # Tests d'intégration Supertest
```

### Structure interne d'une feature

```
features/<nom>/
├── <nom>.module.ts              # Déclaration du module NestJS
├── <nom>.controller.ts          # Routes HTTP — délègue au service
├── <nom>.service.ts             # Logique applicative (use case)
├── dto/
│   ├── create-<nom>.dto.ts      # Validation des données en entrée
│   └── update-<nom>.dto.ts
├── entities/
│   └── <nom>.entity.ts          # Entité du domaine
└── <nom>.spec.ts                # Tests unitaires Jest
```

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
