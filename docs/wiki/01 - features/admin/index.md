---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Admin

**Statut** : ✅ Complet

## Description

Back-office admin : CRUD des utilisateurs (tous rôles) avec pagination/filtres, et
tableau de bord KPI (interventions planifiées, zones couvertes, nombre de techniciens).
C'est le module de référence de l'architecture Clean Architecture backend (voir [[../../architecture.md]]).
Le reste des sections admin (Cycles, Zones, Affectations, Forfaits, Planning, Interventions)
vit dans les composants `features/admin/components/*` côté frontend mais consomme les
endpoints des features backend correspondantes (`zones`, `forfaits`, `planning`…), pas un
module `admin` dédié à ces domaines.

## Fichiers Backend

- Module : `Backend/src/features/admin/admin.module.ts`
- Controllers : `controllers/{admin-users.controller.ts, admin-stats.controller.ts}`
- DTOs : `dto/{admin-stats.dto.ts, admin-user.dto.ts, create-admin-user.dto.ts, update-admin-user.dto.ts, pagination-query.dto.ts}`
- Repositories : `repositories/{admin-users.repository.interface.ts, admin-users.prisma.repository.ts, admin-stats.repository.interface.ts, admin-stats.prisma.repository.ts}`
- Use cases : `use-cases/{get-users, create-user, update-user, delete-user, get-admin-stats}.use-case.ts`
- Tests : 5 specs (un par use case)

## Fichiers Frontend

- Layout : `features/admin/components/layout/{AdminLayout, AdminSidebar, AdminMobileBlocker}/`
- Dashboard : `components/dashboard/AdminDashboardSection/`
- Utilisateurs : `components/users/{UsersTable, UserFormDialog, DeleteConfirmDialog}/`
- Hooks : `hooks/{useAdminUsers, useAdminDashboard}.ts`
- Services : `services/{adminUsersService, adminDashboardService}.ts`
- Types : `types/{admin.types.ts, dashboard.types.ts}`
- Page : `pages/AdminPage.tsx` (protégée `ProtectedRoute roles={['admin']}`)

> Les autres sections admin (Cycles, Zones, Affectations, Forfaits, Planning, Interventions)
> sont documentées dans les fiches de leur feature métier respective — voir [[01 - features/index]].

## Endpoints API

| Méthode | Route | Accès |
|---|---|---|
| GET | `/api/admin/users` | `@Roles('admin')` — paginé, filtres page/limit/search/role/isActif |
| POST | `/api/admin/users` | `@Roles('admin')` |
| PATCH | `/api/admin/users/:id` | `@Roles('admin')` |
| DELETE | `/api/admin/users/:id` | `@Roles('admin')` — auto-suppression gérée dans le use case |
| GET | `/api/admin/stats` | `@Roles('admin')` |

## Entités Prisma liées

- `Utilisateur` (CRUD complet)
- Agrégations sur `Intervention`, `Zone`, `TechnicienZone` pour les stats

## Dépendances avec d'autres features

- Dépend de `users` (DTO `UserRole`)
- Frontend : aucune dépendance vers les autres features métier (`cycle`, `forfait`…) — l'admin a ses propres types/services parallèles pour les mêmes entités plutôt que de réutiliser les features client

## Diagrammes

_À compléter — session dédiée avec Yannick._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
