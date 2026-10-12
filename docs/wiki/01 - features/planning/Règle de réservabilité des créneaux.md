---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Règle de réservabilité des créneaux

Fiche de référence sur la règle qui décide quels créneaux sont proposés au client
dans le tunnel de réservation. À lire avant toute modification de
`GetCreneauxDisponiblesUseCase` ou `CreateInterventionUseCase`.

Diagrammes associés : voir [[Diagrammes]].

---

## 1. Le besoin métier

Un technicien se déplace **au domicile** du client. Il ne peut donc pas enchaîner
deux interventions collées : il lui faut le temps d'arriver, puis de repartir.

Si le planning affichait tous les créneaux libres, on pourrait réserver 9h00–10h00
chez un client à Villeurbanne et 10h00–11h00 chez un autre à Vaise. Le technicien
serait mécaniquement en retard dès la deuxième intervention.

La règle réserve donc **un slot libre de part et d'autre** de chaque intervention :

- le **buffer aller** — le temps de rejoindre le client
- le **buffer retour** — le temps de repartir vers le suivant

Ces buffers ne sont pas facturés et n'apparaissent jamais au client : ils sont
simplement retirés de l'offre.

---

## 2. Vocabulaire — la confusion à éviter

Deux notions portent le même mot dans le langage courant. Les distinguer est la
clé pour comprendre le code.

| Terme | Ce que c'est | Durée |
|---|---|---|
| **Slot** | Une case de la grille, générée depuis le `ModelePlanification` | Fixe — `intervalleMinutes` (ex. 30 min) |
| **Créneau proposé** | Un horaire de début d'intervention offert au client | Variable — la durée du forfait choisi |

Un créneau proposé **couvre plusieurs slots** si le forfait dure plus qu'un slot.
Un forfait d'1 h sur une grille de 30 min consomme deux slots, plus les deux
buffers : quatre slots au total pour une seule proposition.

En base, seuls les **slots** existent (table `Creneau`). Le créneau proposé est
calculé à la volée : il n'est jamais persisté.

---

## 3. L'énoncé de la règle

> Un slot d'index `i` n'est proposable que si la fenêtre `[i-1 … i+k]` est
> entièrement **libre** et **contiguë**, où `k` est le nombre de slots couverts
> par la durée du forfait.

« Contiguë » est aussi important que « libre ». Un slot libre situé deux heures
plus tôt existe bien, mais ne constitue pas un temps de trajet : c'est un trou de
pause. L'écart entre deux slots doit rester inférieur ou égal à `intervalleMinutes`.

**Deux exceptions assumées aux bornes de journée :**

| Borne | Règle | Justification |
|---|---|---|
| Premier slot du jour | **Refusé** | Le technicien part de chez lui, il lui faut le temps d'arriver |
| Dernier slot du jour | **Accepté** sans buffer retour | Il rentre chez lui, inutile de lui bloquer un créneau |

Cette asymétrie est un choix, pas un oubli. Elle évite de perdre une demi-heure de
capacité chaque soir tout en garantissant un trajet d'arrivée réaliste chaque matin.

---

## 4. Les décisions et leur justification

**Pourquoi charger aussi les créneaux réservés ?**
La requête ne filtre pas sur `is_disponible`. C'est indispensable : un slot absent
du tableau et un slot occupé produiraient le même « trou », alors que les deux
situations sont différentes. Garder les slots réservés permet de distinguer « déjà
pris par un client » de « hors horaires de travail ».

**Pourquoi grouper par technicien ET par jour ?**
La règle raisonne sur les voisins immédiats dans un tableau trié. Ces voisins n'ont
de sens que pour un même technicien sur une même journée. Une zone couverte par
deux techniciens produit sinon des slots entrelacés : le « slot précédent » de Marc
peut être un slot de Julie, et la règle valide alors le mauvais planning.

