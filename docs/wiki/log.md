---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Log des décisions — HomeCycl'Home

Journal chronologique append-only des décisions techniques et organisationnelles.
Ne jamais modifier ou supprimer une entrée existante — uniquement ajouter.

Format : `## [YYYY-MM-DD] <type> | <titre>`
Types : `decision` | `changement` | `apprentissage` | `configuration`

---

## [2026-08-16] changement | Revue du module planning — gestion multi-technicien et buffer de fin

Refactoring du calcul des créneaux disponibles pour prendre en charge plusieurs techniciens sur une même zone et intégrer un buffer de fin d'intervention. Impacts sur le domaine planning (`creneau-reservable`, `jour-travail`), le use case `get-creneaux-disponibles`, le repository et les DTOs planning, avec répercussions sur le use case `create-intervention` et le tunnel de réservation frontend (`CreneauSelector`, `RecapitulatifStep`, types créneau).
Fichiers concernés : `planning/domain/creneau-reservable.ts`, `planning/use-cases/get-creneaux-disponibles.use-case.ts`, `planning/repositories/planning.prisma.repository.ts`, `planning/dto/planning.dto.ts`, `intervention/use-cases/create-intervention.use-case.ts`, `Frontend/.../CreneauSelector.tsx`, `Frontend/.../reservation/types/creneau.types.ts`

---

## [2026-08-15] changement | Extension des assertions de définition aux DTOs d'entrée

Couverture étendue aux DTOs d'entrée (`input`) en complément du commit précédent sur les DTOs de sortie. Périmètre : 41 fichiers sur 12 modules backend (`admin`, `adresses`, `affectations`, `auth`, `cycle`, `forfaits`, `intervention`, `planning`, `referentiel`, `users`, `zones`) + `shared/dto/pagination-meta`.
Fichiers concernés : ensemble des dossiers `dto/` du backend (DTOs d'entrée + sortie, tous modules)

---

## [2026-08-15] changement | Assertions de définition sur les DTOs de sortie backend

Ajout d'assertions de définition sur l'ensemble des DTOs de sortie backend pour renforcer la sécurité des réponses API (garantie de présence et de typage des propriétés exposées). Périmètre : 17 fichiers couvrant les modules `admin`, `affectations`, `forfaits`, `intervention`, `planning`, `referentiel`, `users`, `zones` et le DTO partagé `pagination-meta`.
Fichiers concernés : dossiers `dto/` de chacun des modules ci-dessus + `Backend/src/shared/dto/pagination-meta.dto.ts`

---

## [2026-08-15] changement | Nettoyage des décorateurs NestJS inutilisés dans les use cases

Suppression des décorateurs `@Inject` et `@Injectable` superflus dans 24 use cases backend (affectations, forfaits, intervention, planning, users). Pas de changement fonctionnel — alignement sur la Clean Architecture où les use cases sont des classes TypeScript pures, sans décorateurs NestJS.
Fichiers concernés : `use-cases/` des modules `affectations`, `forfaits`, `intervention`, `planning`, `users`

---

## [2026-08-02] configuration | Réalignement des CLAUDE.md et ajout du skill /fin-session

Mise à jour synchronisée des trois CLAUDE.md (racine, Frontend, Backend), des README et des `.env.example`. Ajout du skill `.claude/skills/fin-session/SKILL.md` référencé dans `CLAUDE.md` (section 11 — rappel de fin de session). Le commit inclut également des modifications de fichiers source backend.
Fichiers concernés : `CLAUDE.md`, `Frontend/CLAUDE.md`, `Backend/CLAUDE.md`, `.claude/skills/fin-session/SKILL.md`, `Backend/src/app/main.ts`, `Backend/src/config/helmet.config.ts`
⚠️ À vérifier : commit typé `docs:` mais contient des fichiers source backend (`main.ts`, `helmet.config.ts`) — en contradiction avec la convention Conventional Commits documentée en section 5 de `CLAUDE.md` (`docs:` = documentation uniquement).

---

## [2026-07-12] changement | Ajout des headers de sécurité (Helmet) et du rate limiting (Throttler)

Intégration de `@nestjs/helmet` (headers HTTP de sécurité : CSP, HSTS, X-Frame-Options…) et de `@nestjs/throttler` (rate limiting configurable) dans le bootstrap NestJS. Les deux modules sont extraits dans des fichiers de configuration dédiés (`helmet.config.ts`, `throttler.config.ts`) et branchés dans `AppModule`. Le contrôleur `auth.controller.ts` est annoté pour appliquer les limites de débit sur les endpoints sensibles.
Fichiers concernés : `Backend/src/app/main.ts`, `app.module.ts`, `config/helmet.config.ts`, `config/throttler.config.ts`, `features/auth/controllers/auth.controller.ts`, `Backend/package.json`

---

## [2026-07-03] configuration | Correction des erreurs tsconfig (backend, frontend, CI)

Résolution d'erreurs de configuration TypeScript bloquantes sur les trois périmètres du projet.
Fichiers concernés : `Backend/tsconfig.json`, `Frontend/tsconfig.app.json`, `.github/workflows/ci-cd.yml`

---

## [2026-07-02] changement | Uniformisation des CTA et formulaires côté client

Introduction d'un composant `Form` partagé (préventDefault + onSubmit centralisés) appliqué aux 8 formulaires de l'app (tunnel de réservation, auth, profil) — la touche Entrée soumet désormais toutes les étapes du tunnel. Les CTA de `LoginForm` et `RegisterForm` sont désormais grisés tant que les champs requis ne sont pas remplis. `AdresseSelector` adopte le composant `Card` partagé au lieu de dupliquer son style.
Fichiers concernés : `shared/components/Form/Form.tsx`, `AdresseSelector.tsx`, `CycleEtForfaitForm.tsx`, `CommentaireEtPhotosForm.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`, `ProfileForm.tsx`, `MesCycles.tsx`, `MesAdresses.tsx`

---

## [2026-07-02] changement | Menu admin restreint à "Administration" et redirection post-connexion

Le Header n'affiche plus les liens "Accueil" et "Mon profil" pour le rôle admin (non pertinents : l'admin ne réserve pas d'intervention et n'a pas de cycles/adresses personnels). La connexion redirige désormais directement vers `/admin` au lieu de l'accueil client.
Fichiers concernés : `Header.tsx`, `useLogin.ts`

---

## [2026-07-02] changement | Statut "En retard" et pagination homogène sur les listes admin

Ajout du filtre "En retard" (interventions `Planifiee` dont la date est dépassée, calculé côté serveur, mutuellement exclusif de "Planifiée"). Harmonisation de la pagination admin via un composant `Pagination` shadcn partagé : server-side pour Interventions et Utilisateurs, client-side pour les 8 autres listes (Zones, Forfaits, Affectations, Marques, Types de cycles, Planning). Correction d'un bug de fusion de filtres Prisma sur la clé `creneau`. Complétion de la documentation Swagger manquante (`@ApiQuery`) sur les endpoints à binding de DTO et sur `admin-users.controller.ts`.
Fichiers concernés : `get-admin-interventions.use-case.ts`, `interventions.prisma.repository.ts`, `admin-users.controller.ts`, `pagination-query.dto.ts`, `pagination-meta.dto.ts`, `pagination.tsx`, `usePagination.ts`, `AdminInterventionsFilterBar/`, `AdminInterventionsList/`, `UsersTable/`

---

## [2026-07-02] changement | Affichage du commentaire et des photos dans le récapitulatif de réservation

Ajout de la section photos et commentaire dans l'écran de confirmation client : les photos uploadées sur S3 sont désormais visibles directement depuis le récapitulatif, sans repasser par l'interface admin. Permet de valider visuellement la persistance S3 en fin de tunnel.
Fichiers concernés : `RecapitulatifStep.tsx`, `RecapitulatifStep.module.scss`, `useCreateIntervention.ts`

---

## [2026-07-01] changement | Harmonisation async/await et architecture Comp-hook-service (frontend + backend)

Refactoring transversal de tous les services et hooks frontend : remplacement des chaînes `.then()/.catch()` par `async/await` pour une lisibilité et une gestion d'erreur uniformes. Respect systématique du pattern Composant → Hook → Service sur l'ensemble du module admin (`planning`, `affectations`, `interventions`, `dashboard`) et des features `adresse`, `auth`, `cycle`, `reservation` et `user`. Harmonisation parallèle du contrôleur `users` backend. `Frontend/CLAUDE.md` mis à jour pour documenter la convention.
Fichiers concernés : `Backend/.../users.controller.ts`, `admin/services/*.ts`, `admin/hooks/*.ts`, `AffectationFormDialog.tsx`, `AdminInterventionDetailDialog.tsx`, `AdresseSelector.tsx`, `ConfirmEmailPage.tsx`

---

## [2026-07-01] changement | Résolution de dette technique silencieuse (code mort, erreurs UI, dépendances vulnérables)

Nettoyage du module bootstrap NestJS (`app.controller`, `app.service`, spec e2e associée). Correction d'erreurs UI dans `AdminInterventionsSection` (tsx + scss). Assainissement des hooks auth (`useLogin`, `useLogout`, `useRegister`). Mise à jour des dépendances vulnérables côté backend et frontend (`package.json` + `package-lock.json`).
Fichiers concernés : `Backend/src/app/app.controller.{ts,spec.ts}`, `app.service.ts`, `test/app.e2e-spec.ts`, `Backend/package.json`, `Frontend/package.json`, `AdminInterventionsSection.{tsx,module.scss}`, `useLogin.ts`, `useLogout.ts`, `useRegister.ts`

---

## [2026-07-01] changement | Mise à jour des specs, DTOs et config suite à l'harmonisation HTTP/Swagger

Mise à jour des specs Jest sur l'ensemble des modules (forfaits, planning, zones, intervention) pour refléter les nouveaux codes de statut HTTP harmonisés. `admin-stats.dto.ts` et `planning.dto.ts` ajustés en conséquence. `tsconfig.json` revu, `README.md` mis à jour, tests e2e alignés.
Fichiers concernés : `Backend/tsconfig.json`, `README.md`, `admin-stats.dto.ts`, `planning.dto.ts`, `app.e2e-spec.ts`, specs Jest forfaits / planning / zones / intervention

---

## [2026-07-01] changement | Intégration Swagger et harmonisation des codes HTTP sur l'ensemble du backend

Ajout de Swagger (`@nestjs/swagger`) configuré dans `main.ts` pour générer la documentation interactive de l'API. Harmonisation des codes de statut HTTP (`@HttpCode`, `@ApiResponse`) sur l'ensemble des contrôleurs (admin, auth, zones, forfaits, planning, intervention, adresses, affectations, référentiel). DTOs enrichis avec les décorateurs `@ApiProperty`.
Fichiers concernés : `main.ts`, `nest-cli.json`, `package.json`, contrôleurs et DTOs de tous les modules `features/`

---

## [2026-06-29] changement | Normalisation camelCase des DTOs backend et types frontend

Refactoring transversal harmonisant la convention de nommage en `camelCase` sur l'ensemble des DTOs NestJS (admin, auth, forfaits, planning, zones, affectations, intervention) et des types/services TypeScript frontend correspondants. Pas de changement fonctionnel — alignement du contrat API, des repositories et des specs de tests.
Fichiers concernés : `Backend/src/features/*/dto/*.ts`, `*/repositories/*.ts`, `Frontend/src/features/admin/types/*.ts`, `reservation/types/*.ts`, `shared/types/user.types.ts`

---

## [2026-06-29] configuration | Augmentation de la capacité d'upload Nginx

