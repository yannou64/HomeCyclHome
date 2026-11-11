---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Zones

**Statut** : ✅ Complet

## Description

Gestion des zones géographiques de couverture (polygones de points GPS) : CRUD admin,
et vérification publique qu'un point GPS est couvert par une zone active, via
l'algorithme Ray Casting (théorème de Jordan), utilisée avant toute réservation.
Voir [[../../log.md]] (entrée 2026-06-06) pour la conception de l'algorithme.

## Fichiers Backend

- Module : `Backend/src/features/zones/zones.module.ts`
- Controllers : `controllers/{admin-zones.controller.ts, zones.controller.ts}`
- DTOs : `dto/{create-zone.dto.ts, update-zone.dto.ts, check-zone.dto.ts, zone.dto.ts}`
- Repository : `repositories/{zones.repository.interface.ts, zones.prisma.repository.ts}`
- Use cases : `use-cases/{get-zones, get-zone-by-id, create-zone, update-zone, delete-zone, check-zone}.use-case.ts`
- Tests : 6 specs

## Fichiers Frontend

- Composants (admin) : `features/admin/components/zones/{AdminZonesSection, ZoneForm, ZoneDeleteDialog, ZoneMapDrawer, ZonesList}/`
- Hook : `features/admin/hooks/useAdminZones.ts`
- Service : `features/admin/services/adminZonesService.ts`
- Types : `features/admin/types/zones.types.ts`
- Consommé côté client via `features/reservation/hooks/useZoneCheck.ts` (pas de composant dédié zones côté client)

## Endpoints API

| Méthode | Route | Accès |
|---|---|---|
| GET | `/api/admin/zones` | `@Roles('admin')` |
| GET | `/api/admin/zones/:id` | `@Roles('admin')` |
| POST | `/api/admin/zones` | `@Roles('admin')` |
| PATCH | `/api/admin/zones/:id` | `@Roles('admin')` |
| DELETE | `/api/admin/zones/:id` | `@Roles('admin')` (204) |
| POST | `/api/zones/check` | Public — `{latitude, longitude}` → zone couvrante ou 404 |

## Entités Prisma liées

- `Zone`, `ZonePoint` (points du polygone)

## Dépendances avec d'autres features

- Aucune. Consommée fonctionnellement par `planning` (créneaux liés à une zone) et par `intervention`/`reservation` (vérification de zone avant réservation), sans import de code

## Diagrammes

_À compléter — session dédiée avec Yannick._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
