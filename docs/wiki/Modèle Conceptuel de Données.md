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
|Id_Role|FK|Référence Role|

---

### Role

|Attribut|Type|Remarque|
|---|---|---|
|Id_Role|UUID/INT|PK|
|libelle|VARCHAR|Ex: client, technicien, admin|

---

### Adresse

|Attribut|Type|Remarque|
|---|---|---|
|Id_Adresse|UUID/INT|PK|
|Numero|VARCHAR||
|rue|VARCHAR||
|google_id|VARCHAR|Identifiant Google Places|
|latitude|DECIMAL|Obligatoire|
|longitude|DECIMAL|Obligatoire|
|Id_Ville|FK|Référence Ville|

---

### Ville

|Attribut|Type|Remarque|
|---|---|---|
|Id_Ville|UUID/INT|PK|
|cp|VARCHAR|Code postal|
|ville|VARCHAR||
|Id_Pays|FK|Référence Pays|

---

### Pays

|Attribut|Type|Remarque|
|---|---|---|
|Id_Pays|UUID/INT|PK|
|libelle|VARCHAR||

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
|date_creation|DATETIME|Auto|
|Id_Utilisateur|FK|Propriétaire (client)|
|Id_Type_cycle|FK|Référence Type_cycle|

> La relation entre Cycle et Marque est une association **Asso_21** (plusieurs marques possibles par cycle, plusieurs cycles par marque).

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

> Une zone est définie par un **polygone** constitué d'une liste ordonnée de points GPS. La vérification qu'une adresse appartient à une zone se fait via `google.maps.geometry.poly.containsLocation()` côté applicatif.

---

### Creneau

|Attribut|Type|Remarque|
|---|---|---|
|Id_Creneau|UUID/INT|PK|
|date_debut|DATETIME||
|date_fin|DATETIME|> date_debut|
|is_disponible|BOOLEAN|Défaut true|
|Id_Zone|FK|Référence Zone|

> Un créneau représente une **plage de disponibilité** définie par l'admin. Sa durée est flexible. Il devient indisponible (is_disponible = false) dès qu'une intervention lui est liée.

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
|Id_Statut|FK|Référence Statut_Intervention|
|Id_Adresse|FK|Adresse d'intervention (figée à la réservation)|
|Id_Creneau|FK|Créneau réservé|
|Id_Technicien|FK|Référence Utilisateur (rôle technicien)|
|Id_Client|FK|Référence Utilisateur (rôle client)|

---

### Statut_Intervention

|Attribut|Type|Remarque|
|---|---|---|
|Id_Statut|UUID/INT|PK|
|libelle|VARCHAR|Ex: Planifiée, Annulée, Terminée|

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
|Id_Contexte_Photo|FK|Référence Contexte_Photo|
|Id_Intervention|FK|Référence Intervention|

---

### Contexte_Photo

|Attribut|Type|Remarque|
|---|---|---|
|Id_Contexte_Photo|UUID/INT|PK|
|libelle|VARCHAR|Ex: Avant, Après|

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
|Peut_se_situer|Utilisateur ↔ Adresse|1,n — 1,n|adresse_principal, isValide, adresse_facturation, date_creation, date_invalidité|
|Technicien_Est_affecté|Utilisateur ↔ Zone|0,n — 0,n|date_affectation, isActif, date_modification|
|Asso_21|Cycle ↔ Marque|0,n — 0,n|—|

---

## Règles métier importantes

- **Zone et adresse** : Une zone est définie par un polygone (liste ordonnée de points GPS via `Zone_Point`). La vérification qu'une adresse d'intervention appartient à une zone se fait via `google.maps.geometry.poly.containsLocation()` côté applicatif. L'admin dessine les zones visuellement via Google Maps JavaScript API.
- **Créneau** : Représente une plage de disponibilité définie par l'admin. Un créneau = une intervention possible. `is_disponible` passe à `false` à la réservation.
- **Prix historisés** : L'Intervention référence `Prix_Forfait` (pas Forfait directement) pour figer le prix au moment de la réservation. Même logique pour Ligne_commande → Prix_Produit.
- **Technicien** : Identifié via `Utilisateur.Id_Role`. L'affectation à une zone est gérée par la table d'association `Technicien_Est_affecté`.
- **Adresse d'intervention** : Figée dans Intervention via `Id_Adresse` au moment de la réservation.