# CLAUDE.md — Backend HomeCycl'Home

Complète le `CLAUDE.md` racine avec les conventions du backend. Les règles métier
ne sont pas ici : elles sont dans la spec du vault (racine, section 2).

---

## 1. Stack Backend

| Outil | Usage |
|---|---|
| NestJS + TypeScript | API REST |
| Prisma | ORM — schéma dans `prisma/schema.prisma`, client généré dans `generated/prisma` |
| PostgreSQL | Base de données |
| JWT + refresh token | Authentification stateless, tokens en cookies `HttpOnly` |
| bcrypt | Hash des mots de passe |
| class-validator / class-transformer | Validation et transformation des DTOs |
| Jest | Tests unitaires (`*.spec.ts` colocalisés) |
| Supertest | Tests d'intégration (`test/*.e2e-spec.ts`) — première brique V2, en cours |

---

## 2. Architecture — Clean Architecture pragmatique

- **Domaine** : règles métier pures, sans dépendance.
- **Application** : use cases, DTOs, orchestration.
- **Infrastructure** : repositories Prisma, controllers HTTP, services externes.

**Règle fondamentale :** la logique métier ne dépend jamais de l'infrastructure. Un
use case n'importe jamais Prisma.

---

## 3. Structure

```
src/
├── app/          # app.module.ts, main.ts (bootstrap : cookies, CORS, pipes, Swagger)
├── config/       # cookie, helmet, jwt, throttler
├── features/     # un dossier = un module NestJS métier
└── shared/       # domain/ (règles métier transverses), prisma/, database/, guards/ (RolesGuard), decorators/ (@Roles), storage/ (S3), dto/
test/             # configuration et tests d'intégration Supertest
```

La liste des modules se lit dans `src/features/` et `src/app/app.module.ts` — elle
n'est pas recopiée ici.

**Structure interne d'une feature (pattern à respecter) :**

```
features/<nom>/
├── <nom>.module.ts                       # câblage DI : token → implémentation Prisma
├── controllers/<nom>.controller.ts       # HTTP uniquement, délègue aux use cases
├── domain/                               # règles pures partagées (optionnel)
│   ├── <regle>.ts                        # aucun import Nest/Prisma, entrée → sortie
│   └── <regle>.spec.ts
├── use-cases/
│   ├── <verbe>-<nom>.use-case.ts         # 1 fichier = 1 opération métier
│   └── <verbe>-<nom>.use-case.spec.ts    # test unitaire colocalisé
├── repositories/
│   ├── <nom>.repository.interface.ts     # contrat
│   └── <nom>.prisma.repository.ts        # implémentation Prisma
└── dto/
    ├── input/                            # validés par class-validator
    └── output/                           # jamais le modèle Prisma brut
```

**Référence du pattern :** module `admin`.

**Quand créer un `domain/` :** seulement pour une règle qui est métier (pas
technique), partagée par plusieurs use cases, et pure. Sinon elle reste dans son use
case. Exemples en place : `planning/domain/creneau-reservable.ts`,
`planning/domain/jour-travail.ts`.

**Où le mettre :**
- règle utilisée par un seul module → `features/<module>/domain/` ;
- règle utilisée par plusieurs modules (fuseau d'exploitation, calcul des blocs,
  concaténation du commentaire partagé…) → `src/shared/domain/`. Mêmes exigences :
  aucun import Nest ni Prisma, un `.spec.ts` à côté.

L'écriture conditionnelle n'est pas une règle pure (elle parle à la base) : son aide
partagée, si elle en a une, va dans `shared/database/`, pas dans `shared/domain/`.

---

## 4. Conventions de code

**Nommage :** modules, controllers et use cases en `PascalCase` suffixé ·
DTOs selon le tableau ci-dessous · fichiers en `kebab-case` · variables et
fonctions en `camelCase`.

**Controllers :** reçoivent la requête, appellent le use case, renvoient la réponse.
Aucune logique métier. Injectent des use cases, jamais un repository.

