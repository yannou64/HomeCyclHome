---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Métier — HomeCycl'Home

Référence des entités, règles métier et contraintes du domaine.
Consulter ce fichier avant d'implémenter toute logique liée aux données.

---

## Entités principales

| Entité | Rôle |
|---|---|
| `Utilisateur` | Compte applicatif — client, technicien ou admin |
| `Role` | **Enum Prisma** (pas de table) — directement sur `Utilisateur.role` : `client`, `technicien`, `admin` |
| `Adresse` | Adresse geocodée — champs plats : numero, rue, code_postal, ville, pays, latitude, longitude, google_id |
| `Peut_se_situer` | Table de liaison n-n `Utilisateur ↔ Adresse` — porte : titre_description (libellé affiché dans le dropdown), adresse_principal, isValide (soft-delete), date_creation, date_invalidité |
| `Marque` | Marque d'un vélo (relation n-1 avec Cycle — FK directe) |
| `Zone` | Secteur géographique couvert — défini par un polygone GPS |
| `Zone_Point` | Point GPS ordonné constituant le polygone d'une zone |
| `TechnicienZone` | Table de liaison n-n — affectation d'un technicien à une zone |
| `Cycle` | Vélo appartenant à un client |
| `Type_cycle` | Catégorie de vélo (VAE, Route, VTT…) |
| `Forfait` | Prestation proposée avec durée estimée |
| `Prix_Forfait` | Historique des prix d'un forfait (date début/fin) |
| `Modele_Planification` | Patron récurrent de disponibilité d'un technicien dans une zone (jours, horaires, intervalle) |
| `Pause_Recurrente` | Plage d'indisponibilité hebdomadaire fixe d'un technicien (ex : pause déjeuner) |
| `Indisponibilite` | Absence ponctuelle d'un technicien sur une plage de dates précise |
| `Creneau` | Plage horaire concrète générée depuis un modèle de planification — réservable par un client |
| `StatutIntervention` | **Enum Prisma** (pas de table) — valeurs : `PLANIFIEE`, `TERMINEE`, `ANNULEE` |
| `Intervention` | Rendez-vous créé suite à une réservation |
| `Photo` | Photo déposée sur une intervention — livré le 2026-06-17 |
| `ContextePhoto` | **Enum Prisma** (pas de table) — discrimine **qui** a uploadé la photo : `client` (à la réservation) ou `technicien` (à la clôture). Ce n'est pas un avant/après temporel |
| `Paiement` | **Prévu, non implémenté** (Sprint 4) — déclaration de paiement physique d'une intervention |
| `Mode_Paiement` | **Prévu, non implémenté** (Sprint 4) — référentiel des modes (`Espèce`, `Carte`, `Chèque`) |
| `Statut_Paiement` | **Prévu, non implémenté** (Sprint 4) — référentiel des statuts (`En_Attente`, `Payé`) |
| `Produit` | **Prévu, non implémenté** (V2, hors MVP) — article additionnel proposable |
| `Ligne_commande` | **Prévu, non implémenté** (V2, hors MVP) — produit ajouté à une intervention |
| `Prix_Produit` | **Prévu, non implémenté** (V2, hors MVP) — historique des prix d'un produit |

---

## Règles métier critiques

### Adresses client

- Un client peut avoir plusieurs adresses liées via `Peut_se_situer`
- **Un client doit conserver au moins une adresse active** — la désactivation de la dernière adresse est bloquée (`BadRequestException 400`)
- **La première adresse créée est automatiquement définie comme adresse principale** (`adressePrincipal: true` envoyé par le frontend, `setPrincipal()` appelé après `create()` dans le use case)
- **Un seul `adresse_principal = true` par client** — règle enforced par transaction atomique :
  `UPDATE SET adresse_principal = false WHERE utilisateur_id = X` puis
  `UPDATE SET adresse_principal = true WHERE id_adresse = Y` dans la même transaction
- Désactiver le toggle principal → l'utilisateur n'a plus d'adresse principale (état valide)
- La suppression d'une adresse est un **soft-delete** : `isValide = false` + `date_invalidité = now()` — la ligne `Adresse` reste intacte pour l'historique des interventions
- L'adresse elle-même (rue, lat/lng, google_id…) est **immuable** après création — issue du géocodage Google Maps. Seuls `titre_description` et `adresse_principal` sont modifiables via `PATCH`
- `titre_description` est nullable — fallback affichage : adresse formatée (`rue, ville`)
- La déduplication de l'entité `Adresse` (table physique) se fait via `upsert` sur `google_place_id` — si l'adresse existe déjà en base (ex : partagée avec un autre utilisateur), elle est réutilisée. Seule la liaison `PeutSeSituer` est créée

