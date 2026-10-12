---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Modèle Conceptuel de Données — HomeCycl'Home

> Document de référence pour Claude Code. Décrit l'ensemble des entités, attributs et relations du MCD de l'application HomeCycl'Home.

---

## Entités et attributs

### Utilisateur

|Attribut|Type|Remarque|
|---|---|---|
|Id_Utilisateur|UUID/INT|PK|
|nom|VARCHAR||
|prenom|VARCHAR||
|email|VARCHAR|Unique|
|password_hash|VARCHAR||
|telephone|VARCHAR||
|is_actif|BOOLEAN|Défaut true|
|email_verifie|BOOLEAN|Défaut false|
|date_creation|DATETIME|Auto|
|date_maj|DATETIME|Auto|
|dernier_login|DATETIME||
|role|**Enum**|`Role` (`client` \| `technicien` \| `admin`) — voir remarque dans l'entité Role ci-dessous, pas de FK|

---

### Role

|Attribut|Type|Remarque|
|---|---|---|
|Id_Role|UUID/INT|PK|
|libelle|VARCHAR|Ex: client, technicien, admin|

> **Correction :** implémenté comme **enum Prisma** `Role` (pas de table), directement sur
> `Utilisateur.role` — même traitement que `Statut_Intervention` ci-dessous.

---

### Adresse

|Attribut|Type|Remarque|
|---|---|---|
|Id_Adresse|UUID/INT|PK|
|Numero|VARCHAR||
|rue|VARCHAR||
|code_postal|VARCHAR|Champ plat — voir décision ci-dessous|
|ville|VARCHAR|Champ plat|
|pays|VARCHAR|Champ plat|
|google_id|VARCHAR|Identifiant Google Places, unique|
|latitude|DECIMAL|Obligatoire|
|longitude|DECIMAL|Obligatoire|

> **Décision (2026-06-05, actée dans [[log.md]]) :** `Ville` et `Pays` ont été retirés comme entités séparées — `code_postal`, `ville` et `pays` sont des champs plats directement sur `Adresse`. Justification : complexité inutile pour un service hyperlocal (une seule zone de chalandise).

---

### Marque

|Attribut|Type|Remarque|
|---|---|---|
|Id_Marque|UUID/INT|PK|
|libelle|VARCHAR||

---

### Type_cycle

|Attribut|Type|Remarque|
|---|---|---|
|Id_Type_cycle|UUID/INT|PK|
|libelle|VARCHAR|Ex: VTT, Route, VAE|

---

### Cycle

|Attribut|Type|Remarque|
|---|---|---|
|Id_Cycle|UUID/INT|PK|
|libelle|VARCHAR|Nom choisi par le client pour identifier son vélo|
|particularite|TEXT|Optionnel — notes libres|
|date_creation|DATETIME|Auto|
|Id_Utilisateur|FK|Propriétaire (client)|
|Id_Type_cycle|FK|Référence Type_cycle|
|Id_Marque|FK|Référence Marque|

> **Correction :** la relation Cycle ↔ Marque est une **FK directe (n-1)**, pas une association many-to-many — un cycle a une seule marque, une marque a plusieurs cycles. L'ancienne association `Asso_21` de ce document n'a jamais été implémentée ainsi (voir [[metier.md]]).

---

### Zone

|Attribut|Type|Remarque|
|---|---|---|
|Id_Zone|UUID/INT|PK|
|nom_zone|VARCHAR|Unique|
|is_active|BOOLEAN|Défaut true|
|date_creation|DATETIME|Auto|

---

### Zone_Point

|Attribut|Type|Remarque|
|---|---|---|
|Id_Zone_Point|UUID/INT|PK|
|latitude|DECIMAL||
|longitude|DECIMAL||
|ordre|INT|Permet de reconstituer le polygone dans l'ordre|
|Id_Zone|FK|Référence Zone|

> Une zone est définie par un **polygone** constitué d'une liste ordonnée de points GPS.
>
> ⚠️ **Correction :** la vérification qu'une adresse appartient à une zone ne passe **pas** par
> `google.maps.geometry.poly.containsLocation()`. C'est un algorithme **Ray Casting** maison
> (théorème de Jordan, ~10 lignes, sans dépendance externe), implémenté côté **backend** dans
> `CheckZoneUseCase` (`POST /zones/check`) — jamais côté client, pour éviter toute manipulation.
> Voir [[metier.md]] et [[log.md]] (entrée 2026-06-06).

---

### Modele_Planification

