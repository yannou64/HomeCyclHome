---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Features — HomeCycl'Home

Point d'entrée des fiches par feature. Chaque dossier correspond à un module technique,
miroir de `Backend/src/features/` et `Frontend/src/features/`. Contenu factuel
(description, fichiers impliqués, endpoints, entités) — les diagrammes (parcours client,
séquence) seront ajoutés lors d'une session dédiée avec Yannick.

Voir [[../index.md]] pour la vue d'ensemble du projet et [[../architecture.md]] pour les
conventions de structure communes à toutes les features.

---

## Table des features

| Feature | Statut | Description courte |
|---|---|---|
| [[01 - features/auth/index]] | ✅ Complet | Inscription, connexion, JWT en cookies HttpOnly, confirmation email |
| [[01 - features/users/index]] | ✅ Complet | Profil personnel (self-service) et administration de tous les utilisateurs |
| [[01 - features/admin/index]] | ✅ Complet | Back-office : dashboard KPI + CRUD utilisateurs |
| [[01 - features/cycle/index]] | ✅ Complet | Gestion des vélos du client + référentiels marques/types |
| [[01 - features/referentiel/index]] | ✅ Complet | Référentiels Marque et TypeCycle (CRUD admin + lecture publique) |
| [[01 - features/adresses/index]] | ✅ Complet | Carnet d'adresses client, adresse principale, soft-delete |
| [[01 - features/zones/index]] | ✅ Complet | Zones géographiques (polygones) + vérification point-in-polygon |
| [[01 - features/affectations/index]] | ✅ Complet | Affectation des techniciens aux zones |
| [[01 - features/forfaits/index]] | ✅ Complet | Catalogue des prestations + historique des prix |
| [[01 - features/planning/index]] | ✅ Complet | Modèles de planification, pauses, indisponibilités, génération de créneaux |
| [[01 - features/reservation/index]] | ✅ Complet | Tunnel de réservation client (orchestration transverse, frontend uniquement) |
| [[01 - features/intervention/index]] | ✅ Complet | Réservation, consultation, annulation, upload photos d'intervention |
| [[01 - features/email/index]] | ✅ Complet | Service technique d'envoi d'emails transactionnels (pas de controller) |

**Hors périmètre features (à venir, Sprint 4) :** paiement, clôture technicien — voir [[../sprint-actuel.md]] et [[../metier.md]].

---

## Dépendances croisées entre features (backend)

| Feature | Dépend de (import de code) |
|---|---|
| `auth` | `email` |
| `intervention` | `email`, `shared/storage` (S3) |
| `admin` | `users` (DTO `UserRole`) |
| `shared/guards`, `shared/decorators` | `users` (DTO `UserRole`) |

Les autres couplages (cycle ↔ marques/type-cycles, intervention ↔ cycle/adresses/forfaits/planning/zones)
existent uniquement via identifiants métier (`marqueId`, `zoneId`, `creneauId`…), jamais via import de
module NestJS — chaque repository Prisma d'une feature interroge directement les tables des autres
domaines quand nécessaire. Détail dans [[../architecture.md]].

Côté frontend, `reservation` est la feature la plus intégratrice : elle importe des composants/hooks
de `cycle` et `forfait`, et est elle-même consommée par `adresse` (vérification de zone). Voir [[01 - features/reservation/index]].

---

## Couverture de tests

Backend : tests unitaires Jest colocalisés (`*.use-case.spec.ts`) sur toutes les features sauf `email`
(0 spec). Aucun test d'intégration Supertest n'existe (`Backend/test/` ne contient que la config
`jest-e2e.json`). Aucun controller n'a de test dédié.

Frontend : aucun test automatisé (pas de `*.test.tsx`, pas de dépendance vitest/jest/testing-library
dans `package.json`).

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