Relèvement de la limite `client_max_body_size` dans les configurations Nginx staging et prod pour permettre l'upload des photos d'intervention (jusqu'à 30 Mo/fichier) sans erreur 413 derrière le reverse proxy.
Fichiers concernés : `nginx/prod.conf`, `nginx/staging.conf`

---

## [2026-06-29] configuration | Variables AWS S3 dans les docker-compose staging et prod

Ajout des variables d'environnement AWS S3 (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`) dans les stacks Docker staging et prod, afin que l'upload des photos d'intervention fonctionne en environnement déployé. Ajustement mineur de la stratégie JWT.
Fichiers concernés : `docker-compose.staging.yml`, `docker-compose.prod.yml`, `Backend/src/features/auth/strategies/jwt.strategy.ts`

---

## [2026-06-18] changement | Livraison finale — upload et affichage des photos d'intervention via AWS S3

Commit de livraison du feature complet d'upload/affichage des photos d'intervention : `StorageService` (S3), `UploadInterventionPhotosUseCase` (TDD — ownership, limite 5 fichiers, upload parallèle), endpoint `POST /interventions/:id/photos` (Multer, 30 Mo/fichier, MIME filter), modale admin avec grilles séparées client/technicien, upload best-effort dans le tunnel frontend. Migration Prisma `add_photos` (modèle `Photo` + enum `ContextePhoto`).
Fichiers concernés : `storage.{service,module}.ts`, `upload-intervention-photos.use-case.{ts,spec.ts}`, `interventions.controller.ts`, `AdminInterventionDetailDialog.tsx`, `RecapitulatifStep.tsx`, `prisma/schema.prisma`

---

## [2026-06-17] changement | Intégration AWS S3 — upload et affichage des photos d'intervention (full-stack)

Implémentation complète du stockage de photos d'intervention via AWS S3 (bucket `homecyclhome-images`, région `eu-west-3`).

**Modèle de données (Prisma) :**
- Enum `ContextePhoto` (`client` | `technicien`) — discriminateur pour distinguer photos de réservation vs photos de clôture technicien.
- Modèle `Photo` (`id`, `url_s3`, `cle_s3`, `contexte`, `date_creation`, `intervention_id`) avec `onDelete: Cascade`.
- Migration `20260617182135_add_photos`.
- Relation inverse `photos Photo[]` ajoutée à `Intervention`.

**Infrastructure S3 (TDD) :**
- `StorageService` dans `shared/storage/` — `uploadFile(file, folder): Promise<{ url, cle }>` via `@aws-sdk/client-s3`. 2 tests verts.
- `StorageModule` NestJS exportant `StorageService`.
- Variables d'env : `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`.

**Use case (TDD) :**
- `UploadInterventionPhotosUseCase` — ownership (`ForbiddenException`), limite 5 photos (`BadRequestException`), upload parallèle (`Promise.all`) + `createPhotos` contexte `'client'`. 3 tests verts.

**Contrôleur :**
- `POST /interventions/:id/photos` — `FilesInterceptor`, max 5 fichiers, 30 Mo/fichier, MIME filter JPEG/PNG/WebP.
- Décision clé : **ne pas désactiver `bodyParser`** — Multer s'intègre nativement à NestJS sans configuration supplémentaire. La cause d'un 413 est la limite `MAX_FILE_SIZE_BYTES` trop basse (5 Mo → 30 Mo), pas le body parser.

**Modale admin :**
- `findInterventionDetailById` filtre les photos par contexte → `photosClient` / `photosTechnicien` dans le DTO.
- `AdminInterventionDetailDialog` : grilles CSS cliquables séparées par contexte.

**Frontend tunnel :**
- `uploadPhotos` via `FormData`, best-effort post-création (try/catch silencieux).

Fichiers : `prisma/schema.prisma`, migration `20260617182135_add_photos`, `shared/storage/storage.{service,module}.{ts,spec.ts}`, `interventions.repository.{interface,prisma}.ts`, `upload-intervention-photos.use-case.{ts,spec.ts}`, `interventions.controller.ts`, `dto/output/photos-uploaded.dto.ts`, `dto/output/admin-intervention-detail.dto.ts`, `intervention.module.ts`, `interventionService.ts`, `useCreateIntervention.ts`, `RecapitulatifStep.tsx`, `AdminInterventionDetailDialog.{tsx,module.scss}`, `adminIntervention.types.ts`

---

## [2026-06-16] changement | Tableau de bord admin — indicateurs KPI (full-stack)

Implémentation de la section Dashboard dans le panneau admin, avec 3 cartes d'indicateurs alimentées par un nouvel endpoint `GET /admin/stats` (protégé admin).

**Backend (TDD) :**
- `AdminStatsDto` — contrat de réponse (`interventionsPlanifiees`, `zonesCouvertes`, `nombreTechniciens`).
- `IAdminStatsRepository` + `AdminStatsPrismaRepository` — 3 `prisma.count()` en `Promise.all` parallèle : `intervention.count({ statut: 'Planifiee' })`, `zone.count({ is_active: true })`, `utilisateur.count({ role: 'technicien', is_actif: true })`.
- `GetAdminStatsUseCase` (TDD, 2 tests verts) — délègue au repo sans transformation.
- `AdminStatsController` — `GET /admin/stats`, guards `JwtAuthGuard` + `RolesGuard` + `@Roles('admin')`.
- `admin.module.ts` — token `ADMIN_STATS_REPO`, use case et controller enregistrés via `useFactory`.

**Frontend :**
- `dashboard.types.ts` — interface `AdminStats` miroir du DTO.
- `adminDashboardService` — appel `GET /admin/stats` via `apiClient`.
- `useAdminDashboard` — hook avec états `stats / isLoading / error`.
- `AdminDashboardSection` — grille responsive 3 cartes (1 col mobile → 3 col desktop). Icônes Lucide (`CalendarCheck`, `MapPin`, `Wrench`), `strokeWidth={1.5}`, taille `3rem`. Couleurs tirées des variables : brun (`$color-myBrown`), violet (`$color-myViolet`), jaune (`$color-myYellow`). Icône et compteur partagent la même couleur via des classes SCSS dynamiques.
- `AdminLayout.tsx` — section `dashboard` branchée, défaut passé de `'utilisateurs'` à `'dashboard'`.

Fichiers concernés : `admin-stats.dto.ts`, `admin-stats.repository.interface.ts`, `admin-stats.prisma.repository.ts`, `get-admin-stats.use-case.{ts,spec.ts}`, `admin-stats.controller.ts`, `admin.module.ts`, `dashboard.types.ts`, `adminDashboardService.ts`, `useAdminDashboard.ts`, `AdminDashboardSection/{tsx,module.scss}`, `AdminLayout.tsx`

---

## [2026-06-16] changement | Visualisation admin des interventions — filtres et modale de détail (full-stack)

Implémentation full-stack de la consultation admin de toutes les interventions : use cases `GetAdminInterventionsUseCase` et `GetAdminInterventionDetailUseCase` (TDD), `AdminInterventionsController` (`GET /admin/interventions` et `/:id`, guards JWT + RBAC admin). Frontend : `AdminInterventionsSection` (Tabs shadcn Planifiées/Archivées), `AdminInterventionsList` (filtres zone/technicien, lignes cliquables, badges statut), `AdminInterventionDetailDialog` (Dialog shadcn, fond blanc forcé). Hook `useAdminInterventions` avec filtres réactifs + `adminInterventionsService`. Sidebar mise à jour, case `interventions` ajouté dans `AdminLayout`.
Fichiers concernés : `admin-interventions.controller.ts`, `get-admin-interventions.use-case.{ts,spec.ts}`, `get-admin-intervention-detail.use-case.{ts,spec.ts}`, `AdminInterventionsSection/`, `AdminInterventionsList/`, `AdminInterventionDetailDialog/`, `useAdminInterventions.ts`, `adminInterventionsService.ts`, `adminIntervention.types.ts`, `AdminSidebar.tsx`, `AdminLayout.tsx`

---

## [2026-06-15] changement | Backend admin interventions — use cases, contrôleur et DTOs

Implémentation des use cases `GetAdminInterventionsUseCase` (liste avec filtres statut / zone / technicien) et `GetAdminInterventionDetailUseCase` (détail complet, `NotFoundException` si absent) en TDD. Ajout du `AdminInterventionsController` exposant `GET /admin/interventions` et `GET /admin/interventions/:id` (guards `JwtAuthGuard` + `RolesGuard` admin). Nouvelles méthodes `findAllInterventions` et `findInterventionDetailById` dans l'interface et l'implémentation Prisma du repository.
Fichiers concernés : `admin-interventions.controller.ts`, `get-admin-interventions.use-case.{ts,spec.ts}`, `get-admin-intervention-detail.use-case.{ts,spec.ts}`, `admin-intervention-{list-item,detail}.dto.ts`, `get-admin-interventions-query.dto.ts`, `interventions.{repository.interface,prisma.repository}.ts`, `intervention.module.ts`

---

## [2026-06-14] changement | Visualisation admin de toutes les interventions (full-stack)

Feature complète permettant à l'admin de consulter toutes les interventions avec filtres et modale de détail.

**Backend (TDD) :**
- `GetAdminInterventionsUseCase` — liste toutes les interventions avec filtres statut/zone/technicien. Délègue au repo, pas de logique dans le use case.
- `GetAdminInterventionDetailUseCase` — retourne le détail complet d'une intervention ; lève `NotFoundException` si absente.
- 2 nouvelles méthodes dans `IInterventionsRepository` + `InterventionsPrismaRepository` : `findAllInterventions` (findMany avec statut, zoneId, technicienId), `findInterventionDetailById`.
- **Contrainte clé :** `technicien_id` est un snapshot scalaire sans `@relation` Prisma → requête secondaire `utilisateur.findMany/findUnique` + `Map<string, Technicien>` pour la résolution.
- `nom_zone` (champ Prisma) → mappé `nom` dans le DTO.
- `AdminInterventionsController` : `GET /admin/interventions` + `GET /admin/interventions/:id` (guards `JwtAuthGuard` + `RolesGuard` + `@Roles('admin')`).
- Module mis à jour : controller + 2 use cases via `useFactory`.

**Frontend :**
- `adminIntervention.types.ts` — miroir des DTOs backend.
- `adminInterventionsService` — `getInterventions(params)` + `getInterventionDetail(id)`.
- `useAdminInterventions` — state + filtres réactifs (`activeTab`, `zoneId`, `technicienId`), `useEffect` redéclenché à chaque changement.
- `AdminInterventionsList` — présentationnel : selects zone + technicien, tableau lignes cliquables avec badges statut.
- `AdminInterventionDetailDialog` — Dialog shadcn ; fond blanc forcé via `background-color: white` (variable `--background` non définie → transparence sinon) ; espacement amélioré avec sections `#f9f9f9`, grid 2 colonnes, separator header.
- `AdminInterventionsSection` — orchestrateur stateful Tabs shadcn (Planifiées / Archivées) avec design identique aux onglets Cycles (fond `$color-myLightGreen`, onglet actif blanc + orange).
- Sidebar : suppression de l'entrée "Créneaux" (redondante avec "Planning").
- `AdminLayout` : ajout du case `interventions` → `AdminInterventionsSection`.

---

## [2026-06-14] changement | Ajustements cancel-intervention + agrandissement bouton hamburger

Corrections et affinements du use case `CancelInterventionUseCase` et du repository planning post-intégration. Agrandissement du bouton hamburger mobile à 42px côté frontend.
Fichiers concernés : `cancel-intervention.use-case.{ts,spec.ts}`, `interventions.{prisma.repository,repository.interface}.ts`, `planning.prisma.repository.ts`, `Header.{tsx,module.scss}`

---

## [2026-06-14] changement | Mes interventions — consultation et annulation (full-stack)

Implémentation de la page "Mes interventions" permettant au client de visualiser ses interventions groupées par période et d'annuler une intervention planifiée.

**Backend (TDD) :**
- `GetClientInterventionsUseCase` — retourne toutes les interventions d'un client, ordonnées par `date_creation desc`. Délègue au repo sans logique de tri côté use case (tri effectué côté frontend).
- `CancelInterventionUseCase` — `NotFoundException` si absente, `ForbiddenException` si ownership ≠ client connecté, `ConflictException` si statut ≠ `Planifiee`. Transaction atomique : `UPDATE intervention.statut = 'Annulee'` + `creneau.updateMany(is_disponible = true)`.
- Repository : 3 nouvelles méthodes dans `IInterventionsRepository` + `InterventionsPrismaRepository` : `getInterventionsByClientId` (select avec joins forfait, creneau, adresse, cycle), `findInterventionForCancel`, `cancelInterventionTransaction`.
- Contrôleur : `GET /interventions` + `PATCH /interventions/:id/annuler` (204 No Content), protégés `JwtAuthGuard`.
- Module : 2 nouveaux use cases enregistrés avec pattern `useFactory`.

**Corrections de modèle (Prisma + migration) :**
- `@unique` retiré de `creneau_id` sur `Intervention` — le créneau peut porter plusieurs interventions historiques (annulées + active). L'unicité métier est garantie par `is_disponible`. Migration `20260614140926_remove_unique_creneau_id_intervention`.
- Relation `Creneau.intervention Intervention?` → `Creneau.interventions Intervention[]` (cardinalité Merise 0,n côté Creneau, 1,n côté Intervention — un créneau peut être re-réservé après annulation).
- `cancelInterventionTransaction` et `createInterventionTransaction` : remplacement de `creneau.update` par `creneau.updateMany` sur la plage `[date_debut, date_debut + dureeMinutes[` filtré sur `zone_id` + `modele_planification_id` → tous les slots du bloc (ex: 4 créneaux de 30 min pour un forfait 2h) sont verrouillés/libérés en une seule opération.

**Frontend :**
- `clientIntervention.types.ts` — `InterventionStatut` + `InterventionClientDto` (miroir du DTO backend).
- `clientInterventionService` — `getMyInterventions()` + `cancelIntervention(id)`.
- `useInterventions` — fetch au montage, `cancelIntervention` refetch après mutation. Expose 3 groupes : `precedentes` (date < aujourd'hui), `aujourdhui`, `planifiees` (date ≥ demain + statut Planifiee).
- `InterventionCard` — badge statut coloré (orange/vert/gris), helper `getEffectiveStatut` : badge "Passée" pour les interventions `Planifiee` avec date passée (évite la confusion). Bouton "Annuler" uniquement si `onCancel` prop fournie.
- `CancelInterventionDialog` — dialog en SCSS pur (pattern MobileMenu : `position: fixed; z-index: 150/200`) — Tailwind non chargé hors `AdminLayout`.
- `MesInterventions` — composant stateful orchestrant hook + dialog, 3 sections avec états vides.
- `InterventionsPage` — page avec Header + PageLayout + Footer + Card.
- Route `/interventions` ajoutée dans `App.tsx` (lazy + `ProtectedRoute`).
- `PageLayout` — `HeroBrand` toujours rendu dans `leftOverlay` (desktop visible sur toutes les pages, pas seulement l'accueil).

TDD : 17 tests verts sur le module intervention (use cases + specs existants mis à jour).

Fichiers : `interventions.repository.interface.ts`, `interventions.prisma.repository.ts`, `get-client-interventions.use-case.{ts,spec.ts}`, `cancel-intervention.use-case.{ts,spec.ts}`, `create-intervention.use-case.spec.ts`, `interventions.controller.ts`, `intervention.module.ts`, `prisma/schema.prisma`, migration `20260614140926`, `clientIntervention.types.ts`, `clientInterventionService.ts`, `useInterventions.ts`, `InterventionCard/`, `CancelInterventionDialog/`, `MesInterventions/`, `InterventionsPage.tsx`, `App.tsx`, `PageLayout.tsx`

---

## [2026-06-14] fix | Correction algorithme buffer avant et affichage calendrier des créneaux

Deux bugs corrigés dans le module de sélection de créneau.

**Bug 1 — Buffer avant ignorait les trous causés par les pauses (Backend)**

`GetCreneauxDisponiblesUseCase` vérifiait uniquement que le créneau précédent dans le tableau était `is_disponible`, sans vérifier la contiguïté temporelle. Avec une pause 12h-14h, les créneaux 12h-13h30 n'existent pas en base. Le créneau 14h00 avait pour "précédent" le 11h30 (disponible → condition satisfaite → 14h00 proposé à tort). Le technicien étant en pause, il ne peut pas se déplacer chez le client.

Correction : `intervalleMinutes` ajouté à `CreneauAvecTechnicienDto` (via jointure `modele_planification.intervalle_minutes` dans `findCreneauxByZone`). La vérification du buffer avant contrôle désormais que `ecartMs ≤ intervalleMinutes * 60 * 1000`. Un écart supérieur (trou de pause) invalide le buffer. Le buffer après n'est pas concerné : un technicien qui termine à 12h et prend sa pause n'a pas besoin de buffer de déplacement.

Note : `intervalleMinutes = Infinity` pour les créneaux manuels (sans modèle) → pas de restriction de contiguïté.

**Bug 2 — slotDurationMs instable → créneaux chevauchants dans FullCalendar (Frontend)**

`CreneauSelector` calculait `slotDurationMs` (durée d'affichage des events non sélectionnés) comme la différence entre les deux **premiers** créneaux retournés. Si des créneaux intermédiaires étaient réservés ou absents (pause), les deux premiers créneaux pouvaient être séparés de plusieurs heures → `slotDurationMs` trop grand → events de plusieurs heures → chevauchements visuels massifs dans FullCalendar.

Correction : `Math.min(...écarts entre créneaux consécutifs)` — prend l'espacement minimal de l'ensemble de la liste, robuste aux trous.

TDD : nouveau test `'devrait exclure un créneau dont le buffer avant est séparé par un trou (pause)'`. Total : 9 tests verts.

Fichiers : `planning.dto.ts`, `planning.prisma.repository.ts`, `get-creneaux-disponibles.use-case.{ts,spec.ts}`, `CreneauSelector.tsx`

---

## [2026-06-11] changement | Confirmation de réservation — email + écran de succès enrichi (full-stack)

Implémentation de la confirmation post-réservation : email automatique au client + écran de succès enrichi avec récapitulatif.

**Backend :**
- `EmailService.sendInterventionConfirmationEmail(to, prenom, dateCreation)` — email plain-text en français, formatage de la date avec `toLocaleDateString('fr-FR')`.
- `findClientById(clientId)` ajouté à `IInterventionsRepository` + `InterventionsPrismaRepository` (type `ClientInfo { email, prenom }`, `select` minimal Prisma). Décision architecturale : méthode sur le repo Intervention (pas injection de `UsersModule`) pour conserver l'indépendance des modules — compatible microservice.
- `CreateInterventionUseCase` — injection `Pick<EmailService, 'sendInterventionConfirmationEmail'>`, étape 8 post-transaction : `findClientById` + envoi email dans un `try/catch` (best-effort — l'email n'est pas bloquant).
- `InterventionModule` — `EmailModule` importé, factory mise à jour avec 2 dépendances injectées.
- TDD : 2 nouveaux tests (email envoyé / email failure non bloquant). Total use case : 10 tests verts.

**Frontend :**
- Bug corrigé : `reset()` changeait `currentStep` et démontait `RecapitulatifStep` avant que `setIsSuccess(true)` soit visible. Fix : `reset()` déplacé dans le handler du bouton "Retour à l'accueil" — le composant reste monté pendant tout l'affichage de l'écran de confirmation.
- `handleSubmit` — snapshot `{ forfait, creneau, adresseLabel }` capturé AVANT `reset()` dans un état local `confirmationData`.
- Écran de succès enrichi : checkmark orange (design system), récapitulatif date/horaire/forfait/adresse, CTA "Retour à l'accueil" (`useNavigate('/')`).
- SCSS : `#27ae60` hardcodé remplacé par `$color-myOrange`. Nouvelles classes `.summaryCard/Row/Label/Value/Meta`.

**Bug identifié (phase test) :** BUG-01 — `CreneauSelector` : affichage incorrect avec le forfait Express (durée 45 min). À corriger lors de la phase de test Sprint 3.

Fichiers : `email.service.ts`, `interventions.repository.interface.ts`, `interventions.prisma.repository.ts`, `create-intervention.use-case.{ts,spec.ts}`, `intervention.module.ts`, `RecapitulatifStep.{tsx,module.scss}`

---

## [2026-06-11] changement | Amélioration UX du tunnel de réservation (frontend + backend)

Refactoring UX des composants du tunnel : `AuthStep`, `CreneauSelector`, `CycleEtForfaitForm`, `RecapitulatifStep` et `RestoreCard` retravaillés visuellement et fonctionnellement. `ReservationContext` et `reservation.types.ts` mis à jour. Ajustements backend du use case `CreateIntervention` (spec incluse) et de l'interface repository. Corrections mineures sur `AdresseSelector`, `useLogout`, `HeroBrand` et `PageLayout`.
Fichiers concernés : `ReservationContext.tsx`, `reservation.types.ts`, `AuthStep/`, `CreneauSelector/`, `CycleEtForfaitForm/`, `RecapitulatifStep/`, `RestoreCard/`, `interventionService.ts`, `useCreateIntervention.ts`, `create-intervention.use-case.{ts,spec.ts}`, `interventions.repository.interface.ts`, `Home.tsx`

---

## [2026-06-10] changement | Module intervention backend — use case création et transaction atomique

Implémentation du module NestJS `features/intervention/` en Clean Architecture (TDD, spec incluse).
`CreateInterventionUseCase` : transaction atomique Prisma — INSERT Intervention + UPDATE Creneau `is_disponible = false`. DTOs d'entrée/sortie validés, repository interface + Prisma, migration `add_interventions`.
Fichiers concernés : `prisma/schema.prisma`, migration `20260609194100_add_interventions`, `features/intervention/` (controller, DTOs, repository, use-case + spec)

---

## [2026-06-09] changement | HOM-315 — Phase d'authentification et création d'intervention (full-stack)

Implémentation complète du tunnel de réservation de bout en bout.

**Backend :**
- Migration Prisma `20260609194100_add_interventions` : enum `StatutIntervention` (`Planifiee` | `Terminee` | `Annulee`) + modèle `Intervention` avec snapshots (`duree_minutes_snapshot`, `historique_prix_forfait_id`, `technicien_id`).
- Module `features/intervention/` — Clean Architecture, TDD (8 tests verts). Type `CreateInterventionInput` plat pour compatibilité avec `CreateInterventionDto` class-validator — gardes runtime dans `resoudreCycleId` / `resoudreAdresseId`. Transaction atomique `$transaction` : INSERT Intervention + UPDATE Creneau `is_disponible = false`.

**Frontend :**
- `'commentaire'` retiré de `ReservationStep` — devient section dépliable dans le récap. `PENDING_RESERVATION_KEY` + `PendingReservationStorage` + `savePendingToStorage` + `restoreFromStorage` ajoutés au `ReservationContext`.
- `AuthStep` : sauvegarde localStorage au montage, propose connexion / inscription.
- `CommentaireEtPhotosForm` : prop `embedded` — masque navigation, auto-sauvegarde context.
- `RecapitulatifStep` : récap 4 sections + commentaire/photos dépliable + soumission + écran succès + nettoyage localStorage.
- `RestoreBanner` dans `Home.tsx` : détection localStorage post-connexion, bannière explicite (protection appareil partagé).
- `interventionService` : mapping `AdresseBooking` / `CycleBooking` (unions frontend) → DTO plat backend. `useCreateIntervention` : pattern `isLoading / error`.

**Décision clé :** auth avant commentaires/photos (évite la perte des `File[]` non-sérialisables en JSON).

Fichiers : `prisma/schema.prisma`, migration `20260609194100_add_interventions`, `features/intervention/` (8 fichiers backend), `reservation.types.ts`, `ReservationContext.tsx`, `CreneauSelector.tsx`, `AuthStep/`, `CommentaireEtPhotosForm.tsx`, `RecapitulatifStep/`, `interventionService.ts`, `intervention.types.ts`, `useCreateIntervention.ts`, `Home.tsx`

---

## [2026-06-08] changement | Ajout de l'étape commentaire et photos dans le tunnel

Création du composant `CommentaireEtPhotosForm` (commentaire libre + upload photos) intégré comme nouvelle étape du tunnel de réservation. `ReservationContext` et `reservation.types.ts` mis à jour pour porter ces données. `CreneauSelector` ajusté pour enchaîner vers cette étape, `Home.tsx` câblé sur le rendu conditionnel.
Fichiers concernés : `CommentaireEtPhotosForm/`, `reservation.types.ts`, `ReservationContext.tsx`, `CreneauSelector.tsx`, `Home.tsx`

---

## [2026-06-08] changement | HOM-310 (complet) — Frontend sélection de créneau avec FullCalendar

Implémentation frontend de l'étape créneau du tunnel de réservation. HOM-310 est désormais 100 % terminé.

**ReservationContext :**
- Nouveau type `CreneauInfo` (`creneauId`, `dateDebut`, `dateFin`, `technicienId`) ajouté à `reservation.types.ts`
- Action `setCreneau` + état `creneau: CreneauInfo | null` dans `ReservationContext.tsx`, `reset()` mis à jour.

**Service & hook :**
- `reservationService.getCreneaux(params)` — `GET /creneaux?zone_id=&duree_minutes=&date_debut=&date_fin=`
- Type `CreneauDisponibleDto` dans `features/reservation/types/creneau.types.ts`
- Hook `useCreneaux(zoneId, dureeMinutes)` — fenêtre aujourd'hui → +28 jours, pattern identique à `useForfaits`

**Composant `CreneauSelector` (FullCalendar v6) :**
- Vue `timeGridDay` (un jour à la fois — choix mobile-first) avec `@fullcalendar/timegrid` + `@fullcalendar/interaction`
- Toolbar custom : boutons nav orange (60×60px) + bouton central date+jour (`showPicker()` sur `<input type="date">` caché) + nom du jour en jaune gras
- `initialDate={creneauxValides[0].date_debut}` — ouverture sur le premier jour avec des créneaux valides
- `datesSet` callback pour synchroniser `currentDate` avec le calendrier (évite le problème de timing de `gotoDate()`)
- Événements : fond vert `#d6f6dd` non sélectionné (durée = un slot) | fond orange `#f26419` sélectionné (expansion à `date_fin`)
- `toLocalDateString()` helper pour éviter le piège UTC de `.toISOString().split('T')[0]`

**Filtre défensif `creneauxValides` :**
Pour chaque créneau, vérifie que le dernier slot disponible avant `date_fin` se trouve bien à `date_fin - slotDurationMs`. Si un gap temporel est détecté (ex: pause déjeuner 12h-14h non générée), le créneau est exclu de l'affichage et de la sélection. Protège contre un bug côté backend (algorithme buffer ne détectant pas les gaps dans la fenêtre glissante). Fix backend prévu dans un sprint ultérieur.

Fichiers créés/modifiés : `reservation.types.ts`, `ReservationContext.tsx`, `creneau.types.ts` (nouveau), `reservationService.ts`, `useCreneaux.ts` (nouveau), `CreneauSelector/CreneauSelector.tsx` (nouveau), `CreneauSelector/CreneauSelector.module.scss` (nouveau), `Home.tsx`

---

## [2026-06-07] changement | HOM-310 (partiel) — Backend sélection de créneau avec algorithme buffer

Implémentation backend du filtrage des créneaux disponibles pour le tunnel de réservation client.

**Nouveaux DTOs** (`planning.dto.ts`) :
- `CreneauAvecTechnicienDto` — type intermédiaire interne : étend `CreneauDto` avec `technicien_id` (résolu via la relation `modele_planification`)
- `CreneauDisponibleDto` — réponse API client : `id`, `date_debut`, `date_fin` (calculée), `technicien_id`, `zone_id`. `date_fin` est toujours renseignée (contrairement à `CreneauDto` admin où elle est nullable).

**Repository** (`IPlanningRepository` + `PlanningPrismaRepository`) :
- Nouvelle méthode `findCreneauxByZone(zoneId, debut, fin)` — retourne TOUS les créneaux d'une zone (disponibles ET réservés) via `findMany` avec `include: { modele_planification: { select: { technicien_id } } }`. Les créneaux non disponibles sont nécessaires pour détecter les trous dans l'algorithme buffer.
- Mapper privé `toCreneauAvecTechnicienDto` ajouté, réutilise `toCreneauDto` via spread.

**Algorithme buffer — `GetCreneauxDisponiblesUseCase`** (TDD, 8 tests verts) :
Fenêtre glissante sur le tableau de créneaux trié par `date_debut`. Pour chaque créneau `[i]` :
1. Skip si `!is_disponible`
2. Skip si `i === 0` ou `creneaux[i-1].is_disponible === false` → buffer avant manquant
3. Vérifier que tous les slots `j` tels que `date_debut[j] < date_debut[i] + duree_minutes` sont disponibles
4. Skip si le slot suivant `[last+1]` est réservé ou inexistant → buffer après manquant
5. Si tout passe : ajouter au résultat avec `date_fin = date_debut + duree_minutes`

Raison du choix hard block (buffers bloqués à la réservation, pas seulement vérifiés) : éviter qu'une réservation concurrente prenne un slot buffer pendant que le technicien est en déplacement.

**Contrôleur et module** :
- `ClientCreneauxController` — `GET /creneaux` sans `JwtAuthGuard`, query params : `zone_id` (UUID), `duree_minutes` (Int ≥ 1, converti via `@Type(() => Number)`), `date_debut`, `date_fin` (ISO 8601). DTO `GetCreneauxDisponiblesQueryDto` avec `class-validator` + `class-transformer`.
- `PlanningModule` mis à jour — `GetCreneauxDisponiblesUseCase` + `ClientCreneauxController` enregistrés.
- `buildMockRepo` de tous les specs planning mis à jour avec `findCreneauxByZone` (+ `deleteCreneauxDisponibles` là où il manquait). 71 tests verts, zéro régression.

Fichiers créés/modifiés : `planning.dto.ts`, `planning.repository.interface.ts`, `planning.prisma.repository.ts`, `get-creneaux-disponibles.use-case.{ts,spec.ts}`, `get-creneaux-disponibles.dto.ts`, `client-creneaux.controller.ts`, `planning.module.ts`, 5 specs existants (`buildMockRepo`)

---

## [2026-06-07] changement | HOM-305 + HOM-310 (partiel) — Sélection cycle et forfait dans le tunnel

Implémentation full-stack des étapes cycle et forfait du tunnel de réservation.

**Backend :**
- `GET /referentiel/type-cycles` et `GET /referentiel/marques` : `JwtAuthGuard` retiré des deux controllers referentiel — ces données de référence sont désormais publiques (aucune donnée utilisateur exposée).
- Nouveau use case `GetForfaitsActifsUseCase` (TDD, 2 tests verts) — filtre `is_actif: true`, délègue à `IForfaitsRepository.findAllActifs()`. Nouvelle méthode `findAllActifs()` ajoutée à l'interface et à `ForfaitsPrismaRepository`. Nouveau `ClientForfaitsController` exposant `GET /forfaits` sans guard. `ForfaitsModule` mis à jour. Total : 189 tests verts, zéro régression.

**Frontend — ReservationContext :**
Deux nouveaux types : `CycleBooking` (union `source: 'existing' | 'new'`, avec `cycleId` optionnel, `typeCycleId/Libelle`, `marqueId/Libelle`) et `ForfaitInfo` (`forfaitId`, `nom`, `dureeMinutes`, `prix`). Actions `setCycle` et `setForfait` ajoutées séparément dans le context (pas fusionnées — chaque sélection est indépendante). `reset()` réinitialise les deux.

**Frontend — Services & hooks :**
`reservationService.getForfaits()` ajouté (`GET /forfaits`). Type `ForfaitDto` dans `features/reservation/types/`. Hook `useForfaits` (fetch au montage, expose `forfaits/isLoading/error`). Hook `useUserCyclesForReservation(enabled: boolean)` — lecture seule sur `GET /cycles`, paramètre `enabled` pour éviter l'appel API si non authentifié (les hooks React ne peuvent pas être appelés conditionnellement). `useReferentiel` existant (`features/cycle/`) réutilisé pour type-cycles et marques.

**Frontend — Composants :**
`CycleSelector` (`features/cycle/components/CycleSelector/`) — logique duale : non connecté → selects type + marque directs ; connecté → combobox cycles personnels (pré-sélection automatique du premier cycle au montage, `+ Nouveau vélo` en dernière option) + révélation conditionnelle des selects type+marque. Construit `CycleBooking` de manière synchrone dans les handlers (pas de `useEffect` sur la sélection — évite le problème du state asynchrone React). `useEffect` au montage uniquement pour notifier le parent de la pré-sélection initiale.

`ForfaitSelector` (`features/forfait/components/ForfaitSelector/`) — cards radio mobile-first : `<label>` wrappant `<input type="radio">` caché + indicateur visuel custom (pastille orange). Helpers `formatDuree` (ex: "1h30") et `formatPrix` (ex: "49.90 €" ou "—" si null).

`CycleEtForfaitForm` (`features/reservation/components/CycleEtForfaitForm/`) — orchestre `useReferentiel`, `useForfaits`, `useUserCyclesForReservation`. Attend le chargement des cycles (si connecté) avant de monter `CycleSelector`. CTA "Choisir un créneau" désactivé tant que cycle ET forfait ne sont pas tous les deux sélectionnés. À la validation : `setCycle + setForfait + goToStep('creneau')`.

`Home.tsx` — rendu conditionnel : `currentStep === 'adresse'` → `AdresseSelector` ; `currentStep === 'cycle'` → `CycleEtForfaitForm`.

Fichiers créés/modifiés : `referentiel-type-cycles.controller.ts`, `referentiel-marques.controller.ts`, `get-forfaits-actifs.use-case.{ts,spec.ts}`, `forfaits.repository.interface.ts`, `forfaits.prisma.repository.ts`, `client-forfaits.controller.ts`, `forfaits.module.ts`, `reservation.types.ts`, `ReservationContext.tsx`, `forfait.types.ts`, `reservationService.ts`, `useForfaits.ts`, `useUserCyclesForReservation.ts`, `CycleSelector/`, `ForfaitSelector/`, `CycleEtForfaitForm/`, `Home.tsx`

---

## [2026-06-06] fix | Correction des warnings ESLint AdresseSelector et CheckZoneUseCase

Résolution des warnings ESLint dans `AdresseSelector.tsx` (variables ou imports non utilisés) et ajustements associés dans `check-zone.use-case.ts` et son spec pour conformité linter.
Fichiers concernés : `features/adresse/components/AdresseSelector/AdresseSelector.tsx`, `zones/use-cases/check-zone.use-case.{ts,spec.ts}`

---

## [2026-06-06] changement | Mise en place du ReservationContext et début du flow réservation

Initialisation du contexte global de réservation (React Context) structurant les 5 étapes du tunnel (adresse, cycle, forfait, créneau, auth). Création du composant `AdresseSelector` (mode non-authentifié via Google Autocomplete, mode authentifié via dropdown adresses actives + bascule autocomplete) avec appel `POST /zones/check` au submit. Backend : module `features/adresses/` complet (4 use cases TDD, repository Prisma) + use case `CheckZoneUseCase` (algorithme Ray Casting).
Fichiers concernés : `app/providers/reservationContext/` (4 fichiers), `features/adresse/components/AdresseSelector/`, `features/reservation/services/reservationService.ts`, `pages/Home.tsx`, `app/main.tsx`, `features/adresses/` (backend complet), `zones/use-cases/check-zone.use-case.{ts,spec.ts}`, `zones/controllers/zones.controller.ts`

---

## [2026-06-06] changement | HOM-290 + HOM-295 — Vérification de zone + AdresseSelector + ReservationContext

Implémentation full-stack de l'étape 1 du tunnel de réservation.

**Backend :** Nouvelle méthode `findAllActive()` sur `IZonesRepository` + `ZonesPrismaRepository` (filtre `is_active: true`). Use case `CheckZoneUseCase` — algorithme **Ray Casting** (théorème de Jordan) implémenté en ~10 lignes sans dépendance externe : pour chaque zone active, lance un rayon horizontal depuis le point GPS vers l'est et compte les intersections avec les arêtes du polygone (nombre impair = dedans). 4 tests TDD verts : point dedans, point dehors, aucune zone active, bonne zone parmi plusieurs. Controller public `ZonesController` exposant `POST /zones/check` sans `JwtAuthGuard`. DTOs `CheckZoneDto` (input validé) + `CheckZoneResultDto` (output). Enregistrement dans `ZonesModule`. Total : 187 tests verts, zéro régression.

**Frontend — ReservationContext :** 4 fichiers suivant exactement le pattern `AuthContext` : `reservation.types.ts` (union discriminée `AdresseBooking` : `source: 'autocomplete' | 'saved'`, `ZoneInfo`, `ReservationStep`, `ReservationContextType`), `reservation.context.ts` (séparé pour react-refresh), `ReservationContext.tsx` (provider avec `useState`, pas de `localStorage` — données transitoires), `useReservation.ts` (hook avec guard). Imbriqué dans `AuthProvider` dans `main.tsx`.

**Frontend — AdresseSelector :** Composant `features/adresse/components/AdresseSelector/` scindé en deux sous-composants internes (`NonAuthSelector` + `AuthSelector`) pour éviter d'appeler `useAdresses` (API protégée) côté non-authentifié. Mode non-auth : `useAddressAutocomplete` (Google Places). Mode auth : `useAdresses` + `useEffect` pour présélectionner l'adresse principale au chargement, dropdown sans option vide, lien bascule vers autocomplete pour nouvelle adresse. Au clic "Prendre Rendez-vous" : appel `reservationService.checkZone()` → succès = `setAdresseAndZone + goToStep('cycle')` ; 404 = message d'erreur inline. `reservationService.ts` créé dans `features/reservation/services/`. Intégration dans `Home.tsx`.

Fichiers créés/modifiés : `zones/use-cases/check-zone.use-case.{ts,spec.ts}`, `zones/dto/check-zone.dto.ts`, `zones/controllers/zones.controller.ts`, `zones/repositories/zones.{interface,prisma}.ts`, `zones/modules/zones.module.ts`, `app/providers/reservationContext/` (4 fichiers), `app/main.tsx`, `features/reservation/services/reservationService.ts`, `features/adresse/components/AdresseSelector/` (2 fichiers), `pages/Home.tsx`

---

## [2026-06-06] decision | Sprint 3 — Architecture du tunnel de réservation (AdresseSelector + ReservationContext)

Séance de conception de l'entrée du parcours client et du contexte global du tunnel.

**`ReservationContext` — structure retenue :**
State global React Context portant les 5 étapes du tunnel : `adresse + zone`, `cycle`, `forfait`, `creneau`, `nouveauUtilisateur` (si non connecté). Navigation gérée via une propriété `currentStep` de type union littérale (`'adresse' | 'cycle' | 'forfait' | 'creneau' | 'auth' | 'confirmation'`). Le context est réinitialisé après confirmation. L'étape `'auth'` est ignorée si l'utilisateur est déjà connecté.

**Ordre du tunnel validé :** Adresse → Cycle → Forfait → Créneau → Auth (si besoin) → Confirmation.
*(Cycle avant Forfait car la durée du forfait détermine les créneaux compatibles, et le cycle est une info indépendante du temps.)*

**Navigation — Option A (mono-page avec steps) :** toutes les étapes sur une seule page, pas de routes `/reserver/adresse`, `/reserver/forfait`… Données trop volumineuses et transitoires pour l'URL. Réinitialisation du context après confirmation.

**Composant `AdresseSelector` :** logique duale selon auth. Non connecté → `useAddressAutocomplete` (Google Places Autocomplete). Connecté → dropdown des adresses actives du profil + lien "Saisir une nouvelle adresse". Au clic "Prendre Rendez-vous" → appel `POST /zones/check` (backend) → 404 = message inline "adresse non couverte" ; succès = stockage `{ adresse, zone }` dans le context + passage à l'étape suivante.

**Endpoint `POST /zones/check` à créer :** sans guard (`JwtAuthGuard`), accessible sans authentification. Input `{ latitude, longitude }`, algorithme point-in-polygon sur `ZonePoint` des zones actives. Output `{ zoneId, nomZone }` ou `404 NotFoundException`.

---

## [2026-06-06] changement | HOM-300 — Commit final gestion des adresses client (full-stack)

Commit de livraison du module complet de gestion des adresses client (backend + frontend). Backend : module `features/adresses/` en Clean Architecture (controller, DTOs, 4 use cases TDD, repository Prisma), migration `add_adresses`. Frontend : composant `MesAdresses`, hooks `useAdresses` + `useAddressAutocomplete` (callback ref pattern), `adresseService`, types `adresse.types.ts`, intégration dans `ProfilPage`.
Fichiers concernés : `features/adresses/` (backend complet), `Frontend/src/features/adresse/`, `ProfilPage.tsx`, `prisma/schema.prisma`, `prisma/migrations/20260605135215_add_adresses/`

---

## [2026-06-05] changement | HOM-300 — Gestion des adresses client (profil)

Implémentation full-stack de la gestion des adresses enregistrées dans l'espace profil client.

**Backend :** migration Prisma `add_adresses` ajoutant les modèles `Adresse` (champs plats geocodés : numero, rue, code_postal, ville, pays, latitude, longitude, google_place_id `@unique`) et `PeutSeSituer` (liaison n-n `Utilisateur ↔ Adresse` portant titre_description, adresse_principal, is_valide, date_invalidite, `onDelete: Cascade` des deux côtés). Module `features/adresses/` en Clean Architecture : 4 use cases TDD (10 tests verts). Règles métier : `CreateAdresseUseCase` → déduplication via `upsert` sur `google_place_id` + `ConflictException` si liaison active déjà existante + appel `setPrincipal` si `adressePrincipal: true` à la création ; `UpdateAdresseUseCase` → routage vers `setPrincipal` / `unsetPrincipal` / `updateMetadata` ; `DeleteAdresseUseCase` → `BadRequestException` si dernière adresse active + soft-delete (`is_valide = false` + `date_invalidite = now()`). Repository Prisma avec `$transaction()` atomique pour `setPrincipal` (reset all → set one) et `upsert` pour la déduplication de l'entité `Adresse`. Controller `GET|POST|PATCH|DELETE /adresses` protégé `JwtAuthGuard` uniquement (pas de RolesGuard — accessible à tous les connectés).

**Frontend :** types `adresse.types.ts` (`Adresse`, `DecomposedAddress`, `CreateAdressePayload`, `UpdateAdressePayload`), `adresseService`, `useAdresses`. Hook `useAddressAutocomplete` : **callback ref pattern** (`useCallback((node) => setInputEl(node))` + `useEffect([inputEl])`) — solution au problème d'input conditionnel non monté au moment du `useRef`. `setOptions()` appelé au niveau module (même pattern que `ZoneMapDrawer`). Composant `MesAdresses` intégré dans `ProfilPage` (chips + formulaire inline). Comportement : première adresse → `adressePrincipal: true` forcé, toggle masqué ; adresses suivantes → toggle visible ; bouton "Désactiver" masqué si une seule adresse active.

**Bug notable résolu :** `useRef` sur un input conditionnel renvoie toujours `null` car le ref est attaché avant le montage de l'input. Résolu par le callback ref pattern : React appelle la fonction ref au montage/démontage réel de l'élément DOM.

Fichiers concernés : `prisma/schema.prisma`, `prisma/migrations/20260605135215_add_adresses/`, `features/adresses/` (backend complet), `Frontend/src/features/adresse/` (types, service, hooks, composant), `Frontend/src/pages/ProfilPage.tsx`

---

## [2026-06-05] decision | HOM-300 — Conception gestion des adresses client

**Périmètre de HOM-300 (profil client — premier chantier du Sprint 3) :**

**UX retenue** : pattern identique à `MesCycles` — chips affichant `titre_description`, formulaire inline au clic pour éditer, bouton `+` pour créer. L'adresse principale est marquée visuellement avec un toggle dans le formulaire.

**Règle métier unicité adresse principale :**
Un client n'a qu'une seule `adresse_principal = true` à la fois. Lors du passage à `true` : transaction atomique (`UPDATE all = false` puis `UPDATE target = true`). Désactiver le toggle → aucune adresse principale (état valide).

**Immutabilité de l'adresse geocodée (Option A retenue) :**
L'adresse elle-même (rue, lat/lng, google_id, ville…) est immuable après création — elle provient du géocodage Google Maps. Seuls `titre_description` et `adresse_principal` (sur `Peut_se_situer`) sont éditables via `PATCH`. Pour changer d'adresse, l'utilisateur supprime et recrée.

**Soft-delete :**
`DELETE /adresses/:id` → `isValide = false` + `date_invalidité = now()` sur `Peut_se_situer`. La ligne `Adresse` est conservée (historique interventions).

**Endpoints backend :**
- `GET /adresses` → liste des adresses actives du client connecté
- `POST /adresses` → geocoding Google Maps + création `Adresse` + `Peut_se_situer`
- `PATCH /adresses/:id` → mise à jour `titre_description` et/ou `adresse_principal` (transaction si principal)
- `DELETE /adresses/:id` → soft-delete

---

## [2026-06-05] decision | Conception Sprint 3 — Parcours client de réservation

Séance de conception complète du Sprint 3 avant démarrage du développement.

**MCD finalisé — entités Adresse & Intervention :**
- `Ville` et `Pays` supprimés comme entités séparées → champs plats directement sur `Adresse` (`code_postal`, `ville`, `pays`). Justification : complexité inutile pour un service hyperlocal.
- `Statut_Intervention` supprimé comme table → remplacé par un **enum Prisma** `StatutIntervention` (`PLANIFIEE`, `TERMINEE`, `ANNULEE`). Justification : 3 valeurs fixes non administrables par le client — l'enum est une contrainte de type au niveau base de données, plus rigoureux qu'une table de lookup.
- `adresse_facturation` supprimé de `Peut_se_situer` — paiement physique uniquement, aucun usage dans le MVP.
- Ajout de `titre_description` (nullable) sur `Peut_se_situer` — libellé libre affiché dans le dropdown de sélection d'adresse ("Chez moi", "Bureau"…). Fallback : adresse formatée si null.

**Sémantique de `isValide` clarifiée :**
`isValide` sur `Peut_se_situer` est un **soft-delete** uniquement — l'utilisateur (ou l'admin) désactive une adresse qui reste en base pour l'historique. Il n'a aucun lien avec la vérification de zone, qui est une opération temps réel au moment de la réservation.

**Vérification de zone — backend uniquement :**
L'algorithme point-in-polygon (lat/lng → `zone_id`) est exécuté côté backend pour éviter toute manipulation côté client. Deux endpoints distincts : `POST /adresses/validate` (Google Maps Geocoding) puis `POST /zones/check` (point-in-polygon sur `ZonePoint`).

**Ordre du tunnel corrigé :**
Forfait sélectionné AVANT les créneaux (la durée du forfait détermine quels créneaux sont compatibles). Ordre validé : Adresse → Zone → Cycle → Forfait → Créneaux → Auth → Confirmation.

**Gestion de l'utilisateur non connecté — `ReservationContext` :**
L'état du tunnel vit dans un React context (`ReservationContext`). Les données du nouvel utilisateur (prénom, nom, email, téléphone, password) sont collectées inline à l'étape auth. À la confirmation, `POST /interventions` reçoit tout — le backend orchestre la création (utilisateur + adresse + intervention + créneau) en transaction atomique. L'adresse saisie durant le tunnel n'est pas automatiquement sauvegardée au profil (Option B — contextuelle, portée par l'Intervention uniquement).

**User stories Sprint 3 :** HOM-290 · HOM-295 · HOM-300 · HOM-305 · HOM-310 · HOM-315

---

## [2026-05-30] changement | HOM-285 — Génération automatique des créneaux disponibles

Implémentation full-stack de la génération algorithmique des créneaux. Backend : 2 nouveaux use cases TDD (`GenerateCreneaux` + `GenerateAllCreneaux`) appliquant l'algorithme 3 couches (modèle → filtre pauses/indisponibilités → idempotence) ; use cases complémentaires (`GetCreneaux`, `DeleteCreneau`, `DeleteCreneauxDisponibles`) ; rapport de génération (créés / supprimés / conflits). Frontend : onglet "Créneaux" dans `AdminPlanningSection` avec `CreneauGenerationForm` (sélecteur technicien + plage de dates), `CreneauxTab` (affichage résultats), `GenerationRapportDialog` (synthèse post-génération) ; `adminPlanningService` et `useAdminPlanning` étendus.
Fichiers concernés : `planning/use-cases/generate-creneaux.*`, `generate-all-creneaux.*`, `get-creneaux.*`, `delete-creneau.*`, `delete-creneaux-disponibles.*`, `admin/components/planning/CreneauxTab/`, `AdminPlanningSection.tsx`, `adminPlanningService.ts`, `useAdminPlanning.ts`, `planning.types.ts`

---

## [2026-05-25] changement | HOM-280 — Administration des modèles de planification

Implémentation full-stack de la gestion de la planification des techniciens dans l'espace admin.

**Backend :** migration Prisma `add_planning_models` ajoutant 4 nouveaux modèles — `ModelePlanification` (patron récurrent jour/horaires/zone/intervalle/validité), `PauseRecurrente` (pause hebdomadaire fixe, `jour_semaine` nullable = tous les jours), `Indisponibilite` (absence ponctuelle), `Creneau` (squelette pour HOM-285). Back-relations ajoutées sur `Utilisateur` et `Zone`. Module `features/planning/` en Clean Architecture : 10 use cases TDD (29 tests verts) avec logique de détection de chevauchement horaire et de période de validité (`NOT (fin_new <= debut OR debut_new >= fin)` exprimé en SQL Prisma). Algorithme d'overlap sur les `ModelePlanification` : intersection simultanée des plages horaires (`heure_fin > heureDebut AND heure_debut < heureFin`) et des périodes de validité (gestion du cas `date_fin_validite = null` → validité indéfinie). Repository Prisma avec `toModeleDto` / `toPauseDto` / `toIndisponibiliteDto`. Controller `admin-planning.controller.ts` sous `RBAC admin`. Route `GET /admin/affectations/:technicienId` ajoutée au module affectations (use case `GetAffectationByTechnicienUseCase`, spec TDD). Correction bug TypeScript : `CreateModeleData` / `UpdateModeleData` utilisaient une intersection avec `ModelePlanificationDto` sans exclure les champs date (`string & Date` = type impossible) — corrigé avec `Omit<..., 'date_debut_validite' | 'date_fin_validite'>`.

**Frontend :** types `planning.types.ts`, service `adminPlanningService` (avec `.catch()` 404 gracieux sur `getZonesForTechnicien`), utilitaire `timeUtils.ts` (`timeToMinutes` / `minutesToTime`). Hook `useAdminPlanning` : sélecteur technicien + rechargement `Promise.all` réactif sur les 3 endpoints à chaque changement de technicien. 7 composants : `AdminPlanningSection` (orchestrateur avec Tabs shadcn), `ModelePlanificationList` + `ModelePlanificationFormDialog` (create/edit, chargement paresseux des zones au ouverture, `useEffect` avec pattern `cancelled`), `PauseRecurrenteList` + `PauseRecurrenteFormDialog`, `IndisponibiliteList` + `IndisponibiliteFormDialog`, `PlanningDeleteDialog` générique. Affichage du message d'erreur 409 (ConflictException chevauchement) dans le formulaire via try/catch sur `onSubmit`. `AdminLayout` mis à jour.

Fichiers concernés : `prisma/schema.prisma`, `prisma/migrations/20260525100112_add_planning_models/`, `features/planning/` (backend), `features/affectations/use-cases/get-affectation-by-technicien.use-case.ts`, `features/affectations/controllers/admin-affectations.controller.ts`, `features/affectations/affectations.module.ts`, `admin/components/planning/` (frontend), `hooks/useAdminPlanning.ts`, `services/adminPlanningService.ts`, `types/planning.types.ts`, `shared/utils/timeUtils.ts`, `AdminLayout.tsx`

---

## [2026-05-25] decision | Conception du module Planification (HOM-280 + HOM-285)

Conception complète du module de planification des créneaux après analyse métier approfondie. Décisions structurantes :

**Modèle de données — 3 nouvelles entités :**
- `ModelePlanification` : patron récurrent (technicien + zone + jour_semaine + horaires + intervalle_minutes + période de validité). Un modèle = un technicien + une zone + un jour → pas de table de liaison zone/modèle.
- `PauseRecurrente` : pause hebdomadaire fixe par technicien. `jour_semaine` nullable (null = tous les jours — cas standard pour la pause déjeuner).
- `Indisponibilite` : absence ponctuelle saisie par l'admin (flux email → admin). Pas de workflow de validation dans l'app.

**Modifications sur `Creneau` :**
- Ajout `id_modele_planification` (nullable — null pour créneaux manuels, FK traçabilité vers le modèle générateur)
- Ajout `id_zone` (direct, non nullable — snapshot de la zone au moment de la génération, pour performance des requêtes client et stabilité si le modèle évolue)
- `id_utilisateur` (technicien) dérivable via `Creneau → ModelePlanification → id_utilisateur` — pas stocké directement sur Creneau
- `date_fin` devient nullable — calculée à la réservation : `date_debut + forfait.duree_minutes`

**Algorithme de génération (3 couches) :**
Pour chaque jour J dans la période : si J correspond au jour_semaine du modèle → pour chaque slot H par pas de intervalle_minutes → skip si chevauchement PauseRecurrente ou Indisponibilite → skip si créneau déjà existant (idempotence) → INSERT Creneau.
La régénération supprime les créneaux libres dans les périodes d'absence et retourne un rapport (N créés / N supprimés / N conflits). Les créneaux réservés (`is_disponible = false`) ne sont jamais supprimés — signalés comme conflits à traiter manuellement.

**Logique de réservation :**
Un créneau est disponible pour un forfait donné si `date_debut + forfait.duree_minutes <= date_debut du prochain créneau réservé`. Le forfait est sélectionné AVANT le créneau dans le parcours client (ordre validé).

**Interface admin :**
Section "Planning" avec deux onglets dans `AdminLayout` (option B choisie) : "Modèles" (modèles + pauses + absences) et "Créneaux" (génération + visualisation). La section "Affectations" existante est conservée sans modification — elle reste le prérequis structurel.

**Règles métier critiques du use case CreateModelePlanification :**
1. Vérifier que `technicien_id` est bien affecté à `zone_id` via `TechnicienZone`
2. Vérifier absence de chevauchement temporel avec les modèles existants du technicien

**Dénormalisations intentionnelles documentées dans `metier.md`** (snapshot pattern) : `Creneau.id_zone`, `Intervention.id_technicien`, `Intervention.duree_minutes`, `Intervention.id_adresse`, `Intervention.id_historique_prix_forfait`.

**Correction bug JWT (hors feature) :**
- `apiClient.ts` : exclusion des routes `/auth/logout` et `/auth/refresh` du mécanisme d'intercepteur de refresh (évitait que le logout soit bloqué par une tentative de refresh infructueuse)
- URL de redirection corrigée : `/connexion` → `/login`
- `useLogout.ts` : déplacement du `console.log` à l'intérieur de `handleLogout` (évitait le spam à chaque rendu)

---

## [2026-05-07] changement | HOM-275 — Affectation des techniciens aux zones

Implémentation full-stack de la gestion des affectations zones-techniciens dans l'espace admin. Backend : migration Prisma `add-technicien-zones` (table `TechnicienZones` avec PK composite `[technicien_id, zone_id]`, `onDelete: Cascade` des deux côtés), back-relations ajoutées sur `Utilisateur` et `Zone`. Module `features/affectations/` en Clean Architecture : 3 use cases (`GetAffectations`, `SetTechnicienZones`, `DeleteTechnicienAffectations`) avec 8 tests Jest TDD verts, repository Prisma avec transaction atomique sur le remplacement des zones (deleteMany + createMany), controller admin protégé RBAC avec sémantique `PUT` (idempotent). Vérification du rôle `technicien` dans `technicienExists()`. Frontend : section `AdminAffectationsSection` avec table (colonnes : Technicien, Zones affectées en badges, Actions), `AffectationFormDialog` (select technicien désactivé en mode édition + checkboxes zones, chargement paresseux à l'ouverture), `AffectationDeleteDialog`. Hook `useAdminAffectations` + `adminAffectationsService` (avec `getTechniciens()` et `getZones()` pour le formulaire). `AdminSidebar` et `AdminLayout` mis à jour.
Fichiers concernés : `prisma/schema.prisma`, `features/affectations/` (backend), `admin/components/affectations/`, `useAdminAffectations.ts`, `adminAffectationsService.ts`, `affectations.types.ts`, `AdminSidebar.tsx`, `AdminLayout.tsx`

---

## [2026-05-07] configuration | Injection VITE_GOOGLE_MAPS_API_KEY dans la CI/CD

Ajout du secret `VITE_GOOGLE_MAPS_API_KEY` dans le pipeline GitHub Actions. Vite injectant les variables d'environnement au **build time** (pas au runtime), la clé doit être disponible lors du `docker build`. Deux modifications : `ARG VITE_GOOGLE_MAPS_API_KEY` + `ENV` dans `Frontend/Dockerfile` (stage builder, avant `npm run build`), et `build-args: VITE_GOOGLE_MAPS_API_KEY=${{ secrets.VITE_GOOGLE_MAPS_API_KEY }}` dans les deux jobs `build-and-push-staging` et `build-and-push-prod`. Le secret est défini dans GitHub → Settings → Secrets → Actions.
Fichiers concernés : `Frontend/Dockerfile`, `.github/workflows/ci-cd.yml`

---

## [2026-05-06] changement | Administration des zones avec Google Maps

Implémentation full-stack du module zones dans l'espace admin. Backend : module `features/zones/` en Clean Architecture (6 use cases : create, update, delete, get, get-by-id + specs Jest TDD), migration Prisma `add_zones`, DTOs, repository Prisma, contrôleur admin protégé par RBAC. Frontend : section `AdminZonesSection` avec composants `ZoneMapDrawer` (dessin de polygones via Google Maps API), `ZoneForm`, `ZonesList`, `ZoneDeleteDialog`, hook `useAdminZones` et `adminZonesService`.
Fichiers concernés : `prisma/schema.prisma`, `features/zones/` (backend), `admin/components/zones/ZoneMapDrawer/`, `ZoneForm/`, `ZonesList/`, `ZoneDeleteDialog/`, `useAdminZones.ts`, `adminZonesService.ts`, `zones.types.ts`

---

## [2026-05-05] changement | Administration des forfaits et historique des prix

Implémentation full-stack de la gestion des forfaits dans l'espace admin. Backend : module `features/forfaits/` en Clean Architecture (5 use cases : create, update, delete, get, set-prix) + specs Jest TDD, migration Prisma `add_forfaits`, DTOs dédiés, contrôleur admin protégé par RBAC. Frontend : section `AdminForfaitsSection` avec dialogs de création/édition/suppression/définition de prix, hook `useAdminForfaits`, `adminForfaitsService` et types. Finalisation du use case `refresh-token` et mise à jour des specs Jest auth.
Fichiers concernés : `prisma/schema.prisma`, `features/forfaits/` (backend), `admin/components/forfaits/`, `useAdminForfaits.ts`, `adminForfaitsService.ts`, `forfaits.types.ts`, `refresh-token.use-case.ts`

---

## [2026-05-01] changement | Pages légales, suppression de compte et refresh token

Ajout des trois pages légales (CGU, Mentions légales, Confidentialité) avec le composant partagé `LegalPageLayout`. Implémentation de la suppression de compte côté backend (use case + spec Jest, repository users mis à jour) et frontend (composant `DeleteAccountSection` intégré dans `ProfilPage`, hook `useDeleteAccount`). Mise en place du use case `refresh-token` en Clean Architecture (spec Jest) et mise à jour de `apiClient.ts` pour le refresh silencieux des tokens JWT.
Fichiers concernés : `CguPage.tsx`, `MentionsLegalesPage.tsx`, `ConfidentialitePage.tsx`, `LegalPageLayout/`, `refresh-token.use-case.ts`, `delete-account.use-case.ts`, `DeleteAccountSection/`, `useDeleteAccount.ts`, `apiClient.ts`

---

## [2026-04-28] changement | HOM-251 — Gestion des cycles client

Implémentation complète de la gestion des vélos par le client (CRUD).

**MLD v2 :** correction de la relation Cycle ↔ Marque : n-1 (FK directe `marque_id` dans `Cycle`), pas de table de jointure. Ajout du champ `libelle` (obligatoire) pour distinguer les vélos. Champ `particularite` (optionnel) pour les notes libres.

**Backend :** module `features/cycle/` en Clean Architecture. Deux migrations Prisma (`add-cycle`, `add-cycle-libelle`). TDD : 4 specs Jest, 10 tests verts, écrits avant les use cases. Règles métier testées : filtrage par `utilisateurId` (GET), vérification ownership avant mutation (`ForbiddenException`), ressource inexistante (`NotFoundException`). Repository Prisma avec `include` marque + type_cycle. Controller `GET|POST|PATCH|DELETE /cycles` protégé `JwtAuthGuard` (ownership suffisant, pas de RolesGuard). Double controller dans les modules référentiel : `GET /referentiel/marques` et `GET /referentiel/type-cycles` accessibles aux clients authentifiés.

**Frontend :** feature `features/cycle/` avec types, `cycleService`, `referentielService`, `useCycles`, `useReferentiel`. Composant `MesCycles` intégré dans `ProfilPage` (pas de route dédiée — le cycle est une donnée du profil). UX : chips de sélection (fond orange sur actif), formulaire inline avec selects référentiel + flèche CSS custom, textarea particularités, bouton "Modifier"/"Enregistrer" orange, "Supprimer" en texte.

**Décisions :** `libelle` obligatoire (évite l'ambiguïté lors de la sélection pour une intervention). `MesCycles` dans `ProfilPage` plutôt qu'une route dédiée (cohérence "Mon compte"). `appearance: none` + `background-image` SVG pour styler les selects sans perdre le comportement natif.

Fichiers concernés : `prisma/schema.prisma`, `features/cycle/`, `features/referentiel/marques/controllers/referentiel-marques.controller.ts`, `features/referentiel/type-cycles/controllers/referentiel-type-cycles.controller.ts`, `app.module.ts`, `Frontend/src/features/cycle/`, `Frontend/src/pages/ProfilPage.tsx`

---

## [2026-04-27] changement | HOM-246 — Administration des Marques et Types de cycles

Implémentation complète de la gestion des données de référence cycles.

**Backend :** deux modules Clean Architecture dans `features/referentiel/` (décision délibérée — pas dans `admin/` pour éviter le couplage avec la future feature `cycle`). Schéma Prisma : modèles `Marque` et `TypeCycle` avec contrainte `@unique` sur `libelle`. Pour chaque module : interface repository, implémentation Prisma, 4 use cases (get/create/update/delete) + 10 tests Jest (TDD), controller sécurisé `@Roles('admin')`, module NestJS avec token DI. Total : 20 tests verts. Endpoints : `/api/admin/marques`, `/api/admin/type-cycles`.

**Frontend :** section "Cycles" dans la sidebar admin avec onglets internes shadcn `Tabs` (Marques / Types de cycles). Composants `CycleItemFormDialog` et `CycleItemDeleteDialog` partagés entre les deux onglets (shape identique `{ id, libelle }`). Hooks `useAdminMarques`, `useAdminTypeCycles` + services associés.

**Décision d'architecture :** `features/referentiel/` pour les données de configuration partagées (vs `features/admin/` qui crée un couplage illégitime).

**Refactoring composants admin :** réorganisation de `admin/components/` en sous-dossiers par domaine métier : `layout/` (AdminLayout, AdminSidebar, AdminMobileBlocker), `users/` (UsersTable, UserFormDialog, DeleteConfirmDialog), `cycles/` (AdminCyclesSection, MarquesTab, TypesCyclesTab, dialogs).

**Aération Table shadcn :** padding `td`/`th` centralisé dans `global.scss` via `[data-slot]` pour s'appliquer à tous les futurs composants Table. `font-bold` sur les en-têtes via `table.tsx`.

Fichiers concernés : `prisma/schema.prisma`, `features/referentiel/marques/`, `features/referentiel/type-cycles/`, `app.module.ts`, `AdminSidebar.tsx`, `AdminLayout.tsx`, `admin/components/layout/`, `admin/components/users/`, `admin/components/cycles/`, `global.scss`, `table.tsx`

---

## [2026-04-26] fix | Correction du mock bcrypt et de la casse des polices pour la CI

Remplacement de `jest.spyOn` par `jest.mock` pour bcrypt (module natif non redéfinissable en Jest) et ajout du mock `bcrypt.hash` dans le test de login valide. Correction de la casse des noms de fichiers dans `_fonts.scss` (système de fichiers Linux case-sensitive), bloquante en CI. Ajustements mineurs sur `auth.module.ts` et les use-cases users.
Fichiers concernés : `login.use-case.spec.ts`, `register.use-case.spec.ts`, `confirm-email.use-case.spec.ts`, `get-profile.use-case.spec.ts`, `update-profile.use-case.spec.ts`, `auth.module.ts`, `update-profile.use-case.ts`, `users.prisma.repository.ts`, `_fonts.scss`

---

## [2026-04-26] refactor | Uniformisation Clean Architecture sur auth & users + exclusion wiki du dépôt

Refactorisation des modules `auth` et `users` (backend) pour adopter le pattern Clean Architecture complet : use cases explicites (`login`, `logout`, `register`, `confirm-email`, `get-profile`, `update-profile`) avec leurs specs Jest, interfaces de repository et implémentations Prisma séparées. Côté frontend, alignement des hooks et services auth/user sur la nouvelle structure. Le wiki (`docs/wiki/`) est désormais exclu du dépôt Git (Obsidian inclus).
Fichiers concernés : `auth.controller.ts`, `auth.module.ts`, `auth.prisma.repository.ts`, `auth.repository.interface.ts`, `*.use-case.ts`, `users.controller.ts`, `users.module.ts`, `users.prisma.repository.ts`, `useLogin.ts`, `useLogout.ts`, `useRegister.ts`, `useProfile.ts`, `useUpdateProfile.ts`

---

## [2026-04-26] changement | Intégration de l'administration des utilisateurs (CRUD complet)

Mise en place du module `admin` backend (Clean Architecture) : use cases `GetUsers`, `CreateUser`, `UpdateUser`, `DeleteUser` avec leurs specs Jest, repository Prisma, DTOs de pagination et de validation, contrôleur sécurisé par `RolesGuard` (RBAC). Côté frontend : `AdminPage`, `AdminLayout`, `AdminSidebar`, `AdminMobileBlocker`, `UsersTable`, `UserFormDialog`, `DeleteConfirmDialog`, hook `useAdminUsers`, `adminUsersService`. Ajout de `shadcn/ui` (`dialog`, `table`) et du hook `useIsMobile`. L'accès est bloqué sur mobile via `AdminMobileBlocker`.
Fichiers concernés : `admin.module.ts`, `admin-users.controller.ts`, `*use-case.ts`, `admin-users.prisma.repository.ts`, `roles.guard.ts`, `AdminPage.tsx`, `AdminLayout/`, `UsersTable/`, `UserFormDialog/`, `DeleteConfirmDialog/`, `useAdminUsers.ts`, `adminUsersService.ts`

---

## [2026-04-25] decision | Pattern architectural : Clean Architecture avec UseCases explicites

Décision de maintenir le pattern UseCase + Repository Interface (Clean Architecture stricte) plutôt que le pattern Service NestJS classique, en vue d'une évolution future vers les microservices. Ce pattern permet de remplacer l'implémentation Prisma par un appel HTTP sans toucher à la logique métier.
Dette technique identifiée : `users` et `auth` utilisent encore le pattern Service + PrismaService direct — à aligner sur le nouveau pattern lors d'un sprint dédié.

---

## [2026-04-23] changement | Intégration du flux complet de gestion des profils utilisateurs

Ajout de l'endpoint `PATCH /users/me` (backend) avec DTO de mise à jour et `UserProfileDto` en réponse. `UsersService` expose `getProfile` et `updateProfile` ; `UsersController` est sécurisé par `JwtAuthGuard`. Côté frontend : hook `useProfile`, hook `useUpdateProfile`, `userService`, `ProfileForm` (composant + styles SCSS) et `ProfilPage` câblée dans `App.tsx`. Tests unitaires `users.service.spec.ts` mis à jour.
Fichiers concernés : `users.controller.ts`, `users.service.ts`, `users.service.spec.ts`, `update-user.dto.ts`, `user-profile.dto.ts`, `useProfile.ts`, `useUpdateProfile.ts`, `userService.ts`, `ProfileForm.tsx`, `ProfilPage.tsx`, `App.tsx`

---

## [2026-04-21] changement | Affichage du prénom et de l'indicateur de rôle dans le header

Enrichissement du contexte d'authentification : `auth-response.dto.ts` expose désormais le prénom de l'utilisateur et son rôle. `AuthContext` et ses types sont mis à jour pour stocker ces données. Le `Header` affiche le prénom connecté et un badge de rôle, avec les styles SCSS associés.
Fichiers concernés : `auth-response.dto.ts`, `auth.service.ts`, `auth.service.spec.ts`, `AuthContext.tsx`, `auth.types.ts`, `Header.tsx`, `Header.module.scss`, `_variables.scss`

---

## [2026-04-20] configuration | Configuration Nginx SPA pour React Router

Ajout d'une configuration Nginx dans le Frontend pour rediriger toutes les routes vers `index.html`, évitant les erreurs 404 lors du rechargement d'une page gérée par React Router.
Fichiers concernés : `Frontend/nginx.conf`, `Frontend/Dockerfile`

---

## [2026-04-20] fix | Inclusion des migrations Prisma dans le contexte Docker

Le `.dockerignore` du backend excluait le dossier `prisma/migrations`, ce qui empêchait l'exécution de `prisma migrate deploy` au démarrage du conteneur.
Fichiers concernés : `Backend/.dockerignore`

---

## [2026-04-20] fix | Ajout de la copie des schémas Prisma dans le Dockerfile Backend

Le `Dockerfile` du backend ne copiait pas les schémas Prisma nécessaires à la génération du client, ce qui causait une erreur au build de l'image Docker.
Fichiers concernés : `Backend/Dockerfile`, `Backend/package.json`

---

## [2026-04-20] configuration | Retrait de .env.production du .dockerignore Frontend

Le fichier `Frontend/.env.production` était ignoré par `.dockerignore`, ce qui empêchait Docker de l'inclure dans l'image et causait des variables d'environnement manquantes en production.
Fichiers concernés : `Frontend/.dockerignore`

---

## [2026-04-20] configuration | Mise à jour des variables d'environnement staging

Correction et synchronisation des fichiers `.env` pour l'environnement staging : ajustement des variables dans `Frontend/.env.production` et des deux fichiers Docker Compose pour assurer la cohérence entre les stacks prod et staging.
Fichiers concernés : `.gitignore`, `Frontend/.env.production`, `docker-compose.prod.yml`, `docker-compose.staging.yml`

---

## [2026-04-20] fix | Correction d'un chemin erroné dans le Dockerfile Backend

Résolution d'une erreur de chemin dans le `Dockerfile` du backend qui provoquait un échec au build de l'image Docker.
Fichiers concernés : `Backend/Dockerfile`

---

## [2026-04-19] configuration | Correction du Dockerfile Backend pour la CI/CD

Résolution d'un problème bloquant dans le Dockerfile du backend empêchant le bon déroulement de la pipeline CI/CD.
Fichiers concernés : `Backend/Dockerfile`

---

## [2026-04-19] configuration | Correction du workflow CI/CD

Correction d'un problème bloquant dans le fichier de workflow GitHub Actions.
Fichiers concernés : `.github/workflows/ci-cd.yml`

---

## [2026-04-19] configuration | Correction des problèmes de pipeline CI/CD

Résolution des erreurs bloquant la pipeline GitHub Actions : ajustements du workflow `ci-cd.yml` et corrections dans `auth.service.spec.ts` pour que les tests Jest passent en environnement CI.
Fichiers concernés : `.github/workflows/ci-cd.yml`, `Backend/src/features/auth/services/auth.service.spec.ts`

---

## [2026-04-19] fix | Suppression de l'import useNavigate inutilisé dans useRegister

Retrait de l'import `useNavigate` non utilisé dans le hook `useRegister.ts`, corrigeant un warning TypeScript/ESLint. Le hook n'effectue pas de navigation après inscription — il délègue ce comportement au composant appelant.
Fichiers concernés : `Frontend/src/features/auth/hooks/useRegister.ts`

---

## [2026-04-19] changement | Authentification frontend complète + tests unitaires AuthService

Intégration finale du cycle auth côté React : `RegisterForm` (mise en page 2 colonnes, SCSS dédié), hooks `useRegister` et `useLogout`, `authService`, pages `LoginPage` / `RegisterPage` / `ConfirmEmailPage`, routage dans `App.tsx`. Corrections backend associées : `main.ts` (prefix `/api`), `cookie.config.ts` (path refresh token), `PrismaService`. Tests unitaires Jest : 11 cas couvrant `register`, `confirmEmail`, `login`, `logout` dans `auth.service.spec.ts`.
Fichiers concernés : `features/auth/hooks/useRegister.ts`, `useLogout.ts`, `authService.ts`, `RegisterForm/`, `pages/LoginPage.tsx`, `RegisterPage.tsx`, `ConfirmEmailPage.tsx`, `App.tsx`, `Header.tsx`, `auth.service.ts`, `auth.service.spec.ts`, `main.ts`, `cookie.config.ts`, `prisma.service.ts`

---

## [2026-04-19] changement | Diagrammes de séquence — Login & Register

Création des diagrammes de séquence pour les flux Login et Register dans le cadre de la préparation à la présentation CDA. Chaque diagramme couvre deux niveaux : macro (Navigateur / React App / NestJS API / BDD / SMTP) et micro (acteurs internes : LoginForm, useLogin, authService, apiClient, AuthController, AuthService, JwtService, PrismaService). Les flux d'erreurs sont représentés en fragments `alt` : email en double (409), DTO invalide (400), mot de passe incorrect (401), compte inactif (403). Stratégie retenue : 5-6 diagrammes pour les flux complexes uniquement (Login, Register, Créer intervention, Vérification zone).

---

## [2026-04-19] fix | Corrections bugs post-intégration frontend/backend

Trois corrections suite aux tests manuels en navigateur :
- `main.ts` — ajout de `setGlobalPrefix('api')` : toutes les routes préfixées `/api/*` pour correspondre à `VITE_API_URL` et à la config Nginx en production
- `ConfirmEmailPage.tsx` — ajout d'un `useRef` comme verrou pour éviter le double appel API causé par React Strict Mode (l'effet s'exécutait deux fois, consommant le token puis échouant sur le second appel)
- `cookie.config.ts` — correction du `path` du cookie `refresh_token` : `/auth/refresh` → `/api/auth/refresh` pour correspondre au préfixe global

Fichiers concernés : `src/app/main.ts`, `Frontend/src/pages/ConfirmEmailPage.tsx`, `src/config/cookie.config.ts`

---

## [2026-04-19] changement | Tests Jest AuthService + logs NestJS

Ajout du Logger NestJS dans `AuthService` (niveaux `log`/`warn` par méthode, token tronqué à 8 caractères pour la sécurité). Création de `auth.service.spec.ts` avec 11 tests unitaires couvrant les 4 méthodes : `register` (2), `confirmEmail` (3), `login` (4), `logout` (1). Pattern de mock : `Test.createTestingModule` + `jest.spyOn(...).mockResolvedValue(...)`. Mock de `Response` Express via fonction utilitaire `mockRes()`. Tâche "Tests Jest" du Sprint 1 cochée.

Fichiers concernés : `src/features/auth/services/auth.service.ts`, `src/features/auth/services/auth.service.spec.ts`

---

## [2026-04-16] changement | Finalisation du cycle d'authentification frontend

Complétion du cycle auth côté React : hook `useRegister` + composant `RegisterForm` (2 colonnes prénom/nom, confirm password, case CGU, message succès), pages `LoginPage` / `RegisterPage` / `ConfirmEmailPage`, routing `/login`, `/inscription`, `/confirmer-email` dans `App.tsx` (lazy + Suspense). Hook `useLogout` câblé sur `POST /auth/logout` avec pattern `try/finally` (déconnexion locale garantie même en cas d'erreur réseau). Header mis à jour pour consommer `useLogout` au lieu de `logout` direct depuis `useAuth`.

Points notables :
- `ConfirmEmailPage` initialise son état depuis le token URL (`useState(token ? 'loading' : 'error')`) pour éviter un setState synchrone dans useEffect
- `useLogout` adopte le pattern `try/catch/finally` : l'appel API peut échouer sans bloquer la déconnexion locale
- Le `RegisterForm` ne navigue pas après inscription — il affiche un message de succès invitant à vérifier la boîte mail

Fichiers concernés : `features/auth/hooks/useRegister.ts`, `features/auth/hooks/useLogout.ts`, `features/auth/components/RegisterForm/`, `pages/LoginPage.tsx`, `pages/RegisterPage.tsx`, `pages/ConfirmEmailPage.tsx`, `app/App.tsx`, `shared/components/Header/Header.tsx`

---

## [2026-04-14] changement | Implémentation complète du backend authentification

Mise en place de l'intégralité du module auth backend : schéma Prisma (modèle `Utilisateur`), PrismaService injectable, DatabaseModule global, configuration JWT/cookies, EmailModule (Nodemailer + Mailpit), DTOs de validation, JWT Strategy Passport, AuthService (register/confirmEmail/login/logout), AuthController et AuthModule. Mise à jour de `main.ts` (cookieParser, CORS, ValidationPipe) et `AppModule`.

Points notables :
- `tsconfig.json` migré de `nodenext` vers `commonjs` (incompatibilité NestJS CLI + webpack)
- `nest-cli.json` — ajout de `entryFile: "app/main"` pour respecter l'architecture custom (`src/app/`)
- `prisma.config.ts` exclu de la compilation NestJS via `tsconfig.build.json`
- Architecture feature-based respectée : `controllers/`, `services/`, `modules/`, `strategies/`, `guards/` dans `features/auth/`
- Flux testé manuellement et validé : register → email Mailpit → confirm → login → cookies posés

Fichiers concernés : `prisma/schema.prisma`, `src/shared/prisma/`, `src/shared/database/`, `src/config/`, `src/features/email/`, `src/features/auth/`, `src/app/main.ts`, `src/app/app.module.ts`, `nest-cli.json`, `tsconfig.json`, `tsconfig.build.json`

---

## [2026-04-12] changement | Intégration de PageLayout, Carousel et HeroBrand

Création et intégration de trois composants partagés : `PageLayout` (structure de mise en page commune), `Carousel` (galerie défilante) et `HeroBrand` (bloc hero identitaire). Assemblage dans la page `Home`.
Fichiers concernés : `pages/Home.tsx`, `shared/components/PageLayout/`, `shared/components/Carousel/`, `shared/components/HeroBrand/`

---

## [2026-04-12] changement | Intégration du composant Footer

Création du composant Footer avec ses styles SCSS dédiés et intégration dans la page `Home`. Mise à jour des styles globaux (`_base.scss`, `_reset.scss`) pour assurer la cohérence visuelle (fond brun foncé, liens légaux, copyright LeCycleLyonnais).
Fichiers concernés : `shared/components/Footer/Footer.tsx`, `Footer.module.scss`, `pages/Home.tsx`, `app/styles/_base.scss`, `app/styles/_reset.scss`

---

## [2026-04-12] changement | Implémentation du composant Header et MobileMenu

Création du header principal avec navigation responsive : version desktop (logo + liens Connexion/S'inscrire) et version mobile via un drawer orange (`MobileMenu`). Ajout d'icônes SVG utilitaires (email, téléphone, œil ouvert/fermé) et mise à jour du `LoginForm` associé.
Fichiers concernés : `shared/components/Header/Header.tsx`, `MobileMenu/MobileMenu.tsx`, `features/auth/components/LoginForm/LoginForm.tsx`, `app/styles/_variables.scss`

---

## [2026-04-11] changement | Ajout en cours du module d'authentification frontend

Mise en place des fondations de l'authentification côté React : `AuthContext`, `ProtectedRoute`, `LoginForm`, hook `useLogin`, `authService` et client API centralisé (`apiClient.ts`).
Fichiers concernés : `authContext/AuthContext.tsx`, `ProtectedRoute.tsx`, `features/auth/`, `shared/services/apiClient.ts`

---

## [2026-04-09] configuration | Validation du hook post-commit wiki

Vérification du bon fonctionnement du hook Git post-commit chargé de mettre à jour automatiquement `docs/wiki/log.md` après chaque commit.
Fichiers concernés : `.claude/settings.json` (hook), `docs/wiki/log.md`

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
---

## [2026-08-16] decision | Nettoyage des créneaux — prévention à la source plutôt que rattrapage

Le nettoyage manuel de 1046 créneaux orphelins a mis en évidence que
`Creneau.modele_planification` est en `onDelete: SetNull` : supprimer un modèle de
planification détache ses créneaux au lieu de les supprimer. Les orphelins s'accumulent,
et l'endpoint de nettoyage admin — qui filtre via la relation `modele_planification` —
ne peut pas les atteindre.

Décision : traiter d'abord la cause. La suppression d'un modèle supprimera ses créneaux
libres dans la même transaction. Ne resteront orphelins que ceux portant une intervention,
ce qui est légitime pour l'historique.

En complément, deux outils admin : un bouton de suppression des créneaux non réservés à
venir par technicien, et un reset général atteignant les orphelins (seul chemin possible,
puisqu'il ne passe pas par le join `modele_planification`).

Règle de sécurité retenue pour toute suppression : `is_disponible = true` ET aucune
intervention rattachée. Le premier critère protège les slots satellites d'un bloc réservé
(une intervention de 2 h verrouille 4 slots mais n'en référence qu'un) ; le second évite
l'erreur `P2003` sur un créneau libéré par une annulation.

Alternative écartée : ne fournir que des boutons de nettoyage. Soigner le symptôme aurait
laissé la fuite ouverte à chaque manipulation de planning.

Purge des créneaux passés confiée à un cron ultérieur, hors de ce chantier.

Chantier conçu mais reporté au prochain sprint — détail dans
[[Nettoyage des créneaux — chantier à venir]].

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
