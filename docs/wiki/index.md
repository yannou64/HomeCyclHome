# Wiki — HomeCycl'Home

Point d'entrée de la mémoire projet. Consulter ce fichier en premier pour
s'orienter avant toute session de travail.

---

## État du projet

| Élément | Valeur |
|---|---|
| Phase actuelle | Phase 2 — Conception fonctionnelle & technique |
| Sprint en cours | Sprint 0 — Fondations |
| MVP cible | Cycle complet Réservation → Réalisation → Paiement → Clôture |
| Déploiement | ✅ Infrastructure en place (prod + staging) |
| Maquettage | 🔄 En cours (parcours client) |
| Développement | ⏳ Démarre Sprint 1 (Avril) |

---

## Navigation

| Fichier | Contenu |
|---|---|
| `stack.md` | Justification des choix techniques |
| `architecture.md` | Structure des dossiers, modules NestJS, patterns |
| `metier.md` | Entités, règles métier, MCD, dictionnaire de données |
| `sprint-actuel.md` | État et objectifs du sprint en cours |
| `log.md` | Journal chronologique des décisions (append-only) |

---

## Acteurs du système

| Rôle | Responsabilité principale |
|---|---|
| `client` | Réserver et suivre ses interventions |
| `technicien` | Réaliser, documenter et clôturer les interventions |
| `admin` | Configurer zones, forfaits, utilisateurs, planning |

---

## Sprints planifiés

| Sprint | Période | Objectif |
|---|---|---|
| Sprint 0 | Mars | Fondations — DevOps, architecture, maquettage |
| Sprint 1 | Avril | Authentification + gestion des cycles |
| Sprint 2 | Mai | Prestations + zones géographiques |
| Sprint 3 | Juin | Planification + création d'interventions |
| Sprint 4 | Juillet | Suivi, paiement, clôture |
| Livraison | Août | Tests globaux, documentation, soutenance |

---

## Jalons clés

- **J1** fin février — Cadrage validé ✅
- **J2** fin mars — Noyau technique opérationnel ✅
- **J3** fin avril — Authentification + cycles fonctionnels
- **J4** fin mai — Réservation possible
- **J5** fin juin — Cycle complet d'intervention
- **J6** fin juillet — MVP stabilisé
- **J7** août — Livraison finale

---

## Domaines fonctionnels MVP

- Gestion des utilisateurs et authentification
- Gestion des cycles client
- Gestion des prestations (forfaits)
- Gestion des zones géographiques
- Planification des créneaux
- Gestion des interventions
- Exigences légales minimales (CGU, RGPD)

## Hors MVP (V2)

- Gestion des informations de l'entreprise
- Gestion des produits additionnels