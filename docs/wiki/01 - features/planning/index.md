---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Planning

**Statut** : ✅ Complet

## Description

La feature la plus riche fonctionnellement : modèles de planification récurrents par
technicien/zone/jour, pauses récurrentes, indisponibilités ponctuelles, et
génération/suppression de créneaux (`Creneau`) selon un algorithme "3 couches"
(modèle → pauses → indisponibilités). Expose aussi la recherche de créneaux disponibles
côté client avec l'algorithme de buffer avant/après. Voir [[../../metier.md]] pour le
détail des règles de génération et de buffer.

## Fichiers Backend

- Module : `Backend/src/features/planning/planning.module.ts`
- Controllers : `controllers/{admin-planning.controller.ts, client-creneaux.controller.ts}`
- DTOs : `dto/{create-modele-planification.dto.ts, update-modele-planification.dto.ts, create-pause-recurrente.dto.ts, create-indisponibilite.dto.ts, generate-creneaux.dto.ts, generate-all-creneaux.dto.ts, get-creneaux-disponibles.dto.ts, planning.dto.ts}`
- Repository : `repositories/{planning.repository.interface.ts, planning.prisma.repository.ts}`
- Use cases (16, tous testés) : modèles (`create/get/update/delete-modele-planification`), pauses (`create/get/delete-pause-recurrente`), indisponibilités (`create/get/delete-indisponibilite`), `generate-creneaux`, `generate-all-creneaux`, `get-creneaux`, `delete-creneau`, `delete-creneaux-disponibles`, `get-creneaux-disponibles`
- Tests : 16 specs — couverture la plus complète du backend

## Fichiers Frontend

- Composants (admin) : `features/admin/components/planning/{AdminPlanningSection, CreneauxTab, CreneauGenerationForm, GenerationRapportDialog, IndisponibiliteFormDialog, IndisponibiliteList, ModelePlanificationFormDialog, ModelePlanificationList, PauseRecurrenteFormDialog, PauseRecurrenteList, PlanningDeleteDialog}/`
- Hook : `features/admin/hooks/useAdminPlanning.ts`
- Service : `features/admin/services/adminPlanningService.ts`
- Types : `features/admin/types/planning.types.ts`
- Côté client : `features/reservation/hooks/useCreneaux.ts` + `features/reservation/components/CreneauSelector/` (FullCalendar)

## Endpoints API

| Méthode | Route | Accès |
|---|---|---|
| GET/POST | `/api/admin/planning/modeles` | `@Roles('admin')` |
| PATCH/DELETE | `/api/admin/planning/modeles/:id` | `@Roles('admin')` |
| GET/POST | `/api/admin/planning/pauses` | `@Roles('admin')` |
| DELETE | `/api/admin/planning/pauses/:id` | `@Roles('admin')` |
| GET/POST | `/api/admin/planning/indisponibilites` | `@Roles('admin')` |
| DELETE | `/api/admin/planning/indisponibilites/:id` | `@Roles('admin')` |
| POST | `/api/admin/planning/creneaux/generate` | `@Roles('admin')` |
| POST | `/api/admin/planning/creneaux/generate-all` | `@Roles('admin')` |
| GET | `/api/admin/planning/creneaux` | `@Roles('admin')` |
| DELETE | `/api/admin/planning/creneaux/disponibles` | `@Roles('admin')` — bulk |
| DELETE | `/api/admin/planning/creneaux/:id` | `@Roles('admin')` (204) |
| GET | `/api/creneaux` | Public — filtré `zoneId`, `dureeMinutes`, `dateDebut`, `dateFin` |

## Entités Prisma liées

- `ModelePlanification`, `PauseRecurrente`, `Indisponibilite`, `Creneau`, `Zone`, `Utilisateur` (technicien)

## Dépendances avec d'autres features

- Aucune vers d'autres modules features — vérifications d'existence technicien/zone directement via Prisma dans le repository de la feature

## Règle de réservabilité

La règle qui filtre les créneaux proposés au client (buffers aller/retour, couverture
du forfait, découpage par technicien et par journée) est documentée en détail dans
[[Règle de réservabilité des créneaux]].

Elle vit dans une fonction pure — `planning/domain/creneau-reservable.ts` — appelée
à la fois par `GetCreneauxDisponiblesUseCase` (lecture) et `CreateInterventionUseCase`
(écriture). Le dossier `domain/` matérialise la couche Domaine de la Clean Architecture,
qui n'avait pas encore d'existence physique dans le backend.

## Évolutions prévues

- **Nettoyage des créneaux** — conçu le 2026-08-16, reporté au prochain sprint. Corrige la
  création de créneaux orphelins (`onDelete: SetNull` sur `Creneau.modele_planification`) et
  ajoute deux outils admin de purge. Plan complet :
  [[Nettoyage des créneaux — chantier à venir]].

## Diagrammes

_Modélisations Excalidraw à placer dans `Diagrammes/` — parcours client, orchestration
(groupes → règle → fusion), algorithme de rejet._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
