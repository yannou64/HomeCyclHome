# Métier — HomeCycl'Home

Référence des entités, règles métier et contraintes du domaine.
Consulter ce fichier avant d'implémenter toute logique liée aux données.

---

## Entités principales

| Entité | Rôle |
|---|---|
| `Utilisateur` | Compte applicatif — client, technicien ou admin |
| `Role` | Rôle associé à un utilisateur (`client`, `technicien`, `admin`) |
| `Adresse` | Adresse d'intervention validée via Google Maps (lat/lng + google_id) |
| `Ville` | Ville liée à une adresse (code postal, nom) |
| `Pays` | Pays lié à une ville |
| `Marque` | Marque d'un vélo (relation n-n avec Cycle) |
| `Zone` | Secteur géographique couvert — défini par un polygone GPS |
| `Zone_Point` | Point GPS ordonné constituant le polygone d'une zone |
| `Cycle` | Vélo appartenant à un client |
| `Type_cycle` | Catégorie de vélo (VAE, Route, VTT…) |
| `Forfait` | Prestation proposée avec durée estimée |
| `Prix_Forfait` | Historique des prix d'un forfait (date début/fin) |
| `Creneau` | Plage horaire disponible dans une zone |
| `Statut_Intervention` | Référentiel des statuts (`Planifiée`, `Annulée`, `Terminée`) |
| `Intervention` | Rendez-vous créé suite à une réservation |
| `Photo` | Photo avant/après déposée sur une intervention |
| `Contexte_Photo` | Référentiel du contexte photo (`Avant`, `Après`) |
| `Paiement` | Déclaration de paiement physique d'une intervention |
| `Mode_Paiement` | Référentiel des modes (`Espèce`, `Carte`, `Chèque`) |
| `Statut_Paiement` | Référentiel des statuts (`En_Attente`, `Payé`) |
| `Produit` | Article additionnel proposable (V2) |
| `Ligne_commande` | Produit ajouté à une intervention |
| `Prix_Produit` | Historique des prix d'un produit |

---

## Règles métier critiques

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
- La vérification qu'une adresse est dans une zone se fait via `google.maps.geometry.poly.containsLocation()` côté applicatif
- L'admin dessine les zones visuellement via Google Maps JavaScript API
- Un technicien peut être affecté à plusieurs zones (`Technicien_Est_affecté`)
- Une zone peut avoir plusieurs techniciens

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

1. Saisie adresse → validation Google Maps
2. Vérification zone couverte par le service
3. Renseignement des informations du cycle (marque, type)
4. Sélection du forfait
5. Sélection du créneau disponible
6. Vérification authentification → création de compte si nécessaire
7. Confirmation → intervention créée + créneau marqué indisponible

---

## Contraintes de données importantes

| Champ | Contrainte |
|---|---|
| `Utilisateur.email` | Unique, format email |
| `Utilisateur.password_hash` | Jamais exposé en réponse API |
| `Adresse.latitude / longitude` | Obligatoires — issus du géocodage Google |
| `Adresse.google_id` | Identifiant Google Places |
| `Intervention.date_prevue` | >= date du jour |
| `Intervention.duree_minutes` | Issue du forfait, non modifiable |
| `Creneau.date_fin` | > date_debut |
| `Zone_Point.ordre` | Obligatoire pour reconstituer le polygone dans l'ordre |
| `Forfait.nom_forfait` | Unique |
| `Zone.nom_zone` | Unique |
| `Paiement` | Unique par intervention |

---

## Relations clés

- Un `Utilisateur` possède un `Role` (client, technicien, admin)
- Un `Utilisateur` (client) possède plusieurs `Cycle`
- Un `Utilisateur` peut être lié à plusieurs `Adresse` (n-n via `Peut_se_situer`, avec `adresse_principale`, `isValide`…)
- Un `Utilisateur` (technicien) est affecté à une ou plusieurs `Zone` (n-n via `Technicien_Est_affecté`)
- Une `Adresse` est rattachée à une `Ville`, elle-même rattachée à un `Pays`
- Un `Cycle` est lié à un `Type_cycle` et à une ou plusieurs `Marque` (n-n via `Asso_21`)
- Une `Zone` est définie par plusieurs `Zone_Point` (polygone ordonné)
- Une `Zone` possède plusieurs `Creneau`
- Un `Creneau` est planifié pour une seule `Intervention`
- Une `Intervention` est liée à un client (`Id_Client`), un technicien (`Id_Technicien`),
  un `Prix_Forfait` (prix figé), une `Adresse` (figée), un `Creneau` et un `Statut_Intervention`
- Une `Intervention` peut avoir plusieurs `Photo` (avec `Contexte_Photo`) et plusieurs `Ligne_commande`
- Une `Intervention` a au plus un `Paiement` (avec `Mode_Paiement` et `Statut_Paiement`)

---

## Ressources

- MCD détaillé (entités + attributs + associations) → [[Modèle Conceptuel de Données.md]]
- Cahier des charges fonctionnel initial → `docs/annexes/CDC HomeCycle'home.pdf`
- Livrable complet (MCD, MLD, dictionnaire) → `docs/annexes/Livrable HomeCycle'home.pdf`