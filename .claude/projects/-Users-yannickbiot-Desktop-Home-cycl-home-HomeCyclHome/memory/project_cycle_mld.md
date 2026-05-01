---
name: Modèle Cycle — MLD v2
description: Structure réelle du modèle Cycle selon le MLD mis à jour (avril 2026)
type: project
---

Un cycle appartient à un seul utilisateur, a une seule marque et un seul type de cycle.
Relations toutes n-1 (FK directes dans la table Cycle), pas de table de jointure.

Champs du modèle `Cycle` :
- `id` (UUID, PK)
- `particularite` (String, optionnel — notes libres sur le vélo)
- `date_creation` (DateTime, auto)
- `date_maj` (DateTime, auto)
- `utilisateur_id` (FK → Utilisateur)
- `marque_id` (FK → Marque)
- `type_cycle_id` (FK → TypeCycle)

**Why:** Le MLD initial (metier.md) indiquait une relation n-n Cycle ↔ Marque via `Asso_21`.
Le MLD v2 (fourni par Yannick le 2026-04-28) montre `Id_Marque` directement dans `Cycle_` → relation n-1.

**How to apply:** Ne pas créer de table de jointure pour Cycle-Marque. Schéma Prisma simple avec 3 FK directes.
