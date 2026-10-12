# CLAUDE.md — HomeCycl'Home

Ce fichier est lu automatiquement par Claude Code à chaque session.
Il définit le contexte global du projet, les conventions et la posture de travail.
Les fichiers `Frontend/CLAUDE.md` et `Backend/CLAUDE.md` complètent ce fichier
avec les spécificités de chaque couche.

---

## 1. Contexte du projet

**Client :** LeCycleLyonnais
**Application :** HomeCycl'Home — réservation d'interventions de réparation et
entretien de vélos à domicile.
**Cadre :** Projet de certification CDA (Concepteur Développeur d'Applications).
Les livrables doivent satisfaire des exigences fonctionnelles ET pédagogiques.

**Trois rôles utilisateurs :**
- `client` — réserve une intervention
- `technicien` — réalise et clôture l'intervention
- `admin` — configure et supervise l'activité

**Objectif MVP :** permettre le cycle complet →
Réservation → Réalisation → Paiement → Clôture

---

## 2. Stack technique (choix définitifs — ne pas remettre en question)

| Couche | Technologie |
|---|---|
| Frontend | React + Vite + TypeScript |
| Style | SCSS modules (pages client) + Tailwind/shadcn-ui (panneau admin uniquement) |
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Base de données | PostgreSQL |
| Auth | JWT + Refresh Token + RBAC |
| Géolocalisation | Google Maps Platform (Geocoding + Autocomplete) |
| Calendrier | FullCalendar (version gratuite) |
| Tests | Jest (TDD, backend uniquement) — Supertest installé mais aucun test d'intégration écrit à ce jour, aucun test frontend |
| CI/CD | GitHub Actions |
| Conteneurisation | Docker + Docker Compose (staging + production — pas de conteneurisation en développement local) |
| Registry | GitHub Container Registry (ghcr.io/yannou64) |

---

## 3. Architecture logicielle

**Pattern retenu : Clean Architecture pragmatique adaptée à NestJS.**

Séparation stricte entre :
- Domaine métier (entités, règles)
- Couche application (use cases)
- Infrastructure (Prisma, HTTP, externe)

**Architecture découplée frontend / backend via API REST.**
Ne jamais mélanger logique métier et logique d'affichage.

---

## 4. Infrastructure déployée

- **VPS Linux Ubuntu** avec Nginx hôte + Certbot (SSL Let's Encrypt)
- **Production :** `homecyclhome.yannickbiot.fr` → port 8081
- **Staging :** `staging.homecyclhome.yannickbiot.fr` → port 8080
- Deux stacks Docker Compose isolées (réseaux distincts)
- Chaque stack : Nginx interne + Frontend + Backend + PostgreSQL
- Le VPS n'exécute que des images Docker — aucun code source sur le serveur

**Règle critique Docker + UFW :**
Toujours binder les ports sur `127.0.0.1` pour éviter que Docker bypasse UFW.

---

## 5. Conventions Git (obligatoires)

**Branches :**
- `main` — production (protégée)
- `dev` — staging / intégration
- `feature/*` — développement d'une fonctionnalité

**Workflow :** `feature/*` → PR → `dev` → PR → `main`

**Commits (Conventional Commits, enforced par Husky + Commitlint) :**
```
feat:     nouvelle fonctionnalité
fix:      correction de bug
refactor: amélioration sans changement fonctionnel
docs:     documentation
test:     ajout ou modification de tests
ci:       pipeline CI/CD
style:    formatage, pas de changement logique
```

Ne jamais proposer un message de commit non conforme à cette convention.

---

## 6. Stratégie de tests (TDD)

- **Approche TDD** : écrire les tests avant le code sur les règles métier critiques
- **Jest** pour les tests unitaires
- **Supertest** pour les tests d'intégration API
- Priorités de test : gestion des créneaux, affectation des zones, contrôle des rôles
- Les tests s'exécutent automatiquement dans la pipeline GitHub Actions
- Un échec bloque le déploiement

---

## 7. Domaine métier — entités clés

Les entités principales du modèle de données (implémentées, sauf mention contraire) :

`Utilisateur` (rôle en enum) · `Adresse` · `Zone` · `ZonePoint` · `Cycle` · `Marque` · `TypeCycle`
`Forfait` · `HistoriquePrixForfait` · `TechnicienZone` · `ModelePlanification` · `PauseRecurrente`
`Indisponibilite` · `Creneau` · `Intervention` · `Photo` (contexte en enum)

**Prévues, non implémentées (Sprint 4 / V2) :** `Paiement` · `Produit` · `LigneCommande` · `HistoriquePrixProduit`
— voir `metier.md` dans le wiki (section 10) pour le détail.

**Règles métier critiques :**
- Un créneau est lié à une zone géographique et, via un modèle de planification, à un technicien
- L'adresse client est validée via Google Maps puis vérifiée contre les zones actives (algorithme Ray Casting côté backend, pas l'API Google Maps)
- La durée d'une intervention est déterminée par le forfait sélectionné
- Un créneau devient `is_disponible = false` dès qu'une intervention est créée
- Le paiement est physique — aucune donnée bancaire n'est stockée

---

## 8. Parcours client (flux principal)

1. Saisie adresse → validation Google Maps
2. Vérification zone couverte
3. Informations cycle (marque, type)
4. Sélection forfait
5. Sélection créneau disponible
6. Demande d'intervention → vérification authentification
7. Si non authentifié → création de compte
8. Confirmation → intervention créée, créneau marqué indisponible

---

## 9. Design system (Frontend)

**Identité visuelle HomeCycl'Home :**
- Couleur principale : Orange vif (header, CTA)
- Couleur secondaire : Brun/Mocha foncé `#4F3B30` (footer, textes)
- Background : Mint off-white `#F4FBF5`
- Bloc adresse : fond vert menthe clair

**Typographie :**
- `Grand Hotel` — hero uniquement (script élégant)
- `Nunito` — tout le reste

**Échelle typographique mobile :**
- Hero : 28–32px
- H1 : 22–24px
- H2 : 18–20px
- H3/body : 16px min
- Labels : 12px
- Captions : 11px min

**Header (état non authentifié) :** logo gauche + "Connexion" + "S'inscrire" droite
**Header mobile :** hamburger menu → drawer orange avec navigation complète
**Footer :** fond brun foncé, liens légaux (Mentions légales, CGU, Confidentialité)
+ copyright LeCycleLyonnais

---

## 10. Wiki projet

La mémoire vivante du projet est maintenue dans un vault Obsidian externe, source de
vérité consultée pendant le travail (édition directe par Yannick, et par les outils :
hook post-commit, skill `/fin-session`) :

```
/Users/yannickbiot/Documents/Mini Brain/30 Projets/HomeCycl'Home
```

`docs/wiki/` dans le repo est une copie périodique (versionnée dans Git) de ce vault,
utile comme preuve de documentation pour la certification CDA — pas la référence à
jour en cours de session.

Consulter ces fichiers (chemins relatifs au vault) pour le contexte détaillé :

| Fichier | Contenu |
|---|---|
| `index.md` | Vue d'ensemble et navigation |
| `stack.md` | Justification des choix techniques |
| `architecture.md` | Structure des dossiers, modules NestJS |
| `metier.md` | Entités, règles métier, MCD/MLD |
| `Modèle Conceptuel de Données.md` | MCD complet — entités, attributs, associations |
| `sprint-actuel.md` | État du sprint en cours |
| `log.md` | Journal des décisions (append-only) |
| `ia.md` | Configuration IA — CLAUDE.md, wiki, sous-agents, MCP Figma |
| `01 - features/<nom>/index.md` | Fiche détaillée par feature — fichiers, endpoints, entités |

---

## 11. Posture de travail

**Yannick est étudiant en CDA — adopter systématiquement une posture pédagogique :**
- Expliquer le concept ou le principe AVANT de proposer du code
- Commenter le code de manière détaillée et inline
- Proposer des alternatives quand elles existent, avec les compromis
- Ne jamais générer du code sans s'assurer que la logique est comprise
- Réponses courtes et synthétiques — Yannick pose des questions de suivi

**Autonomie créative :**
Yannick conserve volontairement sa propre créativité sur l'UI/UX et le design.
L'IA est un outil d'assistance et de scaffolding, pas de génération complète.
Ne pas surcharger avec des suggestions visuelles non demandées.

**Rappel de fin de session :**
Yannick se décrit "tête en l'air" — après un développement significatif (nouvelle feature
backend ou frontend créée, refactor structurant, ou session ayant touché plus de 10 fichiers),
proposer explicitement de lancer le skill `/fin-session` (audit `CLAUDE.md`/wiki + mise à jour
du sprint). Ne jamais le lancer soi-même sans confirmation — proposer, pas agir.

**Langue :** toujours répondre en français.