---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Cycle

**Statut** : ✅ Complet

## Description

Gestion des vélos ("cycles") appartenant à un client : CRUD scopé par utilisateur, avec
relations vers `Marque` et `TypeCycle` (référentiels). Côté frontend, expose aussi un
sélecteur de cycle réutilisé dans le tunnel de réservation.

## Fichiers Backend

- Module : `Backend/src/features/cycle/cycle.module.ts`
- Controller : `controllers/cycles.controller.ts`
- DTOs : `dto/input/cycle-input.dto.ts`, `dto/output/cycle.dto.ts`
- Repository : `repositories/{cycles.repository.interface.ts, cycles.prisma.repository.ts}`
- Use cases : `use-cases/{get-cycles, create-cycle, update-cycle, delete-cycle}.use-case.ts`
- Tests : 4 specs

## Fichiers Frontend

- Composants : `features/cycle/components/{MesCycles, CycleSelector}/`
- Hooks : `hooks/{useCycles, useReferentiel}.ts`
- Services : `services/{cycleService, referentielService}.ts`
- Types : `types/cycle.types.ts`
- Page : `pages/ProfilPage.tsx` (`MesCycles`) ; `CycleSelector` est consommé par `features/reservation/components/CycleEtForfaitForm/`

## Endpoints API

| Méthode | Route | Accès |
|---|---|---|
| GET | `/api/cycles` | `JwtAuthGuard` — scoping par `userId` |
| POST | `/api/cycles` | `JwtAuthGuard` |
| PATCH | `/api/cycles/:id` | `JwtAuthGuard` |
| DELETE | `/api/cycles/:id` | `JwtAuthGuard` (204) |

## Entités Prisma liées

- `Cycle` (relations `marque`, `type_cycle`, `utilisateur`)

## Dépendances avec d'autres features

- Aucune dépendance de code vers `referentiel` — couplage uniquement via identifiants `marqueId`/`typeCycleId`
- Frontend : consommé par `reservation` (`CycleSelector`, `useReferentiel`, `cycleService` via `useUserCyclesForReservation`)

## Diagrammes

_À compléter — session dédiée avec Yannick._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
