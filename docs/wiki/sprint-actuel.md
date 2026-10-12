---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
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

**Statut :** ✅ Terminé

---

### User stories — Gestion des utilisateurs (HOM-164)

| Ticket   | Story                          | Statut       |
| -------- | ------------------------------ | ------------ |
| HOM-221  | S'authentifier (login/logout)  | ✅ Terminé   |
| HOM-226  | Créer un compte utilisateur    | ✅ Terminé   |
| HOM-231  | Gérer son profil               | ✅ Terminé   |
| HOM-236  | Administrer les utilisateurs   | ✅ Terminé   |
| HOM-241  | Supprimer son compte           | ✅ Terminé   |

### User stories — Gestion des cycles client (HOM-165)

| Ticket   | Story                          | Statut       |
| -------- | ------------------------------ | ------------ |
| HOM-246  | Administrer les types de cycles| ✅ Terminé   |
| HOM-251  | Gérer ses cycles               | ⏳ À faire   |

---

### Objectifs techniques du sprint

**HOM-221 + HOM-226 — Auth complète (✅ Terminé)**
- [x] Schéma Prisma — modèle `Utilisateur` + migration
- [x] PrismaService injectable + DatabaseModule global
- [x] Module auth — register, confirm-email, login, logout
- [x] JWT access token (15min) + refresh token (7j) en cookies HttpOnly
- [x] Email de confirmation via Nodemailer + Mailpit en dev
- [x] Validation des DTOs via `class-validator`
- [x] Guards JWT + Strategy Passport
- [x] `authService.ts` — register(), logout()
- [x] Hooks `useRegister`, `useLogout`
- [x] Composant `RegisterForm` + SCSS
- [x] Pages `LoginPage`, `RegisterPage`, `ConfirmEmailPage`
- [x] Routing `/login`, `/inscription`, `/confirmer-email`
- [x] Header — logout câblé sur `useLogout`
- [x] Tests Jest — AuthService (11 tests)

**HOM-231 — Gérer son profil (✅ Terminé)**
- [x] Endpoint `GET /api/users/me` — retourner les infos du profil
- [x] Endpoint `PATCH /api/users/me` — modifier prénom, nom, téléphone
- [x] Page `ProfilPage` + formulaire frontend + SCSS
- [x] Hook `useProfile` + `useUpdateProfile`
- [x] `userService` — getProfile(), updateProfile()
- [x] Tests unitaires `users.service.spec.ts`

**HOM-236 — Administrer les utilisateurs (✅ Terminé)**
- [x] Endpoints CRUD `/api/admin/users` — liste paginée, création, modification, suppression
- [x] Module admin Clean Architecture (use cases + repository Prisma)
- [x] `AdminPage`, `AdminLayout`, `AdminSidebar`, `AdminMobileBlocker`
- [x] `UsersTable`, `UserFormDialog`, `DeleteConfirmDialog`
- [x] Hook `useAdminUsers` + `adminUsersService`
- [x] RBAC — accès restreint au rôle `admin`
- [x] Tests unitaires use cases (4 fichiers spec)

**HOM-241 — Supprimer son compte (✅ Terminé)**
- [x] Endpoint `DELETE /api/users/me` — suppression + déconnexion
- [x] Use case `DeleteAccount` + spec Jest
- [x] Composant `DeleteAccountSection` intégré dans `ProfilPage`
- [x] Hook `useDeleteAccount`

**HOM-246 — Administrer les types de cycles + Marques (✅ Terminé)**
- [x] Schéma Prisma — modèles `Marque` + `TypeCycle` + migration
- [x] Module `referentiel/marques` — Clean Architecture, TDD (10 tests), endpoints `/admin/marques`
- [x] Module `referentiel/type-cycles` — Clean Architecture, TDD (10 tests), endpoints `/admin/type-cycles`
- [x] Section admin "Cycles" — sidebar + onglets shadcn (Marques / Types de cycles)
- [x] `MarquesTab`, `TypesCyclesTab`, `CycleItemFormDialog`, `CycleItemDeleteDialog`
- [x] Réorganisation `admin/components/` par domaine : `layout/`, `users/`, `cycles/`