### Réservation
- L'adresse doit être validée par Google Maps avant toute réservation
- L'adresse doit se situer dans une zone active (`is_active = true`)
- Un créneau ne peut être réservé que si `is_disponible = true`
- La création de l'intervention et le passage de `is_disponible = false`
  doivent être **atomiques** (transaction Prisma) — pas de double réservation possible
- La durée de l'intervention est imposée par le forfait (`duree_minutes`) —
  non modifiable par le client

### Utilisateurs et rôles
- Trois rôles : `client` | `technicien` | `admin`
- Un client ne peut accéder qu'à ses propres interventions et cycles
- Un technicien ne voit que les interventions de sa zone
- Un admin a accès à toutes les ressources

### Interventions
- Statuts possibles : `Planifiée` → `Terminée` | `Annulée`
- Une intervention `Terminée` doit avoir un paiement associé
- Le technicien peut ajouter photos et commentaires
- La date de clôture est enregistrée quand le statut passe à `Terminée`

### Zones géographiques
- Une zone est définie par un **polygone** : liste ordonnée de points GPS stockés dans `Zone_Point`
- La vérification qu'une adresse est dans une zone se fait **côté backend** (algorithme point-in-polygon sur les `ZonePoint`) — jamais côté client pour éviter toute manipulation
- L'admin dessine les zones visuellement via Google Maps JavaScript API
- Un technicien peut être affecté à plusieurs zones (`Technicien_Est_affecté`)
- Une zone peut avoir plusieurs techniciens

### Planification des créneaux

