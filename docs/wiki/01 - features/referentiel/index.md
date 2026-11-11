---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Référentiel (Marques + Types de cycles)

**Statut** : ✅ Complet

## Description

Deux sous-référentiels de structure quasi identique : gestion des marques de vélos et des
types de cycles (catégories). CRUD admin + lecture publique (sans authentification) pour
alimenter les formulaires de création de cycle côté client et le tunnel de réservation.
Feature technique/réduite — pas de règles métier propres (voir [[../../architecture.md]],
section "Convention : feature vs référentiel").

## Fichiers Backend

### `referentiel/marques`
- Module : `Backend/src/features/referentiel/marques/admin-marques.module.ts`
- Controllers : `controllers/{admin-marques.controller.ts, referentiel-marques.controller.ts}`
- DTOs : `dto/{create-marque.dto.ts, update-marque.dto.ts, marque.dto.ts}`
- Repository : `repositories/{marques.repository.interface.ts, marques.prisma.repository.ts}`
- Use cases : `use-cases/{get-marques, create-marque, update-marque, delete-marque}.use-case.ts`
- Tests : 4 specs

### `referentiel/type-cycles`
- Module : `Backend/src/features/referentiel/type-cycles/admin-type-cycles.module.ts`
- Controllers : `controllers/{admin-type-cycles.controller.ts, referentiel-type-cycles.controller.ts}`
- DTOs : `dto/{create-type-cycle.dto.ts, update-type-cycle.dto.ts, type-cycle.dto.ts}`
- Repository : `repositories/{type-cycles.repository.interface.ts, type-cycles.prisma.repository.ts}`
- Use cases : `use-cases/{get-type-cycles, create-type-cycle, update-type-cycle, delete-type-cycle}.use-case.ts`
- Tests : 4 specs

## Fichiers Frontend

- Pas de feature frontend dédiée — consommé via `features/cycle/services/referentielService.ts` et `features/cycle/hooks/useReferentiel.ts`
- Côté admin : `features/admin/components/cycles/{MarquesTab, TypesCyclesTab}/`, hooks `useAdminMarques`/`useAdminTypeCycles`, services `adminMarquesService`/`adminTypeCyclesService`

## Endpoints API

| Méthode | Route | Accès |
|---|---|---|
| GET/POST/PATCH/DELETE | `/api/admin/marques[/:id]` | `@Roles('admin')` |
| GET | `/api/referentiel/marques` | Public (JwtAuthGuard retiré depuis le 2026-06-07) |
| GET/POST/PATCH/DELETE | `/api/admin/type-cycles[/:id]` | `@Roles('admin')` |
| GET | `/api/referentiel/type-cycles` | Public |

## Entités Prisma liées

- `Marque` (`libelle` unique)
- `TypeCycle` (`libelle` unique)

## Dépendances avec d'autres features

- Aucune vers d'autres modules. Consommé fonctionnellement par `cycle` (référence par id, pas d'import de code)

## Diagrammes

_À compléter — session dédiée avec Yannick._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