|Attribut|Type|Remarque|
|---|---|---|
|Id_Modele_Planification|UUID/INT|PK|
|jour_semaine|INT|0..6|
|heure_debut|TIME||
|heure_fin|TIME||
|intervalle_minutes|INT|Espacement entre créneaux générés|
|date_debut_validite|DATETIME||
|date_fin_validite|DATETIME|Nullable — null = valable indéfiniment|
|Id_Zone|FK|Référence Zone|
|Id_Utilisateur|FK|Référence Utilisateur (technicien)|

> Patron récurrent de disponibilité d'un technicien dans une zone. Deux modèles d'un même technicien ne peuvent pas se chevaucher dans le temps.

---

### Pause_Recurrente

|Attribut|Type|Remarque|
|---|---|---|
|Id_Pause_Recurrente|UUID/INT|PK|
|jour_semaine|INT|Nullable — null = s'applique tous les jours|
|heure_debut|TIME||
|heure_fin|TIME||
|Id_Utilisateur|FK|Référence Utilisateur (technicien)|

> Plage d'indisponibilité hebdomadaire fixe d'un technicien (ex : pause déjeuner).

---

### Indisponibilite

|Attribut|Type|Remarque|
|---|---|---|
|Id_Indisponibilite|UUID/INT|PK|
|date_debut|DATETIME||
|date_fin|DATETIME||
|motif|VARCHAR|Optionnel|
|Id_Utilisateur|FK|Référence Utilisateur (technicien)|

> Absence ponctuelle d'un technicien sur une plage de dates précise (congés, formation…).

---

### Creneau

|Attribut|Type|Remarque|
|---|---|---|
|Id_Creneau|UUID/INT|PK|
|date_debut|DATETIME||
|date_fin|DATETIME|Nullable — null avant réservation, calculée à la réservation|
|is_disponible|BOOLEAN|Défaut true|
|Id_Zone|FK|Référence Zone|
|Id_Modele_Planification|FK|Nullable — null pour les créneaux créés manuellement|

> Un créneau représente une **plage de disponibilité** générée depuis un `Modele_Planification` (ou créée manuellement). Sa durée effective est fixée à la réservation par le forfait choisi. Il devient indisponible (is_disponible = false) dès qu'une intervention active lui est liée.

---

### Forfait

|Attribut|Type|Remarque|
|---|---|---|
|Id_Forfait|UUID/INT|PK|
|nom_forfait|VARCHAR|Unique|
|description|TEXT||
|duree_minutes|INT|> 0|
|is_active|BOOLEAN|Défaut true|
|date_creation|DATETIME|Auto|

---

### Prix_Forfait (Historique_Prix_Forfait)

|Attribut|Type|Remarque|
|---|---|---|
|Id_Historique_Prix_Forfait|UUID/INT|PK|
|prix|DECIMAL|>= 0|
|date_debut|DATETIME||
|date_fin|DATETIME|Null si prix actif|
|Id_Forfait|FK|Référence Forfait|

> Permet de conserver l'historique des prix. L'Intervention référence directement **Prix_Forfait** pour figer le prix au moment de la réservation.

---

### Intervention

|Attribut|Type|Remarque|
|---|---|---|
|Id_Intervention|UUID/INT|PK|
|date_prevue|DATETIME|>= date du jour|
|duree_minutes|INT|Issue du forfait|
|commentaire_client|TEXT||
|commentaire_technicien|TEXT||
|date_creation|DATETIME|Auto|
|date_cloture|DATETIME|Si statut = Terminée|
|Id_Historique_Prix_Forfait|FK|Prix forfait figé à la réservation|
|statut|**Enum**|`StatutIntervention` — voir remarque ci-dessous|
|Id_Adresse|FK|Adresse d'intervention (figée à la réservation)|
|Id_Creneau|FK|Créneau réservé — un créneau peut être lié à plusieurs interventions dans le temps (annulée puis re-réservé)|
|Id_Technicien|FK|Référence Utilisateur (rôle technicien)|
|Id_Client|FK|Référence Utilisateur (rôle client)|

> **Décision (2026-06-05, actée dans [[log.md]]) :** `Statut_Intervention` a été retiré comme table de référence, remplacé par un **enum Prisma** `StatutIntervention` (`Planifiee`, `Terminee`, `Annulee`). Justification : 3 valeurs fixes non administrables par le client — l'enum est une contrainte de type au niveau base de données, plus rigoureux qu'une table de lookup.

---

### Paiement