**Use cases :** une classe = une opération métier. Classe TypeScript **sans
décorateur Nest** (pas d'`@Injectable`) : le module la construit par un `useFactory`
qui lui injecte le repository par son token (voir `admin.module.ts`). C'est ce qui
la garde indépendante du framework et testable avec un simple `new`. Dépendent d'une
interface de repository. Portent toutes les vérifications et règles. Lancent des exceptions
NestJS (`NotFoundException`, `ConflictException`, `ForbiddenException`…).

**Repositories :** l'interface définit le contrat, l'implémentation Prisma les appels
réels, le module relie les deux par un token d'injection (voir `admin.module.ts`).

**DTOs :** toujours validés et transformés. Jamais de `password_hash` ni de modèle
Prisma brut en réponse. Nommage, appliqué à tous les modules :

| Rôle | Classe | Fichier |
|---|---|---|
| Corps de requête | `<Verbe du use case><Ressource>Dto` — `CreateZoneDto`, `SetForfaitPrixDto`, `LoginDto` | `dto/input/create-zone.dto.ts` |
| Paramètres d'URL | `<Verbe><Ressource>QueryDto` — `GetUsersQueryDto` | `dto/input/get-users-query.dto.ts` |
| Réponse | `<Ressource>ResponseDto` — `ZoneResponseDto`, `PaginatedUsersResponseDto` | `dto/output/zone-response.dto.ts` |
| Sous-objet | suffixe du DTO parent : `ZonePointInputDto` en entrée, `ZonePointResponseDto` en sortie | même fichier que le parent |

- Le verbe d'un DTO d'entrée est celui du use case qui le reçoit
  (`SetForfaitPrixUseCase` ↔ `SetForfaitPrixDto`).
- Un fichier par DTO principal ; ses sous-objets et son type interne sans décorateur
  (`CreateAdresseInput`) restent avec lui.
- Le suffixe `Dto` est réservé aux classes exposées par l'API. Un type interne (données
  passées au repository, résultat enrichi) s'appelle sans suffixe
  (`CreneauAvecTechnicien`, `CreateModeleData`) et vit dans l'interface du repository
  ou à côté du DTO qu'il étend.

---

## 5. Patterns techniques V2 (obligatoires)

Ces patterns sont la traduction technique de la spec (glossaire « Écritures » du
vault). Les règles qu'ils servent restent dans la spec.

**Transaction « tout ou rien ».** Quand la séquence d'une US place plusieurs
écritures dans une transaction, elles vivent dans **une seule méthode du
repository**, via `prisma.$transaction(async (tx) => { … })`. Le use case appelle
cette méthode ; il ne voit jamais `tx`. Exemples en place, **pour la forme de la
transaction seulement** : `forfaits/repositories/forfaits.prisma.repository.ts`,
`intervention/repositories/interventions.prisma.repository.ts`. ⚠️ Dans ce dernier,
le `updateMany` des créneaux n'est **pas** conditionnel (dette V1, refondue par la
réservation V2) : ne pas le recopier. Aucune écriture conditionnelle n'existe encore
dans le code ; la brique partagée est posée au socle V2.

**Écriture conditionnelle.** Une écriture qui dépend d'un état attendu se fait par
`updateMany({ where: { id, <état attendu> }, data })` et **lit `count`** :
- `count === 1` → la condition était remplie ;
- `count === 0` → l'état a changé entre-temps : lancer une exception dans la
  transaction (rollback automatique). Le repository renvoie l'information, le use
  case traduit en exception métier (`ConflictException`).

C'est ce qui règle deux requêtes simultanées sur le même objet. Ne jamais remplacer
par « lire puis écrire » sans condition.

