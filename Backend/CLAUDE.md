# CLAUDE.md — Backend HomeCycl'Home

Complète le `CLAUDE.md` racine avec les conventions du backend. Les règles métier
ne sont pas ici : elles sont dans la spec du vault (racine, section 2).

---

## 1. Stack Backend

| Outil | Usage |
|---|---|
| NestJS + TypeScript | API REST |
| Prisma 7 | ORM — schéma dans `prisma/schema.prisma`, configuration (URL de la base) dans `prisma.config.ts`, client généré dans `src/generated/prisma` (non versionné) |
| PostgreSQL | Base de données |
| JWT + refresh token | Authentification stateless, tokens en cookies `HttpOnly` |
| bcrypt | Hash des mots de passe |
| class-validator / class-transformer | Validation et transformation des DTOs |
| Jest | Tests unitaires (`*.spec.ts` colocalisés) |
| Supertest | Tests d'intégration (`test/*.e2e-spec.ts`) — première brique V2, en cours |

---

## 2. Architecture — Clean Architecture pragmatique

Monolithe modulaire : un module NestJS = un domaine fonctionnel. Aucun découpage en
micro-services n'est visé. Raisons et compromis : note `Conception - HomeCycl'Home`
du vault, section « Organisation du code backend ».

- **Controller** : le HTTP uniquement (route, guards, DTO, appel du use case).
- **Use case** : une opération métier et toutes ses vérifications.
- **Repository** : interface (contrat) + implémentation Prisma.
- **`shared/domain/`** : règles pures communes à plusieurs modules.

**« Pragmatique » :** on isole l'infrastructure (Prisma, S3, SMTP), pas NestJS. Un use
case n'importe jamais Prisma, mais il utilise Nest normalement : `@Injectable`,
exceptions HTTP, `JwtService`.

---

## 3. Structure

```
src/
├── app/          # app.module.ts, main.ts (bootstrap : cookies, CORS, pipes, Swagger)
├── config/       # cookie, helmet, jwt, password (coût bcrypt), throttler
├── features/     # un dossier = un module NestJS métier
└── shared/       # domain/ (règles pures communes), prisma/, database/, guards/ (JwtAuthGuard, RolesGuard), decorators/ (@Roles), storage/ (S3), dto/, types/ (UserRole). Ne dépend jamais de features/
test/             # configuration et tests d'intégration Supertest
```

La liste des modules se lit dans `src/features/` et `src/app/app.module.ts` — elle
n'est pas recopiée ici.

**Structure interne d'une feature (pattern à respecter) :**

```
features/<nom>/
├── <nom>.module.ts                       # jeton → implémentation Prisma, liste des use cases
├── controllers/<nom>.controller.ts       # HTTP uniquement, délègue aux use cases
├── use-cases/
│   ├── <verbe>-<nom>.use-case.ts         # 1 fichier = 1 opération métier
│   └── <verbe>-<nom>.use-case.spec.ts    # test unitaire colocalisé
├── repositories/
│   ├── <nom>.repository.interface.ts     # contrat + jeton d'injection
│   └── <nom>.prisma.repository.ts        # implémentation Prisma
└── dto/
    ├── input/                            # validés par class-validator
    └── output/                           # jamais le modèle Prisma brut