**HOM-251 — Gérer ses cycles (✅ Terminé)**
- [x] Schéma Prisma — modèle `Cycle` (libelle, particularite, FK marque/type/utilisateur)
- [x] TDD — 4 use cases (10 tests verts) : get, create, update, delete
- [x] Repository interface + implémentation Prisma avec `include` relations
- [x] Controller `/cycles` (JwtAuthGuard, ownership vérifié côté use case)
- [x] Endpoints référentiel `GET /referentiel/marques` et `/referentiel/type-cycles` (clients authentifiés)
- [x] Composant `MesCycles` intégré dans `ProfilPage` (chips sélecteur + formulaire inline)

---

### Jalon associé

**J3** — fin avril : Authentification et gestion des cycles fonctionnelles.

---

---

## Sprint 2 — Prestations & Zones géographiques (Mai)

**Objectif :** Configurer les forfaits et délimiter les zones d'intervention sur la carte.

**Statut :** 🔄 En cours

---

### User stories

| Ticket  | Story                                      | Statut        |
| ------- | ------------------------------------------ | ------------- |
| HOM-260 | Administrer les forfaits                   | ✅ Terminé    |
| HOM-265 | Définir les prix des forfaits              | ✅ Terminé    |
| HOM-270 | Administrer les zones                      | ✅ Terminé    |
| HOM-275 | Affecter des techniciens aux zones         | ✅ Terminé    |
| HOM-280 | Administrer les modèles de planification   | ✅ Terminé    |
| HOM-285 | Définir les créneaux disponibles           | ✅ Terminé    |

---

### Objectifs techniques du sprint

**HOM-260 + HOM-265 — Forfaits & prix (✅ Terminé)**
- [x] Schéma Prisma — modèles `Forfait` + `HistoriquePrixForfait` + migration
- [x] Module `features/forfaits/` — Clean Architecture, TDD (13 tests verts)
- [x] Use cases : GetForfaits, GetForfaitById, CreateForfait, UpdateForfait, DeleteForfait, SetForfaitPrix
- [x] Endpoints `/admin/forfaits` + `/admin/forfaits/:id/prix`
- [x] Section admin "Forfaits" — `AdminForfaitsSection`, `ForfaitFormDialog`, `ForfaitDeleteDialog`, `ForfaitPrixDialog`
- [x] Hook `useAdminForfaits` + `adminForfaitsService`

**HOM-275 — Affectation des techniciens aux zones (✅ Terminé)**
- [x] Schéma Prisma — modèle `TechnicienZone` (table de liaison n-n) avec PK composite `[technicien_id, zone_id]` + migration `add-technicien-zones`
- [x] Back-relations ajoutées sur `Utilisateur` (`zones_affectees`) et `Zone` (`techniciens_affectes`)
- [x] Module `features/affectations/` — Clean Architecture, TDD (8 tests verts, 3 use cases)
- [x] Use cases : `GetAffectations`, `SetTechnicienZones` (PUT idempotent), `DeleteTechnicienAffectations`
- [x] Repository Prisma avec transaction atomique sur `setZonesForTechnicien` (deleteMany + createMany)
- [x] Vérification rôle `technicien` dans `technicienExists()` — protection métier
- [x] Endpoints `/admin/affectations` (GET, PUT :technicienId, DELETE :technicienId)
- [x] Section admin "Affectations" — `AdminAffectationsSection`, `AffectationFormDialog`, `AffectationDeleteDialog`
- [x] Formulaire : select technicien (désactivé en édition) + checkboxes zones avec chargement paresseux
- [x] Hook `useAdminAffectations` + `adminAffectationsService` + `affectations.types.ts`
- [x] `AdminSidebar` et `AdminLayout` mis à jour (entrée "Affectations" entre Zones et Forfaits)

**HOM-270 — Zones géographiques (✅ Terminé)**
- [x] Schéma Prisma — modèles `Zone` + `ZonePoint` + migration `add_zones`
- [x] Module `features/zones/` — Clean Architecture, TDD (13 tests verts, 5 use cases)
- [x] Use cases : GetZones, GetZoneById, CreateZone, UpdateZone, DeleteZone
- [x] Repository Prisma avec transaction atomique sur `update` (delete + recreate points)
- [x] Endpoints `/admin/zones` (GET, GET :id, POST, PATCH :id, DELETE :id)
- [x] Section admin "Zones" — `AdminZonesSection`, `ZonesList`, `ZoneForm`, `ZoneMapDrawer`, `ZoneDeleteDialog`
- [x] `ZoneMapDrawer` — dessin de polygones par clic sur Google Maps (API `@googlemaps/js-api-loader`)
- [x] Hook `useAdminZones` + `adminZonesService` + `zones.types.ts`
- [x] CI/CD — injection de `VITE_GOOGLE_MAPS_API_KEY` comme build arg Docker (secret GitHub Actions)