**Pourquoi un seul créneau par horaire ?**
Quand deux techniciens sont libres au même moment, proposer les deux afficherait
deux blocs identiques dans le calendrier, sans que le client puisse arbitrer. On
n'en garde qu'un — le premier dans un ordre déterministe. Conséquence connue : le
même technicien remporte systématiquement les égalités et se remplit en premier.
C'est acceptable à l'échelle actuelle ; si la répartition devient un sujet, seule
l'étape de dédoublonnage est à modifier.

**Pourquoi le prénom seul du technicien ?**
`GET /api/creneaux` est un endpoint **public**, accessible sans authentification.
Exposer le nom complet d'un salarié à n'importe quel visiteur n'est pas justifié :
le prénom suffit à rassurer le client sur le fait qu'une personne identifiée viendra.

---

## 5. Le parcours de la donnée

Trois étapes, toutes en mémoire — une seule requête SQL en amont.

1. **Partition** — les créneaux bruts de la zone sont répartis en groupes
   `(technicien, journée de travail)`.
2. **Application de la règle** — chaque groupe est traité indépendamment par
   `estCreneauReservable`. C'est cet isolement qui garantit qu'un rendez-vous chez
   un technicien n'affecte pas les disponibilités d'un autre.
3. **Fusion** — les créneaux acceptés sont rassemblés, triés, puis dédoublonnés par
   horaire.

Point important : la fusion ne peut pas produire un créneau invalide. La règle ne
lit que son propre groupe, jamais la liste de sortie — un verdict est donc adossé au
planning complet de son technicien, et retirer un doublon n'en invalide aucun.

En revanche, la liste renvoyée **n'est plus une frise temporelle cohérente** : deux
entrées consécutives peuvent appartenir à des techniciens différents. Aucun calcul
frontend ne doit donc raisonner sur l'adjacence des éléments reçus.

---

## 6. Où vit la règle

`Backend/src/features/planning/domain/creneau-reservable.ts`

C'est une **fonction pure** : pas de NestJS, pas de Prisma, pas d'entrée/sortie.
Elle prend un tableau de slots, un index, une durée, et répond `true` ou `false`.

Le dossier `domain/` matérialise la couche « Domaine » annoncée par
`Backend/CLAUDE.md` §2, qui n'avait jamais eu de dossier : toutes les règles vivaient
jusque-là à l'intérieur des use cases. Trois critères justifiaient l'extraction :

- c'est une règle **métier**, pas technique
- elle est **partagée** entre la lecture et l'écriture — elle n'appartient donc à
  aucun use case en particulier
- elle est **pure**, donc testable sans mock de repository

Distinction utile : un *use case* est une opération (il orchestre, connaît le
repository, lève des exceptions HTTP) ; une *règle de domaine* est un énoncé (elle
ne fait rien, elle répond vrai ou faux).

**La même fonction est appelée aux deux extrémités** :

| Appelant | Rôle |
|---|---|
| `GetCreneauxDisponiblesUseCase` | filtrer ce qui est proposé au client |
| `CreateInterventionUseCase` | revalider au moment de la réservation → `409 Conflict` |

Le second point est essentiel : sans lui, un appel direct à `POST /api/interventions`
(Postman, Swagger, futur client mobile) contournerait toute la règle.

---

## 7. Les cas limites

| Situation | Comportement | Pourquoi |
|---|---|---|
| Premier slot de la journée | Refusé | Aucun buffer aller possible |
| Premier slot après la pause déjeuner | Refusé | Le slot précédent est à 2 h d'écart : trou, pas trajet |
| Dernier slot avant la pause | Refusé | Le slot suivant est de l'autre côté de la pause |
| Dernier slot de la journée | **Accepté** | Exception de fin de journée |
| Intervention débordant sur la pause | Refusé | Les slots trouvés ne couvrent pas toute la durée |
| Zone à plusieurs techniciens | Un seul créneau par horaire | Dédoublonnage, premier technicien |
| Créneau détaché de son modèle | **Non proposable** | Ni technicien identifiable, ni intervalle connu → buffers invérifiables |