**Les trois couches de disponibilité** (appliquées dans l'ordre lors de la génération) :
1. `Modele_Planification` — socle : jours travaillés, horaires, intervalle entre créneaux
2. `Pause_Recurrente` — soustraction : plages hebdomadaires fixes (ex : déjeuner 12h-13h30)
3. `Indisponibilite` — soustraction : absences ponctuelles (congés, formations…)

**Règles du modèle de planification :**
- Un `Modele_Planification` est lié à **un seul technicien** et **une seule zone** — un technicien ne peut pas être dans deux zones simultanément
- Le `technicien_id` du modèle doit correspondre à une affectation existante dans `TechnicienZone` (prérequis vérifié dans le use case)
- Deux modèles d'un même technicien ne peuvent pas se **chevaucher dans le temps** (même jour, horaires qui se recoupent), quelle que soit la zone
- `date_fin_validite = null` signifie que le modèle est valable indéfiniment

**Règles des pauses récurrentes :**
- `jour_semaine = null` → la pause s'applique **tous les jours** (cas standard pour la pause déjeuner)
- `jour_semaine = 0..6` → la pause ne s'applique que ce jour précis

**Règles de génération des créneaux :**
- La génération est **idempotente** : relancer sur une période ne crée pas de doublons
- Lors d'une régénération (ex : absence ajoutée en cours de mois) :
  - Créneaux dans la période d'absence avec `is_disponible = true` → **supprimés**
  - Créneaux avec `is_disponible = false` (déjà réservés) → **signalés comme conflit**, non touchés
  - La génération retourne un rapport : N créés / N supprimés / N conflits
- `Creneau.date_fin` est **null** à la génération — calculée à la réservation : `date_debut + forfait.duree_minutes`
- Un créneau est disponible pour un forfait donné si : `date_debut + forfait.duree_minutes <= date_debut du prochain créneau réservé`

**Règle buffer — filtrage des créneaux pour le tunnel client :**
Un créneau `[i]` n'est **proposable** au client que si la fenêtre `[i-1 … i+k]` est entièrement disponible **et contiguë** :
- `creneaux[i-1]` disponible ET distant d'au plus `intervalle_minutes` — buffer aller (déplacement vers le client)
- `creneaux[i]` … `creneaux[i+k-1]` tous disponibles, et couvrant réellement `forfait.duree_minutes`
- `creneaux[i+k]` disponible ET contigu — buffer retour

Où `k` = nombre de slots consécutifs dont la `date_debut` est dans `[date_debut[i], date_debut[i] + duree_minutes)`.

La **contiguïté** est aussi déterminante que la disponibilité : un slot libre situé de l'autre côté d'une pause n'est pas un temps de trajet exploitable.

**Bornes de journée — asymétrie assumée :**
- le **premier** slot de chaque journée est refusé (aucun buffer aller possible : le technicien part de son domicile)
- le **dernier** slot de chaque journée est accepté sans buffer retour (il rentre chez lui)

**Découpage par technicien :** la règle s'applique indépendamment sur chaque groupe `(technicien, journée)`. Une zone couverte par plusieurs techniciens ne mélange donc jamais leurs plannings. Quand plusieurs sont libres au même horaire, un seul créneau est proposé — celui du premier technicien dans un ordre déterministe.

**Créneaux détachés :** un créneau dont `modele_planification_id` est `null` (conséquence du `onDelete: SetNull` lors de la suppression d'un modèle) n'a ni technicien ni intervalle connus. Il n'est **jamais proposable** — sans quoi il contournerait toute la règle de buffer.

Ce filtre est appliqué **en mémoire** dans `GetCreneauxDisponiblesUseCase` sur l'ensemble des créneaux de la zone (disponibles ET réservés) triés par `date_debut`, via la fonction de domaine `estCreneauReservable`. **La même règle est rejouée à la création d'intervention** (`409 Conflict` si elle échoue) : elle ne peut donc pas être contournée par un appel direct à l'API.

À la confirmation de réservation, tous les slots couverts par la durée du forfait sont marqués `is_disponible = false`.

Détail complet et justification des choix : [[Règle de réservabilité des créneaux]].

**Workflow admin complet :**
1. Créer les modèles de planification (jours/horaires/zone par technicien)
2. Configurer la pause récurrente du technicien
3. Saisir les absences ponctuelles au fil de l'eau
4. Lancer la génération pour une période (ex : "Générer juin 2026")
5. Consulter le rapport et traiter les éventuels conflits manuellement

### Prix
- Les prix des forfaits et produits sont historisés (date_debut / date_fin)
- Le prix applicable à une intervention est celui en vigueur à la date de création
- `date_fin = null` signifie que le prix est actuellement actif

### Paiement
- Le paiement est **physique uniquement** — aucune donnée bancaire stockée
- Modes acceptés : `Espèce` | `Carte` | `Chèque`
- Statuts : `En_Attente` → `Payé`

---

## Parcours client — étapes clés

1. Saisie adresse → validation Google Maps (geocoding → lat/lng)
2. Vérification zone couverte (point-in-polygon backend → retourne `zone_id`)
3. Renseignement des informations du cycle
   - Connecté : dropdown des cycles enregistrés + option "Ajouter un cycle"
   - Non connecté : saisie libre (marque, type) — stockée dans le `ReservationContext`
4. Sélection du forfait
5. Sélection du créneau disponible (filtrés par `zone_id` + `forfait_id`)
6. Vérification authentification → création de compte inline si non connecté
7. Confirmation → intervention créée + créneau marqué indisponible (transaction atomique)

**État du tunnel — `ReservationContext` (React) :**
L'état est accumulé côté frontend au fil des étapes :
`adresse` · `zone_id` · `cycle` · `forfait_id` · `creneau_id`
Si non connecté, s'y ajoute : `prenom` · `nom` · `email` · `telephone` · `password`
À la confirmation : un seul appel `POST /interventions` — le backend orchestre la création.

---

## Contraintes de données importantes

| Champ | Contrainte |
|---|---|
| `Utilisateur.email` | Unique, format email |
| `Utilisateur.password_hash` | Jamais exposé en réponse API |
| `Cycle.libelle` | Obligatoire — nom choisi par le client pour identifier son vélo |
| `Cycle.particularite` | Optionnel — notes libres (roues, équipements…) |
| `Cycle.marque_id` | FK vers `Marque` — `ON DELETE RESTRICT` |
| `Cycle.type_cycle_id` | FK vers `TypeCycle` — `ON DELETE RESTRICT` |
| `Cycle.utilisateur_id` | FK vers `Utilisateur` — `ON DELETE CASCADE` |
| `Adresse.latitude / longitude` | Obligatoires — issus du géocodage Google |
| `Adresse.google_id` | Identifiant Google Places |
| `Intervention.date_prevue` | >= date du jour |
| `Intervention.duree_minutes` | Issue du forfait, non modifiable |
| `Creneau.date_fin` | Nullable — null avant réservation, calculée à la réservation (`date_debut + forfait.duree_minutes`) |
| `Creneau.id_modele_planification` | Nullable — null pour les créneaux créés manuellement |
| `Zone_Point.ordre` | Obligatoire pour reconstituer le polygone dans l'ordre |
| `Forfait.nom_forfait` | Unique |
| `Zone.nom_zone` | Unique |
| `TechnicienZone` | PK composite `[technicien_id, zone_id]` — un technicien ne peut être affecté deux fois à la même zone |
| `Paiement` | Unique par intervention |
| `Pause_Recurrente.jour_semaine` | Nullable — null = s'applique tous les jours |
| `Modele_Planification.date_fin_validite` | Nullable — null = valable indéfiniment |
| `Modele_Planification` | Un technicien ne peut pas avoir deux modèles qui se chevauchent dans le temps |

---

## Relations clés

- Un `Utilisateur` possède un `Role` (client, technicien, admin)
- Un `Utilisateur` (client) possède plusieurs `Cycle`
- Un `Utilisateur` peut être lié à plusieurs `Adresse` via `Peut_se_situer` (n-n) — la liaison porte `titre_description`, `adresse_principal`, `isValide`, `date_invalidité`
- Un `Utilisateur` (technicien) est affecté à une ou plusieurs `Zone` (n-n via `TechnicienZone`)
- Un `Cycle` est lié à un `Type_cycle` (n-1) et à une `Marque` (n-1) — relation directe via FK, pas de table de jointure (MLD v2)
- Une `Zone` est définie par plusieurs `Zone_Point` (polygone ordonné)
- Un `Utilisateur` (technicien) peut avoir plusieurs `Modele_Planification` (un par jour/zone)
- Un `Modele_Planification` est lié à une `Zone` (n-1) et un `Utilisateur` technicien (n-1)
- Un `Modele_Planification` génère plusieurs `Creneau` (`id_modele_planification` nullable sur Creneau)
- Un `Utilisateur` (technicien) peut avoir plusieurs `Pause_Recurrente` et plusieurs `Indisponibilite`
- Un `Creneau` est lié à une `Zone` (direct, snapshot) et optionnellement à un `Modele_Planification`
- Un `Creneau` peut être lié à **plusieurs** `Intervention` dans le temps (cardinalité 0,n côté `Creneau` / 1,n côté `Intervention`, depuis le 2026-06-14) : la contrainte `@unique` sur `creneau_id` a été retirée pour permettre à un créneau libéré par annulation d'être re-réservé. L'unicité **active** (un seul rendez-vous en cours par créneau) est garantie applicativement par `is_disponible`, pas par une contrainte de base de données
- Une `Intervention` est liée à un client (`Id_Client`), un technicien (`Id_Technicien`),
  un `Prix_Forfait` (prix figé), une `Adresse` (figée), un `Creneau` et un `statut` (enum `StatutIntervention`)
- Une `Intervention` peut avoir plusieurs `Photo` (avec `Contexte_Photo`) et plusieurs `Ligne_commande`
- Une `Intervention` a au plus un `Paiement` (avec `Mode_Paiement` et `Statut_Paiement`)

---

## Principes de conception — Données snapshot (dénormalisation intentionnelle)

Le MLD contient plusieurs relations qui semblent former des "boucles". Ce sont des **dénormalisations intentionnelles** justifiées par le principe suivant :

> Les données de **configuration** (Forfait, Modele_Planification, Zone…) peuvent évoluer dans le temps.
> Les données d'**événement** (Creneau, Intervention) sont figées au moment de leur création.
> On "snapshot" les informations critiques pour garantir la cohérence historique.

**Tableau des snapshots et leur justification :**

| Champ "redondant" | Chemin alternatif | Pourquoi le snapshot est nécessaire |
|---|---|---|
| `Creneau.id_zone` | `Creneau → Modele_Planification → Zone` | Si le modèle est modifié ou supprimé, le créneau conserve sa zone d'origine. Aussi : performance des requêtes clients (`WHERE zone_id = ?`) |
| `Intervention.id_technicien` | `Intervention → Creneau → Modele_Planification → Utilisateur` | `id_modele_planification` est nullable (créneaux manuels). Si le modèle est supprimé, l'intervention garde son technicien. Snapshot de l'assignation au moment de la réservation |
| `Intervention.duree_minutes` | `Intervention → Prix_Forfait → Forfait → duree_minutes` | La durée d'un forfait peut changer. L'intervention garde la durée prévue au moment de la réservation |
| `Intervention.id_adresse` | `Intervention → Client → Peut_se_situer → Adresse` | Le client peut avoir plusieurs adresses et les modifier. L'adresse de l'intervention est figée à la réservation |
| `Intervention.id_historique_prix_forfait` | `Intervention → Forfait` (direct) | Le prix varie dans le temps. On stocke le prix applicable à la date de création, pas juste le forfait |

**Analogie comptable :** une facture garde le prix du jour de la vente, même si le tarif a changé depuis. Même principe ici.

---

## Ressources

- MCD détaillé (entités + attributs + associations) → [[Modèle Conceptuel de Données.md]]
- Cahier des charges fonctionnel initial → `docs/annexes/CDC HomeCycle'home.pdf`
- Livrable complet (MCD, MLD, dictionnaire) → `docs/annexes/Livrable HomeCycle'home.pdf`

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