**HOM-280 — Administrer les modèles de planification (✅ Terminé)**
- [x] Schéma Prisma — modèles `ModelePlanification` + `PauseRecurrente` + `Indisponibilite` + `Creneau` + migration `add_planning_models`
- [x] Module `features/planning/` — Clean Architecture, TDD (10 use cases, 29 tests verts)
- [x] Use cases : `GetModeles`, `CreateModele`, `UpdateModele`, `DeleteModele`
- [x] Use cases : `GetPausesRecurrentes`, `CreatePauseRecurrente`, `DeletePauseRecurrente`
- [x] Use cases : `GetIndisponibilites`, `CreateIndisponibilite`, `DeleteIndisponibilite`
- [x] Validation métier : technicien affecté à la zone (vérification `TechnicienZone`)
- [x] Validation métier : pas de chevauchement temporel (horaire + période de validité)
- [x] Endpoints `/admin/planning/modeles` + `/admin/planning/pauses` + `/admin/planning/indisponibilites`
- [x] Route `GET /admin/affectations/:technicienId` ajoutée (prérequis formulaire modèle)
- [x] Section admin "Planning" — `AdminPlanningSection` (sélecteur technicien + Tabs shadcn)
- [x] `ModelePlanificationList` + `ModelePlanificationFormDialog` (create + edit, chargement zones paresseux)
- [x] `PauseRecurrenteList` + `PauseRecurrenteFormDialog`
- [x] `IndisponibiliteList` + `IndisponibiliteFormDialog`
- [x] `PlanningDeleteDialog` générique partagé entre les 3 entités
- [x] Hook `useAdminPlanning` + `adminPlanningService` + `planning.types.ts`
- [x] Utilitaires `timeUtils.ts` — `timeToMinutes` / `minutesToTime` (conversion heure ↔ minutes)
- [x] Gestion d'erreur frontend : affichage du message 409 ConflictException dans le formulaire

**HOM-285 — Définir les créneaux disponibles (✅ Terminé)**
- [x] Use cases `GenerateCreneaux` + `GenerateAllCreneaux` — algorithme 3 couches (modèle - pauses - indisponibilités)
- [x] Use cases `GetCreneaux`, `DeleteCreneau`, `DeleteCreneauxDisponibles`
- [x] Idempotence : skip si créneau déjà existant ou is_disponible = false
- [x] Rapport de génération : `{ created, skipped, conflicts }`
- [x] Endpoints `POST /admin/planning/creneaux/generate` + `POST /admin/planning/creneaux/generate-all`
- [x] Endpoints `GET /admin/planning/creneaux` + `DELETE /admin/planning/creneaux/:id` + `DELETE /admin/planning/creneaux/disponibles`
- [x] Onglet "Créneaux" dans `AdminPlanningSection` — `CreneauxTab`, `CreneauGenerationForm`, `GenerationRapportDialog`

---

### Jalon associé

**J4** — fin mai : Forfaits, zones et planification configurables par l'admin.

---

## Sprint 3 — Parcours client de réservation (Juin)

**Objectif :** Permettre à un client (connecté ou non) de créer une intervention
via le tunnel de réservation complet.

**Statut :** ✅ Terminé

---

### User stories

| Ticket  | Story                                              | Statut        |
| ------- | -------------------------------------------------- | ------------- |
| HOM-290 | Valider une adresse via Google Maps                | ✅ Terminé    |
| HOM-295 | Vérifier la couverture de zone                     | ✅ Terminé    |
| HOM-300 | Gérer ses adresses enregistrées (profil client)    | ✅ Terminé    |
| HOM-305 | Sélectionner son cycle dans le tunnel              | ✅ Terminé    |
| HOM-310 | Sélectionner un forfait, un créneau et saisir commentaire/photos | ✅ Terminé    |
| HOM-315 | Créer une intervention (confirmation + transaction)| ✅ Terminé    |

---

### Tunnel de réservation — ordre validé