|Attribut|Type|Remarque|
|---|---|---|
|Id_Paiement|UUID/INT|PK|
|montant_total|DECIMAL|>= 0|
|date_paiement|DATETIME|Si payé|
|date_creation|DATETIME|Auto|
|Id_Mode_Paiement|FK|Référence Mode_Paiement|
|Id_Statut_Paiement|FK|Référence Statut_Paiement|
|Id_Intervention|FK|Référence Intervention (unique)|

---

### Mode_Paiement

|Attribut|Type|Remarque|
|---|---|---|
|Id_Mode_Paiement|UUID/INT|PK|
|libelle|VARCHAR|Ex: Espèce, Carte, Chèque|

---

### Statut_Paiement

|Attribut|Type|Remarque|
|---|---|---|
|Id_Statut_Paiement|UUID/INT|PK|
|libelle|VARCHAR|Ex: En_Attente, Payé|

---

### Photo

|Attribut|Type|Remarque|
|---|---|---|
|Id_Photo|UUID/INT|PK|
|url_photo|VARCHAR||
|date_upload|DATETIME|Auto|
|contexte|**Enum**|`ContextePhoto` (`client` \| `technicien`) — voir remarque ci-dessous, pas de FK|
|Id_Intervention|FK|Référence Intervention|

---

### ContextePhoto

> **Correction :** implémenté comme **enum Prisma** (pas de table), valeurs `client` | `technicien` — discrimine **qui** a uploadé la photo (client à la réservation, technicien à la clôture), pas un avant/après temporel.

---

### Produit

|Attribut|Type|Remarque|
|---|---|---|
|Id_Produit|UUID/INT|PK|
|nom_produit|VARCHAR|Unique|
|description|TEXT||
|is_active|BOOLEAN|Défaut true|
|date_creation|DATETIME|Auto|

---

### Prix_Produit (Historique_Prix_Produit)

|Attribut|Type|Remarque|
|---|---|---|
|Id_Historique_Prix_Produit|UUID/INT|PK|
|date_debut|DATETIME||
|date_fin|DATETIME|Null si actif|
|prix|DECIMAL|>= 0|
|Id_Produit|FK|Référence Produit|

---

### Ligne_commande

|Attribut|Type|Remarque|
|---|---|---|
|Id_Ligne_commande|UUID/INT|PK|
|Quantite|INT|>= 1|
|Id_Historique_Prix_Produit|FK|Prix produit figé à la commande|
|Id_Intervention|FK|Référence Intervention|

---

## Associations / Relations

|Association|Entités concernées|Cardinalités|Attributs|
|---|---|---|---|
|Peut_se_situer|Utilisateur ↔ Adresse|1,n — 1,n|titre_description, adresse_principal, isValide, date_creation, date_invalidité|
|Technicien_Est_affecté (TechnicienZone)|Utilisateur ↔ Zone|0,n — 0,n|date_affectation|

> **Corrections (2026-06-05 et suivants) :** `adresse_facturation` retiré de `Peut_se_situer` — paiement physique uniquement, aucun usage dans le MVP. `titre_description` ajouté (nullable) — libellé libre affiché dans le dropdown de sélection d'adresse. `isActif` et `date_modification` retirés de `Technicien_Est_affecté` — seul `date_affectation` existe réellement sur `TechnicienZone` (PK composite `[technicien_id, zone_id]`). L'association `Asso_21` (Cycle ↔ Marque) a été supprimée — voir la FK directe `Id_Marque` sur `Cycle` ci-dessus.

---

## Règles métier importantes

- **Zone et adresse** : Une zone est définie par un polygone (liste ordonnée de points GPS via `Zone_Point`). La vérification qu'une adresse d'intervention appartient à une zone se fait **côté backend**, via un algorithme Ray Casting maison (`CheckZoneUseCase`) — pas via l'API Google Maps (voir correction ci-dessus). L'admin dessine les zones visuellement via Google Maps JavaScript API (ça, c'est toujours exact — seule la vérification d'appartenance est backend).
- **Créneau** : Représente une plage de disponibilité définie par l'admin. Un créneau = une intervention possible. `is_disponible` passe à `false` à la réservation.
- **Prix historisés** : L'Intervention référence `Prix_Forfait` (pas Forfait directement) pour figer le prix au moment de la réservation. Même logique pour Ligne_commande → Prix_Produit.
- **Technicien** : Identifié via `Utilisateur.Id_Role`. L'affectation à une zone est gérée par la table d'association `Technicien_Est_affecté`.
- **Adresse d'intervention** : Figée dans Intervention via `Id_Adresse` au moment de la réservation.

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
