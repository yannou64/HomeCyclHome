---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Affectations

**Statut** : ✅ Complet

## Description

Affectation des techniciens aux zones géographiques (table pivot `TechnicienZone`) —
gestion admin uniquement. Un `PUT` remplace intégralement les zones affectées à un
technicien (idempotent, transaction `deleteMany` + `createMany`).

## Fichiers Backend

- Module : `Backend/src/features/affectations/affectations.module.ts`
- Controller : `controllers/admin-affectations.controller.ts`
- DTOs : `dto/{affectation.dto.ts, set-technicien-zones.dto.ts}`
- Repository : `repositories/{affectations.repository.interface.ts, affectations.prisma.repository.ts}`
- Use cases : `use-cases/{get-affectations, get-affectation-by-technicien, set-technicien-zones, delete-technicien-affectations}.use-case.ts`
- Tests : 4 specs

## Fichiers Frontend

- Composants : `features/admin/components/affectations/{AdminAffectationsSection, AffectationFormDialog, AffectationDeleteDialog}/`
- Hooks : `features/admin/hooks/{useAdminAffectations, useAffectationFormData, useZonesForTechnicien}.ts`
- Service : `features/admin/services/adminAffectationsService.ts`
- Types : `features/admin/types/affectations.types.ts`

## Endpoints API

| Méthode | Route | Accès |
|---|---|---|
| GET | `/api/admin/affectations` | `@Roles('admin')` |
| GET | `/api/admin/affectations/:technicienId` | `@Roles('admin')` |
| PUT | `/api/admin/affectations/:technicienId` | `@Roles('admin')` — remplace intégralement les zones |
| DELETE | `/api/admin/affectations/:technicienId` | `@Roles('admin')` (204) |

## Entités Prisma liées

- `Utilisateur` (filtré `role: technicien`), `Zone`, `TechnicienZone`

## Dépendances avec d'autres features

- Aucune : le repository interroge directement `Utilisateur`/`Zone`/`TechnicienZone` sans passer par les modules `users`/`zones`

## Diagrammes

_À compléter — session dédiée avec Yannick._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