1. Saisie adresse → validation Google Maps (geocoding)
2. Vérification zone couverte (point-in-polygon **backend**)
3. Saisie informations cycle (dropdown si connecté / saisie libre si non connecté)
4. Sélection forfait
5. Sélection créneau (filtrés par `zone_id` + `forfait_id`)
6. Vérification auth → création de compte inline si non connecté
7. Confirmation → `INSERT intervention` + `UPDATE créneau` (transaction atomique)

---

### Objectifs techniques

**HOM-290 + HOM-295 — Adresses & vérification de zone (✅ Terminé)**
- [x] Schéma Prisma — modèles `Adresse` + `PeutSeSituer` + migration (✅ fait dans HOM-300)
- [x] Module `features/adresses/` — Clean Architecture, TDD (✅ fait dans HOM-300)
- [x] Endpoint `POST /zones/check` → point-in-polygon (lat/lng → `{ zoneId, nomZone }` ou 404) — accessible sans auth
- [x] `ReservationContext` — contexte global portant l'état du tunnel complet (4 fichiers : types, context, provider, hook)
- [x] Composant `AdresseSelector` — logique duale :
  - Non connecté : `useAddressAutocomplete` (Google Places) → saisie libre
  - Connecté : dropdown adresses enregistrées (présélection adresse principale) + lien "Saisir une nouvelle adresse"
- [x] Intégration dans `HomePage` — bloc adresse de la page d'accueil
- [x] `reservationService.checkZone()` — appel `POST /zones/check`, erreur 404 = message inline

**HOM-300 — Gestion des adresses dans le profil (✅ Terminé)**
- [x] Schéma Prisma — modèles `Adresse` + `PeutSeSituer` + migration `add_adresses`
- [x] TDD — 4 use cases (10 tests verts) : get, create, update, delete
- [x] Repository interface + implémentation Prisma avec `$transaction()` (setPrincipal atomique) et `upsert` (déduplication Adresse)
- [x] Controller `/adresses` (JwtAuthGuard, ownership vérifié via `utilisateur_id`)
- [x] Règle : première adresse créée → `adressePrincipal: true` automatiquement
- [x] Règle : un client doit conserver au moins une adresse — soft-delete de la dernière bloqué (400)
- [x] Hook `useAddressAutocomplete` — callback ref pattern + `@googlemaps/js-api-loader`
- [x] Composant `MesAdresses` intégré dans `ProfilPage` (chips + formulaire inline, toggle principal, bouton Désactiver)

**HOM-305 — Cycle dans le tunnel (✅ Terminé)**
- [x] Endpoints `GET /referentiel/marques` + `GET /referentiel/type-cycles` — JwtAuthGuard retiré, accessibles sans auth
- [x] `CycleBooking` ajouté au `ReservationContext` (types + actions `setCycle`)
- [x] Composant `CycleSelector` — logique duale :
  - Non connecté : selects type + marque (données référentiel)
  - Connecté : combobox cycles existants (pré-sélection du premier) + option "+ Nouveau vélo" en fin de liste → révèle selects type + marque
- [x] Hooks `useReferentiel` (réutilisé), `useUserCyclesForReservation` (lecture seule, paramètre `enabled`)

**HOM-310 — Forfait + Créneaux + Commentaire (✅ Terminé)**
- [x] Endpoint `GET /forfaits` — use case `GetForfaitsActifsUseCase` (TDD, 2 tests), `ClientForfaitsController`, filtre `is_actif: true`, sans auth
- [x] `ForfaitInfo` ajouté au `ReservationContext` (types + action `setForfait`)
- [x] Composant `ForfaitSelector` — cards radio mobile-first (nom + description + durée + prix), indicateur visuel orange
- [x] `CycleEtForfaitForm` — orchestrateur composite (cycle + forfait sur même formulaire), CTA actif quand les deux sont sélectionnés
- [x] Intégration `Home.tsx` — rendu conditionnel sur `currentStep`
- [x] `reservationService.getForfaits()` + hook `useForfaits`
- [x] Endpoint `GET /creneaux?zone_id=&duree_minutes=&date_debut=&date_fin=` — `GetCreneauxDisponiblesUseCase` (TDD, 8 tests), algorithme buffer, `ClientCreneauxController` sans auth
- [x] Composant `CreneauSelector` avec FullCalendar (`timeGridDay`, vue jour mobile-first)
- [x] Mise à jour `ReservationContext` — type `CreneauInfo` + action `setCreneau`
- [x] Intégration `Home.tsx` — rendu conditionnel `currentStep === 'creneau'`
- [x] Filtre frontend `creneauxValides` — exclut les créneaux dont `date_fin` déborde dans un gap (pause déjeuner, etc.)
- [x] Type `CommentaireInfo` + action `setCommentaire` ajoutés au `ReservationContext`
- [x] Step `'commentaire'` ajouté à l'union `ReservationStep`
- [x] Composant `CommentaireEtPhotosForm` — textarea optionnel + upload photos (max 5) avec prévisualisation, bouton caméra (`capture="environment"`) masqué sur desktop
- [x] Photos stockées en `File[]` en mémoire — uploadées lors du `POST /interventions` (HOM-315)
- [x] Navigation : `CreneauSelector` → `'commentaire'` → `'auth'`/`'confirmation'` (selon auth)