**Fuseau d'exploitation.** Les dates sont stockées en UTC ; **tout calcul de jour se
fait dans le fuseau d'exploitation, jamais en UTC.** Passer par un utilitaire
partagé, jamais par `getDate()`, `setHours()`, `getDay()`, leurs variantes UTC
(`setUTCHours(0, 0, 0, 0)`, `getUTCDate()`, `getUTCDay()`…) ou
`toISOString().slice(0, 10)`. Les use cases V1 de `planning` bornent encore les
journées avec `setUTCHours` : dette V1, pas un modèle. Base
existante : `planning/domain/jour-travail.ts` (`jourTravail`,
`bornesDuJourTravail`) — à déplacer dans `shared/domain/` au socle V2.

**Une règle dense = un seul endroit.** Un calcul partagé par plusieurs use cases (par
exemple le calcul des blocs, utilisé par la réservation et la création par l'admin)
se code une fois, dans un `domain/`, et se teste seul.

**Erreurs de base de données.** Une contrainte violée (clé étrangère, unicité) ne
doit jamais finir en erreur 500 brute : la vérifier dans le use case ou traduire
l'erreur Prisma en exception métier.

---

## 6. Sécurité

**Authentification :** `access_token` et `refresh_token` en cookies
`httpOnly: true, secure: true, sameSite: 'strict'`. Jamais de token dans le corps
d'une réponse. Renouvellement via `/auth/refresh`.

**RBAC :** routes protégées par `@UseGuards(JwtAuthGuard, RolesGuard)` +
`@Roles(...)`. Le rôle ne suffit pas : **le use case vérifie que la ressource
appartient à l'utilisateur** quand la spec le demande (un client et ses
interventions, un technicien et les siennes).

**Autres mesures en place :**
- `ValidationPipe` global (`whitelist`, `transform`).
- CORS limité au domaine frontend (`FRONTEND_URL`).
- `helmet` (`src/config/helmet.config.ts`) : CSP stricte en production, désactivée
  hors production pour Swagger UI.
- Rate limiting `@nestjs/throttler` global (`src/config/throttler.config.ts`),
  resserré par `@Throttle()` sur les routes d'authentification non connectées.
- `trust proxy` à 2 dans `main.ts` (deux reverse proxies en production).
- Aucune donnée bancaire stockée.

---

## 7. Prisma

- `PrismaService` injectable via `shared/prisma/`.
- Cycle : modifier `schema.prisma` → `npx prisma migrate dev --name <nom>` → client
  régénéré.
- Les migrations V1 sont abandonnées au socle V2 (base réinitialisée, voir
  `Refonte 2.0`).
- Le nom Prisma fait foi côté code quand il diffère du MCD.

---

## 8. Tests

**Convention de nommage (obligatoire) :** `describe` = nom exact de l'US, chaque
`it` commence par le `CAnn` de la note et finit par son étiquette `[RG…]` — voir le
`CLAUDE.md` racine, section 3. **Un critère, un test** : un seul `it` par `CAnn`
(`verifier-ca.py` signale un critère testé deux fois). Un critère trop large pour un
seul test est un écart de spec à signaler, pas une raison de le dédoubler.

**Où va un test :**

| Ce que le critère vérifie | Type | Emplacement |
|---|---|---|
| Une règle pure (calcul, validation) | Unitaire | `domain/<regle>.spec.ts` |
| La logique d'un use case (vérifications, exceptions) | Unitaire, repository simulé | `use-cases/*.use-case.spec.ts` |
| Une transaction, une écriture conditionnelle, une concurrence, une clé étrangère, un droit d'accès de bout en bout | Intégration, PostgreSQL réel | `test/*.e2e-spec.ts` |

Un test unitaire sur simulacre ne prouve rien des contraintes de la base : un
critère qui en dépend exige un test d'intégration.

**Commandes :**
```bash
npm test            # unitaires
npm run test:e2e    # intégration (base de test dédiée)
```

**Tests d'intégration :** première brique de la V2, en cours de mise en place avec
Yannick. Cette section sera complétée (base de test, garde-fou, helpers) quand elle
sera construite.
