---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Adresses

**Statut** : ✅ Complet (HOM-300)

## Description

Carnet d'adresses du client : liaison n-n Utilisateur ↔ Adresse via `PeutSeSituer`, avec
gestion d'une adresse principale unique et soft-delete. L'adresse géocodée elle-même est
immuable après création (issue de Google Maps) — seuls `titre_description` et
`adresse_principal` sont éditables. Voir [[../../metier.md]] pour le détail des règles.

## Fichiers Backend

- Module : `Backend/src/features/adresses/adresses.module.ts`
- Controller : `controllers/adresses.controller.ts`
- DTOs : `dto/input/adresse-input.dto.ts`, `dto/output/adresse.dto.ts`
- Repository : `repositories/{adresses.repository.interface.ts, adresses.prisma.repository.ts}`
- Use cases : `use-cases/{get-adresses, create-adresse, update-adresse, delete-adresse}.use-case.ts`
- Tests : 4 specs

## Fichiers Frontend (`features/adresse/`)

- Composants : `components/{AdresseSelector, MesAdresses}/`
- Hooks : `hooks/{useAdresses, useAddressAutocomplete}.ts` (wrapper `@googlemaps/js-api-loader`)
- Service : `services/adresseService.ts`
- Types : `types/adresse.types.ts`
- Pages : `pages/Home.tsx` (`AdresseSelector`, étape `adresse` du tunnel), `pages/ProfilPage.tsx` (`MesAdresses`)

## Endpoints API

| Méthode | Route | Accès |
|---|---|---|
| GET | `/api/adresses` | `JwtAuthGuard` — scoping par `userId` |
| POST | `/api/adresses` | `JwtAuthGuard` |
| PATCH | `/api/adresses/:id` | `JwtAuthGuard` |
| DELETE | `/api/adresses/:id` | `JwtAuthGuard` (204) — soft-delete, bloqué si dernière adresse active |

## Entités Prisma liées

- `Adresse` (champs plats geocodés)
- `PeutSeSituer` (table de jointure : `titre_description`, `adresse_principal`, `is_valide`, `date_invalidite`)

## Dépendances avec d'autres features

- Aucune côté backend. Consommée en retour par `intervention` (résolution/création d'adresse via son propre repository, pas d'import du module `adresses`)
- Frontend : `AdresseSelector` dépend de `reservation` (`useZoneCheck`) et des contexts globaux `authContext`/`reservationContext`

## Diagrammes

_À compléter — session dédiée avec Yannick._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