**HOM-315 — Création d'intervention (✅ Terminé)**
- [x] Enum Prisma `StatutIntervention` (`Planifiee` | `Terminee` | `Annulee`) + modèle `Intervention` + migration `20260609194100_add_interventions`
- [x] Module `features/intervention/` — Clean Architecture, TDD (10 tests verts)
- [x] Use case `CreateInterventionUseCase` — transaction atomique : INSERT Intervention + UPDATE Creneau `is_disponible = false`
- [x] Email de confirmation post-transaction — `sendInterventionConfirmationEmail` dans `EmailService` (best-effort, SMTP failure non bloquant)
- [x] `findClientById` ajouté à `IInterventionsRepository` + `InterventionsPrismaRepository` — module autonome, aucun couplage inter-modules
- [x] Endpoint `POST /interventions` protégé `JwtAuthGuard`
- [x] `PENDING_RESERVATION_KEY` + `PendingReservationStorage` dans `reservation.types.ts`
- [x] `savePendingToStorage` + `restoreFromStorage` dans `ReservationContext`
- [x] `CreneauSelector` — branchement auth : `goToStep(isAuthenticated ? 'confirmation' : 'auth')`
- [x] Composant `AuthStep` — sauvegarde localStorage au montage, propose connexion / inscription
- [x] `interventionService` (mapping types frontend → DTO backend) + `useCreateIntervention`
- [x] `CommentaireEtPhotosForm` — prop `embedded` pour mode sous-composant (auto-save context, masque navigation)
- [x] `RecapitulatifStep` — récap adresse/vélo/forfait/créneau + section commentaire/photos dépliable + soumission + écran de succès enrichi (date, horaire, forfait, adresse + CTA "Retour à l'accueil")
- [x] `RestoreBanner` dans `Home.tsx` — détection localStorage au retour post-auth, confirmation avant restauration

---

### Architecture du tunnel — décisions du 2026-06-06

**`ReservationContext` — structure validée**

```typescript
type ReservationState = {
  // Étape 1 — Adresse & Zone
  adresse: AdresseBooking | null;  // { label, latitude, longitude, ... }
  zone: ZoneInfo | null;           // { zoneId, nomZone }

  // Étape 2 — Cycle
  cycle: CycleBooking | null;      // existant (id) ou nouveau (marque, type, libelle)

  // Étape 3 — Forfait
  forfait: ForfaitInfo | null;     // { id, nom, dureeMinutes, prix }

  // Étape 4 — Créneau
  creneau: CreneauInfo | null;     // { id, dateDebut, dateFin }

  // Étape 5 — Commentaire & Photos (optionnel)
  commentaire: CommentaireInfo | null;  // { commentaire: string, photos: File[] }

  // Étape 6 — Auth (si non connecté)
  nouveauUtilisateur: NouvelUtilisateur | null;  // prénom, nom, email, tel, password

  // Navigation
  currentStep: ReservationStep;
}

type ReservationStep =
  | 'adresse'
  | 'cycle'
  | 'forfait'
  | 'creneau'
  | 'commentaire'  // optionnel — toujours traversé, données peuvent être vides
  | 'auth'         // ignorée si déjà connecté
  | 'confirmation';
```

**Ordre du tunnel validé :** Adresse → Cycle → Forfait → Créneau → Commentaire & Photos → Auth (si besoin) → Confirmation

**Navigation — Option A retenue : mono-page avec steps**
Toutes les étapes sur une seule page (ou modal/drawer), pas de routes séparées. Le `ReservationContext` gère la step courante. Raison : données transitoires et volumineuses, pas adaptées à l'URL. Réinitialisation du context après confirmation.

