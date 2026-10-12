---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Users

**Statut** : ✅ Complet

## Description

Gestion du profil personnel de l'utilisateur connecté (self-service, tous rôles confondus) :
lecture, mise à jour, suppression de compte. Distincte du module `admin` qui gère
l'ensemble des utilisateurs. Côté frontend, cette feature s'appelle `user`.

## Fichiers Backend

- Module : `Backend/src/features/users/users.module.ts`
- Controller : `controllers/users.controller.ts`
- DTOs : `dto/{update-user.dto.ts, user-profile.dto.ts}` — ce dernier définit `UserRole`, réutilisé par `shared/guards`, `shared/decorators` et les DTOs `admin`
- Repository : `repositories/{users.repository.interface.ts, users.prisma.repository.ts}`
- Use cases : `use-cases/{get-profile, update-profile, delete-account}.use-case.ts`
- Tests : 3 specs

## Fichiers Frontend (`features/user/`)

- Composants : `components/ProfileForm/`, `components/DeleteAccountSection/`
- Hooks : `hooks/{useProfile, useUpdateProfile, useDeleteAccount}.ts`
- Service : `services/userService.ts`
- Types : `types/user.types.ts` (importe `Role` depuis `app/providers/authContext/types/auth.types`)
- Page : `pages/ProfilPage.tsx`

## Endpoints API

| Méthode | Route | Accès |
|---|---|---|
| GET | `/api/users/me` | `JwtAuthGuard` |
| PATCH | `/api/users/me` | `JwtAuthGuard` |
| DELETE | `/api/users/me` | `JwtAuthGuard` (204) |

## Entités Prisma liées

- `Utilisateur`

## Dépendances avec d'autres features

- **Fournisseur** pour d'autres modules : `admin` (DTOs) et `shared/guards`/`shared/decorators` (type `UserRole`) importent depuis `users/dto/user-profile.dto.ts`. C'est la seule feature dont le code est importé par une brique `shared/`.
- Frontend : `useDeleteAccount`/`useUpdateProfile` utilisent `app/providers/authContext/useAuth`

## Diagrammes

_À compléter — session dédiée avec Yannick._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
