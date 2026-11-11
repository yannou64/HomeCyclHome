# CLAUDE.md — HomeCycl'Home

Lu automatiquement par Claude Code à chaque session. `Frontend/CLAUDE.md` et
`Backend/CLAUDE.md` le complètent.

**Ce fichier dit *comment* on travaille. *Ce qu'on construit* est spécifié dans le
vault de gestion de projet (section 2) — ce fichier ne le recopie jamais.**

---

## 1. Contexte

- **Client :** LeCycleLyonnais — **Application :** HomeCycl'Home, réservation
  d'interventions d'entretien de vélos à domicile.
- **Cadre :** projet de certification CDA. Les livrables doivent satisfaire des
  exigences fonctionnelles ET pédagogiques.
- **Rôles :** `client` (réserve) · `technicien` (réalise) · `admin` (configure, supervise).
- **Versions :**
  - **V1** livrée et figée (tag git `homecyclhome-v1`).
  - **V2** en cours : refonte du planning et des interventions, espace technicien,
    alertes. Périmètre, calendrier, ligne de coupe et changements de données :
    note `Refonte 2.0` du vault.

---

## 2. Sources de vérité

**Vault de gestion de projet** (Obsidian, hors dépôt) :
```
/Users/yannickbiot/Mini Brain/30 Projets/HomeCycl'Home
```
Dossier de la V2 : `3. Développement - Suivi et contrôle/V2/`

**Avant tout développement, lire `V2/Assistant IA/Assistant IA - Lisez-moi.md`** :
ordre de lecture de la spec, ce qui fait foi, définition de fini d'une user story.
Ses règles s'appliquent telles quelles et ne sont pas répétées ici.

**Une information, un seul endroit :**

| Type d'information | Seul endroit | Qui écrit |
|---|---|---|
| Règles de gestion, critères, séquences, données | Spec du vault (`V2/…`, `Refonte 2.0`, `Assistant IA - Glossaire`) | Yannick |
| Plan : calendrier, périmètre, ligne de coupe | `Refonte 2.0` + Roadmap 2.0 | Yannick |
| Questions de spec à trancher | `Assistant IA - Écarts d'implémentation` | Claude (constat), Yannick (décision) |
| Réalisé, décisions techniques, déviations au plan | `Assistant IA - Journal de développement` | Claude |
| Conventions de code, architecture, façon de tester | Les `CLAUDE.md` du dépôt | Claude, validé par Yannick |
| Faits déductibles du code (compteurs, listes de fichiers, endpoints) | **Nulle part** — recalculés à la demande | — |

Conséquences :
- Ne jamais recopier dans le dépôt (CLAUDE.md, README, commentaires de doc) une règle
  métier, un critère ou une date du plan : renvoyer à la note par son nom.
- Dans le vault, Claude n'écrit que dans *Écarts* et *Journal*. Il ne coche jamais
  une case `- [ ]`.
- Le dossier `V1/` du vault est en lecture seule. Le vault « Brouillon » de la V1 a
  été supprimé le 11/11/2026 : toute référence à `sprint-actuel.md`, `log.md` ou
  `metier.md` est obsolète.

---

## 3. Spec et réalité ne se contredisent jamais

- **Aucun écart silencieux.** Si l'implémentation impose de s'écarter de la spec
  (règle impossible, contradiction entre notes, choix technique qui change une
  règle) : ajouter une ligne dans *Écarts*, s'arrêter sur ce point, attendre la
  décision. Yannick corrige la spec et relance `export-ia.py`. Le code suit la spec
  corrigée. Un critère modifié pendant une US en cours suit le même chemin.
- **Traçabilité critère → test.** Le `describe` porte le nom exact de l'US, chaque
  `it` commence par `CA<n>` (rang du critère dans la note, sur deux chiffres) :
  ```ts
  describe("US-01 Choisir la couleur d'une zone 2.0", () => {
      it('CA07 — refuse un nom hors énumération', async () => { /* … */ });
  });
  ```
  La couverture se lit dans les noms de tests ; Yannick coche les cases à partir
  du rapport de `/terminer-us`.
- **Audit aux points de contrôle** (C1, C2, C3, fin de V2) : `/audit-alignement`.

---

## 4. Workflow — une user story à la fois

| Étape | Qui | Outil |
|---|---|---|
| 1. Lire la spec de l'US, produire le plan de tests `CA<n>`, signaler les écarts | Claude | `/demarrer-us <US>` |
| 2. Valider le plan de tests | Yannick | — |
| 3. RED : écrire les tests, les voir échouer | Claude | — |
| 4. GREEN puis refactor : implémenter jusqu'au vert | Claude | — |
| 5. Vérifier la définition de fini, rapport de couverture, entrée du Journal | Claude | `/terminer-us <US>` |
| 6. Cocher les critères, commit, PR vers `dev` | Yannick | — |

Rappel : Yannick se décrit « tête en l'air ». Quand une US semble terminée, proposer
explicitement `/terminer-us` — proposer, ne jamais le lancer soi-même.

---

## 5. Stack technique (choix définitifs — ne pas remettre en question)

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Style | SCSS Modules (pages client et technicien) + Tailwind v4 / shadcn-ui (panneau admin uniquement) |
| Backend | NestJS + TypeScript |
| ORM / BDD | Prisma + PostgreSQL |
| Auth | JWT + refresh token en cookies `HttpOnly` + RBAC |
| Géolocalisation | Google Maps Platform (Geocoding + Autocomplete) — la vérification de zone est un ray casting côté backend |
| Calendrier | FullCalendar (version gratuite) |
| Stockage photos | AWS S3 (transit par le backend) |
| Tests | Jest (unitaires) + Supertest sur PostgreSQL réel (intégration) — backend uniquement |
| CI/CD | GitHub Actions → GitHub Container Registry (`ghcr.io/yannou64`) → VPS |
| Conteneurs | Docker Compose en staging et production (pas en développement local) |

