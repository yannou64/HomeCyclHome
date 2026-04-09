# Métier — HomeCycl'Home

Référence des entités, règles métier et contraintes du domaine.
Consulter ce fichier avant d'implémenter toute logique liée aux données.

---

## Entités principales

| Entité | Rôle |
|---|---|
| `Utilisateur` | Compte applicatif — client, technicien ou admin |
| `Role` | Rôle associé à un utilisateur |
| `Adresse` | Adresse d'intervention validée via Google Maps |
| `Zone` | Secteur géographique couvert (centre + rayon en km) |
| `Cycle` | Vélo appartenant à un client |
| `TypeCycle` | Catégorie de vélo (VAE, Route, VTT…) |
| `Forfait` | Prestation proposée avec durée estimée |
| `HistoriquePrixForfait` | Historique des prix d'un forfait (date début/fin) |
| `Creneau` | Plage horaire disponible dans une zone |
| `Intervention` | Rendez-vous créé suite à une réservation |
| `Photo` | Photo avant/après déposée sur une intervention |
| `Paiement` | Déclaration de paiement physique d'une intervention |
| `Produit` | Article additionnel proposable (V2) |
| `LigneCommande` | Produit ajouté à une intervention |
| `HistoriquePrixProduit` | Historique des prix d'un produit |

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
- Une zone est définie par un centre (latitude/longitude) et un rayon en km
- Un technicien peut être affecté à plusieurs zones
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
| `Intervention.date_prevue` | >= date du jour |
| `Intervention.duree_minutes` | Issue du forfait, non modifiable |
| `Creneau.date_fin` | > date_debut |
| `Zone.rayon_km` | > 0 |
| `Paiement` | Unique par intervention |

---

## Relations clés

- Un `Utilisateur` (client) possède plusieurs `Cycle`
- Un `Utilisateur` (client) habite à une `Adresse`
- Un `Utilisateur` (technicien) est affecté à une ou plusieurs `Zone`
- Une `Zone` possède plusieurs `Creneau`
- Un `Creneau` est planifié pour une seule `Intervention`
- Une `Intervention` est liée à un `Client`, un `Technicien`, un `Cycle`,
  une `Adresse`, un `Forfait` et un `Creneau`
- Une `Intervention` peut avoir plusieurs `Photo` et une `LigneCommande`
- Une `Intervention` a au plus un `Paiement`

---

## Ressources

- MCD complet → `docs/annexes/Livrable_HomeCyclehome.pdf` Annexe C
- MLD complet → `docs/annexes/Livrable_HomeCyclehome.pdf` Annexe D
- Dictionnaire de données complet → `docs/annexes/Livrable_HomeCyclehome.pdf` Annexe B