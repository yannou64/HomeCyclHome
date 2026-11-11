---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Forfaits

**Statut** : ✅ Complet

## Description

Catalogue des prestations (forfaits) avec historisation des prix (`HistoriquePrixForfait`).
Gestion admin (CRUD + définition de prix) et exposition publique de la liste des forfaits
actifs pour le tunnel de réservation client.

## Fichiers Backend

- Module : `Backend/src/features/forfaits/forfaits.module.ts`
- Controllers : `controllers/{admin-forfaits.controller.ts, client-forfaits.controller.ts}`
- DTOs : `dto/{create-forfait.dto.ts, update-forfait.dto.ts, set-forfait-prix.dto.ts, forfait.dto.ts}`
- Repository : `repositories/{forfaits.repository.interface.ts, forfaits.prisma.repository.ts}`
- Use cases : `use-cases/{get-forfaits, get-forfaits-actifs, create-forfait, update-forfait, delete-forfait, set-forfait-prix}.use-case.ts`
- Tests : 6 specs

## Fichiers Frontend

- Composant : `features/forfait/components/ForfaitSelector/` (pas de hook/service propre à cette feature)
- Admin : `features/admin/components/forfaits/{AdminForfaitsSection, ForfaitFormDialog, ForfaitDeleteDialog, ForfaitPrixDialog}/`, hook `useAdminForfaits`, service `adminForfaitsService`
- Côté tunnel : `features/reservation/services/reservationService.ts` (`getForfaits()`) + `features/reservation/hooks/useForfaits.ts`

## Endpoints API

| Méthode | Route | Accès |
|---|---|---|
| GET | `/api/admin/forfaits` | `@Roles('admin')` |
| POST | `/api/admin/forfaits` | `@Roles('admin')` |
| PATCH | `/api/admin/forfaits/:id` | `@Roles('admin')` |
| DELETE | `/api/admin/forfaits/:id` | `@Roles('admin')` (204) |
| POST | `/api/admin/forfaits/:id/prix` | `@Roles('admin')` — nouvelle ligne d'historique de prix |
| GET | `/api/forfaits` | Public — forfaits actifs uniquement |

## Entités Prisma liées

- `Forfait`, `HistoriquePrixForfait`

## Dépendances avec d'autres features

- Aucune côté backend. Consommé par `intervention` (snapshot prix/durée à la réservation)
- Frontend : `ForfaitSelector` dépend fortement de `reservation` (types `ForfaitDto`, `ForfaitInfo`)

## Diagrammes

_À compléter — session dédiée avec Yannick._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