---

## 6. Architecture

- **Clean Architecture pragmatique adaptée à NestJS** : domaine métier, use cases,
  infrastructure (Prisma, HTTP, services externes) strictement séparés.
- **Un use case par opération métier**, un fichier par use case.
- **Frontend et backend découplés** via une API REST. Jamais de logique métier dans
  l'affichage.

---

## 7. Git (conventions obligatoires)

- **Branches :** `main` (production) · `dev` (staging, intégration) · branches de
  travail préfixées par leur type : `feat/`, `fix/`, `refactor/`, `ci/`, `docs/`,
  `test/`. Ne jamais créer une branche nommée seulement `feat` ou `refactor` : elle
  bloque le préfixe.
- **Granularité :** une branche par **sujet global** (un lot de travail, une épique),
  pas une par petite modification. Avant d'en créer une, vérifier si la branche en
  cours couvre déjà le sujet. Y enchaîner plusieurs commits, chacun décrivant une
  action précise.
- **Push et PR : Yannick seul.** Claude commite, mais ne pousse jamais et n'ouvre
  jamais de PR ; il signale les commits prêts.
- **Flux :** branche de travail → PR → `dev` → PR → `main`. Imposé par GitHub : le
  ruleset « Protection dev et main » refuse sur ces deux branches tout push direct,
  tout force push et toute suppression, et n'accepte une PR que si les checks
  `lint-frontend`, `lint-backend` et `test-backend` passent. Aucune exception, y
  compris pour l'administrateur.
- **CI :** une branche de travail est testée **par sa PR** (sur le résultat de la
  fusion avec la cible), pas par ses push. Pour un retour avant la fin du travail,
  ouvrir la PR en brouillon. La fusion dans `dev` déploie le staging, dans `main` la
  production.
- **Commits :** Conventional Commits, imposés par Husky + Commitlint
  (`feat`, `fix`, `refactor`, `docs`, `test`, `ci`, `style`). Le hook `pre-commit`
  lance le lint frontend et backend, puis les tests unitaires du backend. Ne jamais
  proposer un message non conforme, ni contourner un hook (`--no-verify`).

---

## 8. Stratégie de tests

- **TDD** : un test par critère d'acceptation, écrit avant le code.
- **Unitaires (Jest)** : règles pures du `domain/` et logique des use cases, avec un
  repository simulé. Rapides, mais aveugles aux contraintes de la base.
- **Intégration (Supertest + PostgreSQL de test)** : tout ce qu'un simulacre ne peut
  pas prouver — transactions, écritures conditionnelles et concurrence, clés
  étrangères, RBAC de bout en bout. **Première brique de la V2, en cours de mise en
  place** : à construire avec Yannick avant les US.
- **Frontend** : aucun test (décision ouverte, voir le Journal).
- Les tests unitaires tournent avant chaque commit (`pre-commit`) et dans la CI de
  chaque PR ; un échec bloque le déploiement.

Détails d'implémentation : `Backend/CLAUDE.md`, section Tests.

---

## 9. Infrastructure déployée

- **VPS Ubuntu** : Nginx hôte + Certbot (SSL Let's Encrypt).
- **Production :** `homecyclhome.yannickbiot.fr` → port 8081 —
  **Staging :** `staging.homecyclhome.yannickbiot.fr` → port 8080.
- Deux stacks Docker Compose isolées (réseaux distincts), chacune avec Nginx interne,
  frontend, backend et PostgreSQL. Le VPS n'exécute que des images : aucun code
  source sur le serveur.
- **Règle critique Docker + UFW :** toujours binder les ports sur `127.0.0.1`.
- **Le dépôt GitHub est public** : aucun identifiant, mot de passe ou clé dans un
  fichier versionné, documentation comprise.

---

## 10. Design system (Frontend)

- Couleur principale : orange vif (header, CTA) · secondaire : brun mocha `#4F3B30`
  (footer, textes) · fond : mint off-white `#F4FBF5` · bloc adresse : vert menthe clair.
- Typographie : `Grand Hotel` (hero uniquement), `Nunito` (tout le reste).
- Échelle mobile : hero 28–32px · H1 22–24px · H2 18–20px · H3/body 16px min ·
  labels 12px · captions 11px min.
- Header non authentifié : logo à gauche, « Connexion » + « S'inscrire » à droite ;
  mobile : hamburger → drawer orange. Footer brun foncé avec liens légaux et
  copyright LeCycleLyonnais.

Valeurs exactes : `Frontend/src/app/styles/_variables.scss`.

---

## 11. Posture de travail

**Yannick est étudiant en CDA — posture pédagogique systématique :**
- Expliquer le concept AVANT de proposer du code.
- Commenter le code de manière détaillée, inline.
- Proposer les alternatives quand elles existent, avec leurs compromis.
- Ne jamais générer du code sans s'assurer que la logique est comprise.
- Réponses courtes et synthétiques — Yannick pose des questions de suivi.

**Autonomie créative :** Yannick garde la main sur l'UI/UX et le design. L'IA
assiste et échafaude, elle ne génère pas tout. Pas de suggestions visuelles non
demandées.

**Langue :** toujours répondre en français.
