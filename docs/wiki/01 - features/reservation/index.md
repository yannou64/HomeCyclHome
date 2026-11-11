---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Reservation

**Statut** : ✅ Complet

## Description

Feature frontend uniquement, transverse : orchestre le tunnel de réservation complet en
étapes pilotées par `ReservationContext` (`adresse → cycle → creneau → auth →
confirmation`), affichées exclusivement sur `pages/Home.tsx`. C'est la feature la plus
intégratrice du frontend — elle assemble `adresse`, `cycle`, `forfait`, `planning`
(créneaux), `zones` (vérification) et `intervention` (création) en un seul parcours.
Voir [[../../log.md]] (entrées de juin) pour l'historique complet de conception du tunnel
et [[../../metier.md]] pour les étapes métier du parcours client.

## Fichiers Backend

N/A — pas de module backend dédié. Le tunnel consomme les endpoints de `zones`,
`forfaits`, `planning`/`creneaux` et `intervention`.

## Fichiers Frontend

- Composants : `features/reservation/components/{AuthStep, CycleEtForfaitForm, CreneauSelector, RecapitulatifStep, CommentaireEtPhotosForm, RestoreCard}/`
- Hooks : `hooks/{useCreneaux, useForfaits, useZoneCheck, useCreateIntervention, useUserCyclesForReservation}.ts`
- Services : `services/{reservationService.ts, interventionService.ts}` (aplatit les unions discriminées `AdresseBooking`/`CycleBooking` du contexte en payload plat backend)
- Types : `types/{creneau.types.ts, forfait.types.ts, intervention.types.ts}`
- État global : `app/providers/reservationContext/ReservationContext.tsx` + `useReservation.ts` (persistance `localStorage` sous `PENDING_RESERVATION_KEY` pour reprendre une réservation après connexion)
- Page : exclusivement `pages/Home.tsx`

## Endpoints API consommés

| Méthode | Route | Usage |
|---|---|---|
| POST | `/api/zones/check` | Vérification de couverture (`{latitude, longitude}`) |
| GET | `/api/forfaits` | Liste des forfaits actifs |
| GET | `/api/creneaux` | Créneaux disponibles (`zoneId`, `dureeMinutes`, `dateDebut`, `dateFin`) |
| POST | `/api/interventions` | Création de l'intervention |
| POST | `/api/interventions/:id/photos` | Upload photos (best-effort) |

## Entités Prisma liées

Aucune directement — orchestration frontend pure sur les entités des features `zones`,
`forfaits`, `planning` et `intervention`.

## Dépendances avec d'autres features

- Importe `CycleSelector` et `useReferentiel` de `cycle`, `useUserCyclesForReservation` importe `cycleService`
- Importe `ForfaitSelector` de `forfait`
- S'appuie sur `app/providers/reservationContext` et `app/providers/authContext`
- Est elle-même consommée par `adresse` (`useZoneCheck`) et `forfait` (types `ForfaitDto`/`ForfaitInfo`)

## Diagrammes

_À compléter (parcours client complet, diagramme de séquence tunnel) — session dédiée avec Yannick._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
