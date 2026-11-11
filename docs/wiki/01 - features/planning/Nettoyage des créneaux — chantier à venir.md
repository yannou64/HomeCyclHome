---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Nettoyage des créneaux — chantier à venir

**Statut :** 📋 Conçu, non implémenté — reporté au prochain sprint
**Conçu le :** 2026-08-16

Chantier issu de l'incident des créneaux orphelins découvert lors de la fiabilisation de la
règle de réservabilité. Voir [[Règle de réservabilité des créneaux]] pour le contexte.

---

## Pourquoi ce chantier

Le nettoyage manuel de 1046 créneaux orphelins a révélé deux manques.

**La cause.** `Creneau.modele_planification` est déclaré `onDelete: SetNull`
(`Backend/prisma/schema.prisma`, ligne 254). Supprimer un modèle de planification ne supprime
pas ses créneaux : il les **détache**. `DeleteModelePlanificationUseCase` fait un simple
`delete` sans transaction ni traitement des créneaux — chaque manipulation de planning laisse
donc des orphelins derrière elle.

**L'absence d'outil.** `DELETE /admin/planning/creneaux/disponibles` filtre sur
`modele_planification: { technicien_id }`. Les orphelins, n'ayant plus de modèle, sont
**inatteignables depuis l'interface**. Il a fallu passer par un script hors application.

**Effet de bord identifié.** Quand un créneau réservé devient orphelin, le `where` de
`cancelInterventionTransaction` se réduit à `modele_planification_id: null` et libère au
passage **tous les autres orphelins de la même zone sur la fenêtre horaire** — des créneaux
verrouillés par d'autres interventions. Tarir la source d'orphelins ferme aussi cette porte.

**Objectif :** empêcher la création d'orphelins, et donner à l'admin de quoi remettre les
créneaux à plat sans script.

---

## Décisions actées

| Sujet | Décision |
|---|---|
| Prévention | Supprimer les créneaux **libres** d'un modèle dans la même transaction que le modèle |
| Bouton par technicien | Supprime ses créneaux **non réservés à venir** |
| Reset général | Tous les créneaux libres de la base, **orphelins inclus**, toutes dates |
| Purge du passé | Hors périmètre — **cron dédié**, feature distincte à planifier |

---

## Règle de sécurité transversale

Toute suppression de créneaux, quel que soit le point d'entrée, filtre sur **deux** critères :

```ts
{ is_disponible: true, interventions: { none: {} } }
```

- **`is_disponible: true`** — on ne touche jamais à un créneau réservé, même sans intervention
  rattachée. Une intervention de 2 h verrouille 4 slots mais n'en référence qu'un : les trois
  autres sont `false` sans clé étrangère. Les supprimer puis régénérer les recréerait *libres*
  et ouvrirait une double réservation.
- **`interventions: { none: {} }`** — `Intervention.creneau` est en `Restrict`. Un créneau
  libéré par une annulation reste référencé par l'intervention annulée ; le supprimer lève une
  `P2003`. Le cas existe en base — rencontré lors du nettoyage manuel, 1 créneau sur 1047.

---

## Lot A — Prévention : suppression d'un modèle

`DeleteModelePlanificationUseCase` + `deleteModele` dans `planning.prisma.repository.ts:136-138`.

Passer `deleteModele` en `$transaction` :

1. `creneau.deleteMany` sur les créneaux du modèle respectant la règle de sécurité
2. `modelePlanification.delete`

Ne resteront orphelins que les créneaux réservés ou porteurs d'une intervention — ceux qui ont
une raison légitime de survivre au modèle, pour l'historique.

Le use case garde sa signature (`Promise<void>`, réponse 204) : pas de changement de contrat.

## Lot B — Bouton « supprimer les créneaux à venir de ce technicien »

Nouveau chemin complet, sans toucher à l'existant :

- **Repository** — `deleteCreneauxLibresTechnicien(technicienId: string, aPartirDe: Date): Promise<number>`,
  calqué sur `deleteCreneauxDisponibles` (`planning.prisma.repository.ts:333-346`) mais borné
  par `date_debut: { gte: aPartirDe }` seulement.
- **Use case** — `DeleteCreneauxTechnicienUseCase`, valide `technicienId`, calcule
  `aPartirDe = maintenant`, retourne `{ deleted }`.
- **Route** — `DELETE /admin/planning/creneaux/technicien`, query `technicienId`,
  `@HttpCode(OK)`, retourne `{ deleted }`.

⚠️ **À déclarer avant `DELETE creneaux/:id`** (ligne 201 du contrôleur) : une route statique
placée après serait interprétée comme un `:id`.

## Lot C — Reset général

