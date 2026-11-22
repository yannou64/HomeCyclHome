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
- Dans le vault, Claude n'écrit que dans *Écarts* et *Journal*, avec une seule
  exception dans les notes d'US : la case d'un critère testé et le repère
  `*(manuel)*` (décision du 22/11/2026). Règles et limites : section « Cases et
  repères » de `Assistant IA - Lisez-moi`, qui fait foi.
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
  `it` commence par le numéro `CAnn` **écrit dans la note** (stable, jamais
  recompté : les trous sont normaux) et finit par l'étiquette de règle du critère
  entre crochets. Règle complète : `Assistant IA - Lisez-moi`, « Comment
  travailler ». Le script `verifier-ca.py` du vault contrôle la correspondance.
  ```ts
  describe("US-01 Choisir la couleur d'une zone 2.0", () => {
      it('CA07 — refuse un nom hors énumération [RG2]', async () => { /* … */ });
  });
  ```
  La couverture se lit dans les noms de tests. Claude coche la case d'un critère
  testé seulement après une exécution verte et le feu vert de `verifier-ca.py`
  (dans `/terminer-uc`) ; jamais une case manuelle ni une case de pilotage.
- **Critère vérifié à la main.** Un critère d'affichage, que rien ne teste
  automatiquement (pas de tests frontend), porte le repère `*(manuel)*` dans la
  note, juste avant son étiquette de règle. Il n'a pas de test `CAnn` ; sa case se
  coche après vérification à l'écran, par Yannick seul, et `verifier-ca.py` le
  reconnaît. Claude pose le repère pendant `/demarrer-uc`, sur les critères
  d'affichage seulement, et le justifie dans le Journal. Critère douteux
  (affichage ou règle ?) : repère manuel, choix de Yannick du 22/11/2026.
  Conventions : `Assistant IA - Lisez-moi` (« Cases et repères ») et
  `Assistant IA - Critères vérifiés à la main`.
- **Audit aux points de contrôle** (C1, C2, C3, fin de V2) : `/audit-alignement`.

---

## 4. Workflow — préparer par cas d'utilisation, livrer par user story

Les US d'un cas d'utilisation partagent ses règles de gestion, son API, son
repository et son écran : on les prépare ensemble, une fois. On les livre une par
une. La traçabilité reste par US (`describe`, empreinte).

| Étape | Qui | Outil |
|---|---|---|
| 1. Lire la spec du cas d'utilisation et de ses US restantes : un plan de tests `CA<n>` par US, conception commune (API, repository, écran, ordre de livraison), écarts | Claude | `/demarrer-uc <cas d'utilisation>` |
| 2. Valider plans de tests, conception et écarts | Yannick | — |
| 3. Pour chaque US, dans l'ordre : RED, GREEN puis refactor, proposition de commit | Claude | — |
| 4. Commiter chaque US | Yannick | — |
| 5. Couverture par US, définition de fini, cases des critères testés, une empreinte par US, entrée du Journal | Claude | `/terminer-uc <cas d'utilisation>` (ou `<US>` pour en clore une seule) |
| 6. Vérifier à l'écran et cocher les critères manuels, push, PR vers `dev` | Yannick | — |

Rappel : Yannick se décrit « tête en l'air ». Quand la dernière US du lot est verte,
proposer explicitement `/terminer-uc` — proposer, ne jamais le lancer soi-même.

---

## 5. Stack technique (choix définitifs — ne pas remettre en question)

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Style | SCSS Modules (tous les composants) + shadcn-ui stylé en SCSS (panneau admin) ; Tailwind v4 uniquement à l'intérieur des composants shadcn |
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
- **Unitaires (Jest)** : règles pures de `shared/domain/` et logique des use cases,
  avec un repository simulé. Rapides, mais aveugles aux contraintes de la base.
- **Intégration (Supertest + PostgreSQL de test)** : tout ce qu'un simulacre ne peut
  pas prouver — transactions, écritures conditionnelles et concurrence, clés
  étrangères, RBAC de bout en bout. Banc en place (base `homecycl_test`, garde-fou,
  lancé par la CI) : mise en place et utilitaires dans `Backend/CLAUDE.md`, section Tests.
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