**Vérification de zone — endpoint `POST /zones/check`**
- Accessible sans authentification (pas de `JwtAuthGuard`)
- Input : `{ latitude: number, longitude: number }`
- Algorithme : point-in-polygon sur les `ZonePoint` de chaque zone active
- Output si trouvé : `{ zoneId: string, nomZone: string }`
- Output si non trouvé : `404 NotFoundException`

**Composant `AdresseSelector` (page d'accueil)**
- Non connecté : champ texte + autocomplete Google Places (`useAddressAutocomplete`)
- Connecté : `<select>` des adresses actives du client + lien "Saisir une nouvelle adresse"
- Au clic "Prendre Rendez-vous" : appel `POST /zones/check` → si 404 → message d'erreur inline ; si ok → stockage dans `ReservationContext` + affichage étape suivante

---

**Mes interventions — consultation et annulation (✅ Terminé — 2026-06-14)**
- [x] `GetClientInterventionsUseCase` (TDD) — liste interventions par client, ordonnée par date création desc
- [x] `CancelInterventionUseCase` (TDD) — NotFoundException / ForbiddenException / ConflictException si statut ≠ Planifiee
- [x] `cancelInterventionTransaction` — libère tous les créneaux du bloc (`updateMany` sur plage de dates)
- [x] `createInterventionTransaction` — verrouille tous les créneaux du bloc (idem)
- [x] Retrait `@unique` sur `creneau_id` + relation `Creneau.interventions Intervention[]` + migration
- [x] Endpoints `GET /interventions` + `PATCH /interventions/:id/annuler` (JwtAuthGuard)
- [x] `useInterventions` — 3 groupes : précédentes / aujourd'hui / planifiées
- [x] `InterventionCard` — badge dynamique avec "Passée" pour les Planifiees en date passée
- [x] `CancelInterventionDialog` — SCSS pur (pas de shadcn/Tailwind, z-index: 150/200)
- [x] `MesInterventions` + `InterventionsPage` + route `/interventions` protégée
- [x] `PageLayout` — `HeroBrand` toujours visible en desktop (toutes les pages)

---

**Visualisation admin des interventions (✅ Terminé — 2026-06-14)**
- [x] `GetAdminInterventionsUseCase` (TDD) — liste filtrée par statut / zone / technicien
- [x] `GetAdminInterventionDetailUseCase` (TDD) — détail complet + `NotFoundException` si absent
- [x] `findAllInterventions` + `findInterventionDetailById` dans `IInterventionsRepository` + `InterventionsPrismaRepository`
- [x] Pattern snapshot : `technicien_id` sans `@relation` → requête secondaire `utilisateur.findMany` + Map de résolution
- [x] `AdminInterventionsController` : `GET /admin/interventions` + `GET /admin/interventions/:id` (guards admin)
- [x] `adminIntervention.types.ts`, `adminInterventionsService`, `useAdminInterventions`
- [x] `AdminInterventionsList` — table filtrable (zone + technicien), badges statut
- [x] `AdminInterventionDetailDialog` — Dialog shadcn, fond blanc forcé en SCSS (variable `--background` absente), grille 2 colonnes aérée
- [x] `AdminInterventionsSection` — Tabs shadcn Planifiées / Archivées, design identique à la section Cycles
- [x] Suppression entrée "Créneaux" du sidebar admin (redondante avec "Planning")

---

**Upload et affichage des photos d'intervention (✅ Terminé — 2026-06-17)**
- [x] Enum Prisma `ContextePhoto` (`client` | `technicien`) + modèle `Photo` avec `onDelete: Cascade` + migration `20260617182135_add_photos`
- [x] `StorageModule` + `StorageService` dans `shared/storage/` — upload vers S3 via `@aws-sdk/client-s3`, retourne `{ url, cle }` (TDD, 2 tests verts)
- [x] 3 nouvelles méthodes dans `IInterventionsRepository` : `isInterventionOwnedByClient`, `getPhotosCount`, `createPhotos`
- [x] `UploadInterventionPhotosUseCase` (TDD, 3 tests) — vérif ownership (`ForbiddenException`), limite 5 photos (`BadRequestException`), upload S3 + `createMany` Prisma
- [x] Endpoint `POST /interventions/:id/photos` — `FilesInterceptor`, max 5 fichiers, 30 Mo, MIME filter (JPEG / PNG / WebP)
- [x] `PhotosUploadedDto` — `{ count: number; urls: string[] }`
- [x] `findInterventionDetailById` enrichi : photos filtrées par contexte → `photosClient` / `photosTechnicien` dans `AdminInterventionDetailDto`
- [x] `StorageModule` importé dans `InterventionModule`, use case câblé via `useFactory`
- [x] Frontend : `uploadPhotos(interventionId, photos)` dans `interventionService` (FormData)
- [x] Frontend : `useCreateIntervention` — upload best-effort post-création (try/catch silencieux)
- [x] Frontend : `RecapitulatifStep` passe `commentaire?.photos` au hook
- [x] Frontend : `AdminInterventionDetailDialog` — grille photos cliquables séparées par contexte (client / technicien)
- [x] Frontend : `AdminInterventionDetail` types enrichis avec `photosClient` + `photosTechnicien`

---

**Tableau de bord admin — indicateurs KPI (✅ Terminé — 2026-06-16)**
- [x] `AdminStatsDto` — DTO de sortie (`interventionsPlanifiees`, `zonesCouvertes`, `nombreTechniciens`)
- [x] `IAdminStatsRepository` — interface découplée (contrat unique `getStats()`)
- [x] `AdminStatsPrismaRepository` — 3 `count()` Prisma en `Promise.all` parallèle
- [x] `GetAdminStatsUseCase` (TDD, 2 tests verts) — délègue au repo sans logique supplémentaire
- [x] `AdminStatsController` — `GET /admin/stats` protégé `JwtAuthGuard` + `RolesGuard` + `@Roles('admin')`
- [x] `admin.module.ts` mis à jour — token `ADMIN_STATS_REPO`, use case et controller enregistrés
- [x] `dashboard.types.ts` — type `AdminStats` (miroir du DTO backend)
- [x] `adminDashboardService` — `GET /admin/stats` via `apiClient`
- [x] `useAdminDashboard` — hook avec états `stats / isLoading / error`
- [x] `AdminDashboardSection` — grille 3 cartes KPI responsive (1 col mobile → 3 col desktop), icônes Lucide monochromes, couleurs du design system (`$color-myBrown`, `$color-myViolet`, `$color-myYellow`)
- [x] `AdminLayout` mis à jour — branchement `dashboard` + section par défaut

---

### Jalon associé

**J5** — fin juin : Parcours client de réservation fonctionnel de bout en bout.

---

### Bugs connus — à corriger lors de la phase de test

| # | Composant | Description | Priorité | Statut |
|---|-----------|-------------|----------|--------|
| BUG-01 | `CreneauSelector` | `slotDurationMs` calculé uniquement sur les 2 premiers créneaux → chevauchements visuels si trous dans la liste | Haute | ✅ Corrigé (2026-06-14) |
| BUG-02 | `GetCreneauxDisponiblesUseCase` | Buffer avant ignorait les trous de pause (contiguïté non vérifiée) → créneau 14h00 proposé malgré pause 12h-14h | Haute | ✅ Corrigé (2026-06-14) |

---

### Phase de test du tunnel de réservation (✅ Réalisée en juillet)

La session de test prévue sur le tunnel de réservation complet (HOM-290 → HOM-315) a eu lieu et a donné lieu aux travaux de stabilisation ci-dessous — les deux bugs connus (voir tableau ci-dessus) ont été corrigés dès le 2026-06-14, avant même la fin du sprint.

---

## Sprint 4 — Stabilisation, sécurité, suivi & paiement (Juillet)

**Objectif initial :** Suivi, paiement, clôture technicien.

**Statut :** 🔄 En cours — la stabilisation technique et la sécurité ont été livrées en avance ; paiement et clôture technicien restent à faire.

---

### Réalisé (stabilisation technique, hors périmètre initial du sprint)

D'après [[log.md]] :

- [x] **2026-06-29** — Normalisation camelCase des DTOs backend et des types frontend correspondants (admin, auth, forfaits, planning, zones, affectations, intervention)
- [x] **2026-06-29** — Variables AWS S3 ajoutées aux docker-compose staging/prod + ajustement JWT strategy
- [x] **2026-06-29** — Augmentation de `client_max_body_size` Nginx (staging + prod) pour l'upload photos
- [x] **2026-07-01** — Intégration Swagger (`@nestjs/swagger`, `/api-docs`) + harmonisation des codes HTTP sur tous les contrôleurs
- [x] **2026-07-01** — Mise à jour des specs Jest suite à l'harmonisation HTTP/Swagger
- [x] **2026-07-01** — Résolution de dette technique silencieuse (code mort `app.controller`/`app.service`, dépendances vulnérables, corrections UI admin)
- [x] **2026-07-01** — Harmonisation async/await et du pattern Composant → Hook → Service sur l'ensemble frontend + `users.controller.ts` backend
- [x] **2026-07-02** — Statut "En retard" sur les interventions + pagination admin homogène (composant `Pagination` partagé)
- [x] **2026-07-02** — Affichage du commentaire et des photos dans le récapitulatif de réservation (validation visuelle de la persistance S3)
- [x] **2026-07-02** — Menu admin restreint à "Administration" + redirection post-connexion vers `/admin`
- [x] **2026-07-02** — Uniformisation des CTA et formulaires côté client (composant `Form` partagé sur 8 formulaires)
- [x] **2026-07-03** — Correction des erreurs de configuration `tsconfig` (backend, frontend, CI)
- [x] **2026-07-12** — Ajout des headers de sécurité Helmet + rate limiting (`@nestjs/throttler`, 100 req/min global, 5 req/min sur les routes `auth`)
- [x] **2026-08-02** — `trust proxy` configuré sur l'instance Express (2 reverse proxies : Nginx hôte + Nginx interne Docker) — fiabilise le comptage par IP réelle du rate limiting en production
- [x] **2026-08-02** — Réalignement complet des `CLAUDE.md` (racine, Frontend, Backend) et du wiki + ajout du skill `/fin-session`
- [x] **2026-08-15** — Suppression des décorateurs `@Inject()`/`@Injectable()` vestigiaux sur 24 use cases (`affectations`, `forfaits`, `intervention`, `planning`, `users`) — la résolution DI se fait partout via `useFactory` dans les modules, ces décorateurs n'étaient jamais lus par Nest ; alignement sur le pattern déjà propre de `admin`/`cycle`
- [x] **2026-08-15** — Assertions de définition (`!`) sur les 41 DTOs concernés (entrée + sortie)
- [x] **2026-08-16** — **Fiabilisation de la règle de réservabilité des créneaux** — quatre défauts corrigés : buffer retour sans contrôle de contiguïté, couverture du forfait jamais vérifiée, algorithme cassé sur une zone à plusieurs techniciens, et absence totale de validation à l'écriture (double réservation possible via un appel API direct). La règle est extraite dans une fonction pure `planning/domain/creneau-reservable.ts` — première matérialisation de la couche Domaine — appelée par `GetCreneauxDisponibles` **et** `CreateIntervention`. Ajout du prénom du technicien dans la réponse et son affichage dans le calendrier. Suppression du filtre métier `creneauxValides` côté React. 18 nouveaux tests (245 au total). Documentation : [[Règle de réservabilité des créneaux]]

### Reste à faire pour le MVP

- [ ] Paiement — déclaration de paiement physique (`Paiement`, `Mode_Paiement`, `Statut_Paiement`), non implémenté (voir [[metier.md]]) — aucun module `features/paiement` créé, confirmé au 2026-08-02
- [ ] Clôture technicien — passage du statut `Intervention` à `Terminee`, commentaire technicien, `date_cloture`, non implémenté — aucun use case de clôture dans `features/intervention`, confirmé au 2026-08-02

### Reporté au prochain sprint

- [ ] **Nettoyage des créneaux** — conçu le 2026-08-16, non implémenté. Empêcher la création de créneaux orphelins (suppression des créneaux libres dans la transaction de suppression d'un modèle) + deux outils admin : suppression des créneaux non réservés à venir par technicien, et reset général atteignant les orphelins. Plan complet et prêt à reprendre : [[Nettoyage des créneaux — chantier à venir]]
- [ ] **Cron de purge des créneaux passés** — feature distincte : suppression automatique des créneaux libres antérieurs à la date du jour, pour éviter l'accumulation en base. Identifié le 2026-08-16, non planifié

---

## Prochains sprints

| Sprint   | Période | Objectif principal      |
| -------- | ------- | ----------------------- |
| Livraison | Août   | Tests globaux, documentation, soutenance |

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