- **Repository** — `deleteTousCreneauxLibres(): Promise<number>`. Aucun filtre de technicien,
  de zone ni de date : uniquement la règle de sécurité. C'est le seul chemin qui atteint les
  orphelins, puisqu'il ne passe pas par le join `modele_planification`.
- **Use case** — `ResetCreneauxUseCase`, retourne `{ deleted }`.
- **Route** — `DELETE /admin/planning/creneaux/reset`, `@HttpCode(OK)`, également **avant** `:id`.

## Lot D — Corriger le 500 sur la suppression unitaire (bonus)

`DeleteCreneauUseCase` ne teste que `isDisponible`. Un créneau libéré par une annulation passe
ce test mais échoue en base sur la contrainte `Restrict` → **500 non géré**. C'est exactement
le créneau qui a fait échouer la première tentative de nettoyage manuel.

Ajouter au repository un `creneauPorteUneIntervention(id)` et lever une `ConflictException`
explicite. Cinq lignes plus un test.

## Lot E — Frontend

Fichiers : `features/admin/components/planning/CreneauxTab/`, `hooks/useAdminPlanning.ts`,
`services/adminPlanningService.ts`, `types/planning.types.ts`.

- **Service** — deux méthodes suivant la convention du fichier (DELETE → params query) :
  `deleteCreneauxTechnicien(technicienId)` et `resetCreneaux()`.
- **Hook** — deux fonctions dans le bloc « Créneaux », sur le modèle de
  `deleteCreneauxDisponibles` (ligne 147) : `selectedTechnicienId` pris dans la closure,
  `loadCreneaux` rappelé à la fin.
- **Type** — `SuppressionRapport = { deleted: number }` (aucun type de rapport de suppression
  n'existe aujourd'hui).
- **`SuppressionRapportDialog`** — clone de `GenerationRapportDialog` : même structure de
  tuiles, SCSS réutilisable quasi tel quel. Comble un manque existant — le `{ deleted }` déjà
  renvoyé par « Supprimer les disponibles » n'est aujourd'hui **jamais affiché**.
- **`CreneauxTab`** — une section « Zone de danger » en bas, visuellement distincte (fond rouge
  pâle, sur le calque de `.form`), avec les deux boutons. Réutiliser `.deleteDisponiblesButton`
  pour le style. Confirmation via `PlanningDeleteDialog`, avec un libellé explicite pour le
  reset (« tous techniciens confondus, y compris les créneaux orphelins »).
- **`PlanningDeleteDialog`** — ajouter un état de confirmation en cours : aujourd'hui
  `handleConfirm` fait `await onConfirm(); onClose();` sans try/catch ni désactivation du
  bouton. Sur un reset portant sur un millier de lignes, ça autorise le double-clic et laisse
  l'erreur non gérée. Amélioration valable pour les 5 points d'appel existants.

## Lot F — À reconsidérer plus tard

- **Cron de purge du passé** — suppression automatique des créneaux libres antérieurs à
  aujourd'hui. Feature distincte, à planifier.
- **Le `SetNull` lui-même** — même avec le lot A, un orphelin réservé reste possible. Le
  prédicat `modele_planification_id: null` des transactions d'intervention reste alors trop
  large. À reconsidérer si le cas se présente.

---

## Tests attendus

- `delete-modele-planification.use-case.spec.ts` — les 2 tests existants restent valides ;
  ajouter la vérification que les créneaux libres sont supprimés et les réservés conservés.
- Nouvelles specs pour `DeleteCreneauxTechnicienUseCase` et `ResetCreneauxUseCase` (validation,
  comptage, cas vide).
- `delete-creneau.use-case.spec.ts` — un test pour le lot D.

⚠️ Les trois specs de suppression mockent `IPlanningRepository` intégralement via un
`buildMockRepo()` local : **toute nouvelle méthode d'interface impose de mettre à jour ces
builders**, sinon la compilation casse.

## Vérification

1. `cd Backend && npx tsc --noEmit && npx jest`
2. `cd Frontend && npx tsc --noEmit && npm run lint && npm run build`
3. **Manuel via l'admin** — créer un modèle, générer des créneaux, supprimer le modèle, puis
   vérifier qu'aucun orphelin libre n'est apparu :
   `SELECT count(*) FROM "Creneaux" WHERE modele_planification_id IS NULL AND is_disponible = true;`
   doit rester à 0.
4. **Reset** — générer sur deux techniciens, réserver une intervention, lancer le reset : les
   créneaux du bloc réservé doivent survivre, tous les autres disparaître, et le rapport
   afficher le compte exact.
5. **Non-régression** — le bouton « Supprimer les disponibles (N) » doit continuer à
   fonctionner à l'identique.

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
