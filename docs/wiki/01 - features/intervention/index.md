---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Intervention

**Statut** : ✅ Complet

## Description

Cœur métier de l'application : réservation d'interventions (transaction atomique création
+ blocage du créneau), consultation et annulation côté client, upload de photos (S3),
et supervision admin (liste paginée + détail). Voir [[../../log.md]] pour l'historique
détaillé des décisions (transaction atomique, snapshot technicien, upload S3).

## Fichiers Backend

- Module : `Backend/src/features/intervention/intervention.module.ts`
- Controllers : `controllers/{interventions.controller.ts (client), admin-interventions.controller.ts}`
- DTOs : `dto/input/{create-intervention.dto.ts, get-admin-interventions-query.dto.ts}`, `dto/output/{intervention-created.dto.ts, intervention-list-item.dto.ts, admin-intervention-list-item.dto.ts, admin-intervention-detail.dto.ts, paginated-admin-interventions.dto.ts, photos-uploaded.dto.ts}`
- Repository : `repositories/{interventions.repository.interface.ts, interventions.prisma.repository.ts}`
- Use cases : `use-cases/{create-intervention, get-client-interventions, cancel-intervention, upload-intervention-photos, get-admin-interventions, get-admin-intervention-detail}.use-case.ts`
- Tests : 6 specs

## Fichiers Frontend

- Client : `features/intervention/components/{MesInterventions, InterventionCard, CancelInterventionDialog}/`, hook `hooks/useInterventions.ts`, service `services/clientInterventionService.ts`, types `types/clientIntervention.types.ts`, page `pages/InterventionsPage.tsx`
- Admin : `features/admin/components/interventions/{AdminInterventionsSection, AdminInterventionsFilterBar, AdminInterventionsList, AdminInterventionDetailDialog}/`, hooks `useAdminInterventions`/`useAdminInterventionDetail`/`useAdminInterventionFilters`, service `adminInterventionsService`
- Création : orchestrée par `features/reservation/` (`interventionService.ts`, `useCreateIntervention.ts`) — voir [[01 - features/reservation/index]]

## Endpoints API

| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/interventions` | `JwtAuthGuard` — création transactionnelle (dispo créneau, snapshot prix/durée/technicien, blocage créneau) |
| GET | `/api/interventions` | `JwtAuthGuard` — liste du client connecté |
| PATCH | `/api/interventions/:id/annuler` | `JwtAuthGuard` (204) |
| POST | `/api/interventions/:id/photos` | `JwtAuthGuard` — multipart, max 5 fichiers JPEG/PNG/WebP, 30 Mo/fichier, contexte `client` |
| GET | `/api/admin/interventions` | `@Roles('admin')` — filtres statut/zoneId/technicienId, pagination |
| GET | `/api/admin/interventions/:id` | `@Roles('admin')` |

## Entités Prisma liées

- `Intervention` (`StatutIntervention`), `Creneau`, `Cycle`, `Adresse`, `Forfait`, `HistoriquePrixForfait`, `Utilisateur`, `Photo` (`ContextePhoto`)

## Dépendances avec d'autres features

- `email` (`EmailService.sendInterventionConfirmationEmail`, best-effort non bloquant)
- `shared/storage` (`StorageService`, upload S3)
- La résolution cycle/adresse (création à la volée `createCycle`/`upsertAdresse`) est implémentée directement dans le repository Prisma de la feature — pas d'import des modules `cycle`/`adresses`

## Diagrammes

_À compléter (séquence création + transaction atomique) — session dédiée avec Yannick._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