```

**Référence du pattern :** module `admin`.

**Où mettre une règle pure :** deux emplacements seulement.
- **Par défaut, dans le use case de son module**, même si elle est pure (exemple : le
  *ray casting* de `zones/use-cases/check-zone.use-case.ts`).
- **Dans `src/shared/domain/`**, seulement si la spec la déclare commune à plusieurs
  modules : fuseau d'exploitation, réservabilité d'un créneau, puis calcul des blocs
  et concaténation du commentaire partagé (socle V2). Aucun import Nest, Prisma ni
  `features/` ; un `.spec.ts` à côté. Exemples en place :
  `shared/domain/blocs.ts`, `shared/domain/jour-travail.ts`.

Pas de dossier `domain/` dans un module : « domaine » désigne ici la couche des règles
pures, à ne pas confondre avec un module (domaine fonctionnel).

L'écriture conditionnelle n'est pas une règle pure (elle parle à la base) : son aide
partagée, si elle en a une, va dans `shared/database/`, pas dans `shared/domain/`.

---

## 4. Conventions de code

**Nommage :** modules, controllers et use cases en `PascalCase` suffixé ·
DTOs selon le tableau ci-dessous · fichiers en `kebab-case` · variables et
fonctions en `camelCase`.

**Controllers :** reçoivent la requête, appellent le use case, renvoient la réponse.
Aucune logique métier. Injectent des use cases, jamais un repository.

**Use cases :** une classe = une opération métier, décorée `@Injectable()`. Elle
reçoit le repository par son jeton : `@Inject(USERS_REPO) private readonly repo:
IUsersRepository`, l'interface importée avec `type`. Les autres dépendances
(`JwtService`, un autre use case) s'injectent par leur classe ; une dépendance
réduite par `Pick<EmailService, …>` exige `@Inject(EmailService)`. Le module se
contente de lister la classe. Portent toutes les vérifications et règles, et lancent
des exceptions NestJS (`NotFoundException`, `ConflictException`,
`ForbiddenException`…). Le test unitaire construit le use case avec `new` et un faux
repository. Référence : module `admin`.

**Mots de passe :** hachés dans le use case (`bcrypt`, coût `PASSWORD_HASH_ROUNDS`
de `src/config/password.config.ts`). Le repository ne reçoit jamais un mot de passe
en clair.

**Repositories :** l'interface définit le contrat et déclare le jeton d'injection
(`export const USERS_REPO = 'USERS_REPO'`) ; l'implémentation Prisma fait les appels
réels ; le module relie les deux par `{ provide: USERS_REPO, useClass:
UsersPrismaRepository }`. Le jeton vit dans le fichier d'interface, pas dans le
module : le use case l'importe sans créer d'import circulaire. Le repository renvoie
directement le DTO de sortie (pas d'entité métier intermédiaire, compromis assumé).

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
cette méthode ; il ne voit jamais `tx`. Exemple en place, **pour la forme de la
transaction seulement** : `forfaits/repositories/forfaits.prisma.repository.ts`.

**Écriture conditionnelle.** Une écriture qui dépend d'un état attendu se fait par
`updateMany({ where: { id, <état attendu> }, data })` et **lit `count`** :
- `count === 1` → la condition était remplie ;
- `count === 0` → l'état a changé entre-temps : lancer une exception dans la
  transaction (rollback automatique). Le repository renvoie l'information, le use
  case traduit en exception métier (`ConflictException`).

C'est ce qui règle deux requêtes simultanées sur le même objet. Ne jamais remplacer
par « lire puis écrire » sans condition. Brique partagée :
`shared/database/ecriture-conditionnelle.ts` — `exigerLignesModifiees(resultat,
attendu)` dans la transaction, `estEtatModifieEntreTemps(err)` dans le `catch` du
repository (exemple complet en tête du fichier). Prouvée en concurrence :
`test/ecriture-conditionnelle.e2e-spec.ts`.

**Commentaire partagé.** Chaque ajout à `Interventions.commentaire_technicien` passe
par `entreeCommentaire(maintenant, auteur, texte)` (`shared/domain/commentaire-partage.ts`,
format « JJ/MM/AAAA HH:MM — Auteur : texte », heure de Paris), puis
`ajouterAuCommentaire(tx, interventionId, entree)` (`shared/database/commentaire-partage.ts`),
qui concatène en tête en une requête SQL. Jamais de « lire, concaténer, écrire » en
TypeScript : deux ajouts simultanés perdraient une entrée.

**Fuseau d'exploitation.** Les dates sont stockées en UTC ; **tout calcul de jour se
fait dans le fuseau d'exploitation, jamais en UTC.** Passer par un utilitaire
partagé, jamais par `getDate()`, `setHours()`, `getDay()`, leurs variantes UTC
(`setUTCHours(0, 0, 0, 0)`, `getUTCDate()`, `getUTCDay()`…) ou
`toISOString().slice(0, 10)`. Brique partagée : `shared/domain/jour-travail.ts`,
type `JourCalendaire` (`YYYY-MM-DD`) :
`jourTravail`, `aujourdHui`, `instantDuJour(jour, minutes)` (heure d'horloge de
Paris → instant UTC), `bornesDuJourTravail`, `ajouterJours`, `jourDeSemaine`. Justes
aux changements d'heure (journées de 23 h et 25 h testées).

**Une règle dense = un seul endroit.** Un calcul partagé par plusieurs use cases se
code une fois, dans `shared/domain/`, et se teste seul. **Calcul des blocs** :
`shared/domain/blocs.ts` — `nombreDeCreneaux(duree)` (arrondi au multiple de 30
supérieur), `finArrondie`, `blocsPossibles(creneaux, zoneId, duree)` (blocs
déplacement + N créneaux + déplacement, avec les ids à réserver et les déplacements
réutilisés). Utilisé par la réservation et par la création d'une intervention par
l'admin ; ses tests couvrent CA05 à CA13 de l'US-02 de *Réserver*.

**Erreurs de base de données.** Une contrainte violée (clé étrangère, unicité) ne
doit jamais finir en erreur 500 brute : la vérifier dans le use case ou traduire
l'erreur Prisma en exception métier. Les deux se combinent quand une course est
possible entre le contrôle et l'écriture : le use case contrôle, et le repository
traduit la violation qui survient malgré tout. Brique partagée :
`shared/database/violation-cle-etrangere.ts` — `estViolationCleEtrangere(err)`
(code Prisma `P2003`) dans le `catch` du repository, qui renvoie l'information au
use case (exemple en tête du fichier). Prouvée sur PostgreSQL :
`test/supprimer-compte.e2e-spec.ts`, CA06.

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

- `PrismaService` injectable via `shared/prisma/`. Il construit le client avec
  l'adaptateur `@prisma/adapter-pg` (pilote `pg`) : c'est là, et dans
  `prisma.config.ts` pour le CLI, que se lit `DATABASE_URL`, jamais dans le schéma.
- Variables d'environnement : `Backend/.env` est chargé par `import 'dotenv/config'`
  en première ligne de `src/app/main.ts` pour l'application, et par `prisma.config.ts`
  pour le CLI (Prisma 7 ne le charge plus de lui-même). En Docker, elles viennent du `docker-compose`.
- Import des types et du client : `generated/prisma/client` (chemin relatif depuis
  `src/`), uniquement dans les repositories et `PrismaService`.
- Cycle : modifier `schema.prisma` → `npx prisma migrate dev --name <nom>` →
  `npx prisma generate` (Prisma 7 ne régénère plus le client pendant `migrate dev`).
  Si `migrate dev` demande une remise à zéro de la base, c'est à Yannick de la faire :
  Prisma bloque toute commande destructrice lancée par l'IA. Une migration peut aussi
  s'écrire sans base : `npx prisma migrate diff --from-… --to-schema … --script`.
- Migrations : une seule migration initiale V2, `prisma/migrations/…_init_v2` (les
  migrations V1 sont abandonnées, voir `Refonte 2.0`). Les suivantes s'y ajoutent.
- **Jeu de démonstration** : `npx prisma db seed` (`prisma/seed.ts`). Il vide toutes
  les tables puis insère comptes, zones, forfaits, modèles, créneaux et une
  intervention ; il refuse `NODE_ENV=production`. Le mot de passe des comptes vient de
  `SEED_MOT_DE_PASSE` (`.env`), jamais du code : le dépôt est public. Comptes et
  adresses de test : note `Données de test` du vault. Le seed est exclu du build
  (`tsconfig.build.json`).
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
| Une règle pure commune à plusieurs modules | Unitaire | `shared/domain/<regle>.spec.ts` |
| La logique d'un use case (vérifications, exceptions) | Unitaire, repository simulé | `use-cases/*.use-case.spec.ts` |
| Une transaction, une écriture conditionnelle, une concurrence, une clé étrangère, un droit d'accès de bout en bout | Intégration, PostgreSQL réel | `test/*.e2e-spec.ts` |

Un test unitaire sur simulacre ne prouve rien des contraintes de la base : un
critère qui en dépend exige un test d'intégration.

**Commandes :**
```bash
npm test            # unitaires
npm run test:e2e    # intégration (base de test dédiée)
```

### Banc de tests d'intégration

Une requête HTTP réelle (Supertest) traverse l'application réelle — guards,
controller, use case, repository Prisma — jusqu'à une base PostgreSQL de test.

**Mise en place locale (une fois) :**
1. `createdb homecycl_test` (base vide, même propriétaire que `homecycl`) ;
2. copier `Backend/.env.test.example` en `Backend/.env.test` et y mettre le
   `DATABASE_URL` de `homecycl_test`. Fichier non versionné ; aucune vraie clé
   n'y est nécessaire (email et S3 sont remplacés par des faux).

En CI, le job `test-backend` fournit une base PostgreSQL jetable et les variables
(`.github/workflows/ci-cd.yml`) : pas de `.env.test`.

**Ce qui se passe à `npm run test:e2e` :**
- `test/setup/charger-env-test.ts` charge `.env.test` (prioritaire sur `.env`) et
  applique le **garde-fou** : arrêt si le nom de la base ne finit pas par `_test` ;
- `test/setup/global-setup.ts` applique les migrations manquantes
  (`prisma migrate deploy`), une fois par lancement, sans rien effacer ;
- les fichiers de test s'exécutent l'un après l'autre (`--runInBand`) : ils
  partagent la même base.

**Utilitaires (`test/helpers/`) :**

| Utilitaire | Rôle |
|---|---|
| `creerApplicationDeTest()` | Démarre `AppModule` avec `configurerApplication` (même configuration que `main.ts`) ; `EmailService` et `StorageService` remplacés par des `jest.fn()` consultables (`t.email`, `t.stockage`) ; expose `t.prisma` pour préparer et vérifier la base |
| `viderLaBase(prisma)` | `TRUNCATE … CASCADE` de toutes les tables sauf `_prisma_migrations` ; à appeler en `beforeEach` |
| `creerUtilisateur(prisma, role)` | Utilisateur actif, email unique, mot de passe `MOT_DE_PASSE_DE_TEST` |
| `seConnecter(app, utilisateur)` | Connexion par la vraie route `/api/auth/login`, renvoie les cookies à passer en `.set('Cookie', cookies)` |
| `creerIntervention(prisma, options?)` | Intervention avec tout ce qu'elle exige (client, technicien, cycle, adresse liée, forfait, prix) ; options `statut`, `clientId`, `technicienId` pour réutiliser un utilisateur déjà connecté |
| `creerCycle(prisma, utilisateurId)` · `creerAdresseDe(prisma, utilisateurId)` | Un cycle de l'utilisateur ; une `Adresse` et son lien `PeutSeSituer` (renvoie les deux ids) |

Une fabrique manque pour un test : l'ajouter dans `test/helpers/fabriques.ts`,
écrite directement avec Prisma, jamais par l'API qu'on est en train de tester.

**Écrire un test d'intégration :** fichier `test/<sujet>.e2e-spec.ts`, `describe`
= nom exact de l'US, `it('CAnn — … [RGn]')` (convention section précédente).
Modèle : `test/banc-integration.e2e-spec.ts` (application créée en `beforeAll`,
base vidée en `beforeEach`, `app.close()` en `afterAll`). Il vérifie le banc
lui-même et ne porte pas de `CAnn`.

**Remise à zéro complète de la base de test** (migrations réécrites, base
corrompue) : à la main, par Yannick, jamais par l'IA (Prisma bloque
`migrate reset` lancé par un agent) :
`dropdb homecycl_test && createdb homecycl_test`, puis `npm run test:e2e`, qui
réapplique toutes les migrations.