### Le piège des créneaux orphelins

`Creneau.modele_planification` est déclaré `onDelete: SetNull`. Supprimer un modèle de
planification ne supprime donc pas ses créneaux : il les **détache**. Ils restent en base
avec `modele_planification_id = null`.

Un créneau détaché n'a plus ni technicien ni `intervalle_minutes` : le repository lui
attribue `Infinity`, ce qui neutralisait auparavant tous les contrôles d'écart. Autrement
dit, un orphelin passait la règle sans qu'aucun buffer ne soit vérifié.

Constat au 2026-08-16 : **1097 créneaux sur 1133** étaient dans cet état, accumulés depuis
juin au fil des suppressions/recréations de modèles. La règle ne s'appliquait donc
réellement qu'à 3 % des créneaux.

Deux conséquences traitées :

- `estCreneauReservable` **refuse** désormais tout créneau dont `intervalleMinutes` n'est
  pas fini. Un orphelin ne peut plus être proposé ni réservé.
- Les 1046 orphelins libres et sans intervention ont été supprimés. Les 51 restants sont
  conservés : ils portent des interventions historiques (`Intervention.creneau` est en
  `Restrict`, ils ne sont pas supprimables).

**Limite à connaître :** l'écran admin « supprimer les créneaux disponibles » filtre sur
`modele_planification: { technicien_id }` et ne peut donc **pas** atteindre les orphelins.
Si le cas se reproduit, le nettoyage se fait hors interface.

---

## 8. Historique — les quatre défauts corrigés

Ces défauts coexistaient et se masquaient partiellement. Repérés en relisant le
pipeline complet, corrigés en août 2026.

**1. Les deux buffers n'étaient pas symétriques.** Le buffer aller vérifiait la
contiguïté, le buffer retour non. Le « créneau de retour » pouvait donc être
satisfait par un slot situé après la pause déjeuner, ou le lendemain matin.

**2. La couverture n'était jamais vérifiée.** La boucle contrôlait que les slots
trouvés étaient libres, mais jamais qu'ils étaient assez nombreux pour couvrir la
durée du forfait. Une intervention pouvait déborder dans une pause.

**3. Le multi-techniciens cassait l'algorithme dans les deux sens.** Slots
entrelacés : buffer aller validé sur le mauvais technicien (trop permissif), et
couverture exigeant que *tous* les techniciens soient libres (trop restrictif).
Bug latent — il ne s'activait qu'à partir de la deuxième affectation sur une zone.

**4. Aucune validation à l'écriture.** `CreateInterventionUseCase` ne vérifiait
qu'un seul slot. Scénario concret : A réserve 14h30 pour 1 h (verrouille 14h30 et
15h00), puis B réserve 14h00 — le premier slot est libre, ça passe, et 14h30 se
retrouve dans deux interventions.

**Pourquoi c'était invisible :** un filtre côté React (`creneauxValides` dans
`CreneauSelector`) rattrapait une partie des défauts 1 et 2 à l'affichage. Le
symptôme ne se voyait donc jamais dans l'application — seulement en appelant l'API
directement. Ce filtre a été supprimé : la règle métier ne doit pas vivre dans un
composant d'affichage.

---

## 9. Tests

| Fichier | Couvre |
|---|---|
| `domain/creneau-reservable.spec.ts` | La règle seule — 14 cas, dont toutes les bornes |
| `use-cases/get-creneaux-disponibles.use-case.spec.ts` | L'orchestration — partition, dédoublonnage, multi-techniciens |
| `use-cases/create-intervention.use-case.spec.ts` | La revalidation à l'écriture — double réservation refusée |

La fonction pure se teste sans aucun mock : on lui passe un tableau, on lit le
booléen. C'est le principal bénéfice pratique de l'avoir sortie du use case.

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
