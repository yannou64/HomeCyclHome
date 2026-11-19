---
name: demarrer-uc
description: Prépare le développement d'un cas d'utilisation de la V2 — lit une fois sa spec dans le vault (épique, règles de gestion, toutes ses user stories et leurs séquences), produit un plan de tests CA<n> par user story, une conception commune (API, repository, écran, ordre de livraison), signale les écarts, puis s'arrête jusqu'à validation. À lancer par Yannick au début de chaque cas d'utilisation.
argument-hint: <cas d'utilisation, ex. "(Admin) Administrer les modèles de planification 2.0">
allowed-tools: [Read, Grep, Glob, Bash(ls:*), Bash(find:*), Bash(awk:*), Bash(grep:*), Bash(python3:*), Bash(git status:*), Bash(git log:*), Bash(git branch:*)]
disable-model-invocation: true
---

# Démarrer un cas d'utilisation

Cas d'utilisation demandé : **$ARGUMENTS**

**Principe : préparer par cas d'utilisation, livrer par user story.** Les US d'un
même cas d'utilisation partagent ses règles de gestion, son API, son repository et
son écran : on les lit et on les conçoit ensemble, une seule fois. On les livre
ensuite une par une (RED, GREEN, commit). La traçabilité reste par US :
`describe` = nom exact de l'US, une empreinte par US.

Vault de la V2 (lecture seule, sauf la note *Écarts* à l'étape 6 avec accord) :
```
/Users/yannickbiot/Mini Brain/30 Projets/HomeCycl'Home/3. Développement - Suivi et contrôle/V2
```
Dans les commandes ci-dessous, `<V2>` désigne ce dossier, `<Journal>` la note
`<V2>/Assistant IA/Assistant IA - Journal de développement.md`. Toujours entre
guillemets : les chemins contiennent des espaces et des apostrophes.

**Tu n'écris aucun code et aucun test dans ce skill.** Tu prépares, tu expliques,
tu t'arrêtes.

**Économie de lecture.** Lis en entier ce qui sert à raisonner : Lisez-moi, épique,
cas d'utilisation, US. Pour le reste, n'extrais que la partie utile avec les
commandes indiquées. Ne lis jamais en entier l'Index des spécifications ni une note
« Séquences (export IA) ».

## Étape 1 — Situer le cas d'utilisation
1. Lis `Assistant IA/Assistant IA - Lisez-moi.md` si ce n'est pas déjà fait dans la
   session (ordre de lecture, ce qui fait foi, définition de fini).
2. Trouve la note du cas d'utilisation :
   ```bash
   find "<V2>" -name "$ARGUMENTS.md" -not -path "*/Assistant IA/*"
   ```
   Vérifie son frontmatter : `type: use_case`. Son dossier parent est celui de
   l'épique ; chaque dossier contient une note du même nom.
   - **L'argument est une US** (`type: user_story`) : remonte à son cas
     d'utilisation (champ `use_case:` ou dossier parent), dis-le en une ligne et
     continue avec lui.
   - Aucun résultat ou plusieurs : relance avec `-name "*<partie du nom>*"`, liste
     les candidats et demande lequel.
3. Liste ses user stories :
   ```bash
   find "<dossier du cas d'utilisation>" -mindepth 2 -maxdepth 2 -name "US-*.md"
   ```
4. **Écarte les US déjà terminées** : une US est terminée si son nom figure sur un
   titre d'entrée ou une ligne d'empreinte du Journal.
   ```bash
   grep -E '^### |Empreinte' "<Journal>" | grep -F "<nom exact de l'US>"
   ```
   Signale-les en une ligne ; elles ne sont ni relues ni replanifiées. Si toutes
   sont terminées, dis-le et arrête-toi.
5. Avancement, sans lire tout le Journal :
   ```bash
   awk '/^## Avancement/,/^## Entrées/' "<Journal>"
   ```
   Compare avec la ligne du calendrier de `Refonte 2.0.md` qui cite le cas
   d'utilisation (Grep sur son nom). En avance ou en retard : une ligne.
6. Lis `Assistant IA/Assistant IA - Écarts d'implémentation.md` : un écart ouvert
   concerne-t-il ce cas d'utilisation ?

## Étape 2 — Lire la spec, dans cet ordre
1. L'épique (note entière), une fois.
2. Le cas d'utilisation (note entière), une fois : les règles de gestion (RG), y
   compris celles marquées *Sans critère*.
3. Chaque US restante (note entière) : la description et les critères
   d'acceptation. **Reprends le numéro `CAnn` écrit dans la note, tel quel. Ne
   renumérote jamais** : les numéros sont stables et peuvent avoir des trous (un
   critère retiré ne libère pas son numéro). Garde aussi l'étiquette de règle du
   critère : `(RG2)`, `(RG2, RG5)` ou `(—)`.
4. La séquence en texte de chaque US restante, extraite seule. La note s'appelle
   « Séquences (export IA) - <épique> » :
   ```bash
   awk -v t="### <nom exact de l'US>" '$(0)==t{f=1} f&&/^##/&&$(0)!=t{exit} f' \
     "<V2>/Assistant IA/Séquences/Séquences (export IA) - <épique>.md"
   ```
   Ordre des échanges, appels à la base, transactions (dernière ligne du bloc).
5. Si une US touche aux données, la section « Données » de `Refonte 2.0.md`, seule :
   ```bash
   awk '/^## Données/{f=1} /^## Forfaits/{f=0} f' "<V2>/Refonte 2.0.md"
   ```
6. `Assistant IA/Assistant IA - Glossaire.md` seulement si un terme bloque.

## Étape 3 — Confronter au code
Lis d'abord les conventions, explicitement (un `CLAUDE.md` de sous-dossier n'est pas
chargé automatiquement tant qu'aucun fichier du dossier n'a été lu) :
- `Backend/CLAUDE.md`, sections 4 (conventions), 5 (patterns V2) et 8 (tests) ;
- `Frontend/CLAUDE.md`, sections 2, 3, 4 (règles d'interface) et 5, si le cas
  d'utilisation touche le frontend.

Le code de la V1 n'est pas un modèle pour les patterns V2 (écriture conditionnelle,
fuseau) : en cas de différence entre le code existant et `Backend/CLAUDE.md`, c'est
le `CLAUDE.md` qui fait foi.

**Vérifie la branche avant tout développement** (`CLAUDE.md` racine, section 7) :
```bash
git branch --show-current && git status --short && git fetch origin \
  && git log --oneline -1 dev && git log --oneline -1 origin/dev
```
- une branche par cas d'utilisation : la branche courante doit le couvrir ; sinon,
  ou si l'on est sur `dev` ou `main`, propose de créer la branche avant tout code ;
- si `dev` local est en retard sur `origin/dev` (une PR fusionnée entre-temps),
  la nouvelle branche doit partir d'un `dev` à jour :
  `git switch dev && git pull && git switch -c <type>/<sujet>` ;
- des modifications non commitées d'un autre sujet : signale-les, ne les
  déplace pas toi-même.
Propose les commandes, ne les lance pas : la branche est l'affaire de Yannick.

Repère ensuite dans le dépôt ce qui existe déjà pour ce cas d'utilisation : module
(voir « Où ça vit dans le code » dans le Lisez-moi), use cases, repository, schéma
Prisma, composants, fabriques de test, et un éventuel `describe` qui porte déjà le
nom d'une US. Les US déjà terminées du cas d'utilisation sont le point de départ :
ce qu'elles ont posé se réutilise. Pas de lecture exhaustive : juste assez pour
situer le travail.

## Étape 4 — Produire un plan de tests par US
Pour chaque US restante, un tableau titré du **nom exact de l'US** (ce sera le
`describe`), un critère par ligne, avec le numéro et la règle **tels qu'écrits dans
la note** :

| CA | RG | Critère (résumé) | Type | Fichier de test visé |
|---|---|---|---|---|

Choix du type, selon `Backend/CLAUDE.md` section Tests :
- règle pure commune à plusieurs modules → unitaire `shared/domain/` (sinon elle
  reste dans son use case et se teste avec lui) ;
- logique d'un use case → unitaire, repository simulé ;
- transaction, écriture conditionnelle, concurrence, clé étrangère, droit d'accès de
  bout en bout → intégration (`test/*.e2e-spec.ts`), un fichier par US ;
- critère purement visuel (frontend) → « manuel » : vérifié à l'écran, sans
  test. S'il ne porte pas encore le repère `*(manuel)*` dans la note, propose à
  Yannick de l'ajouter avant le développement (convention : `Assistant IA -
  Critères vérifiés à la main`) ; sans repère, `verifier-ca.py` le compterait
  comme « case cochée mais aucun test ».

Les critères qui contiennent un exemple chiffré deviennent des tests tels quels.

## Étape 5 — Conception commune
Une liste courte, **sans code**, de ce que les US partagent :
- **API** : routes à créer ou à réutiliser, DTO d'entrée et de sortie ;
- **repository** : méthodes partagées par plusieurs US (et celles des US terminées
  à réutiliser) ;
- **écran** : composants partagés (un formulaire commun à la création et à la
  modification, par exemple), dans le respect des règles d'interface de
  `Frontend/CLAUDE.md`. **Tout choix d'interface est soumis à Yannick**, jamais
  décidé ;
- **tests** : fabriques à ajouter dans `test/helpers/fabriques.ts` ;
- **ordre de livraison des US**, avec sa raison (dépendance, risque, réutilisation).

## Étape 6 — Signaler les écarts
1. **Contrôle mécanique d'abord** : lance le vérificateur du vault et ne garde que les
   lignes des US restantes.
   ```bash
   python3 "/Users/yannickbiot/Mini Brain/.claude/skills/_shared/cascade/verifier-ca.py" "<V2>" \
     | grep -F -e "<nom de l'US 1>" -e "<nom de l'US 2>"
   ```
   Il signale les numéros CA en doublon ou désordonnés, les étiquettes absentes, les
   RG citées qui n'existent pas, et les RG applicables sans critère. Ne refais pas
   ces contrôles à la main. Aucune ligne = rien à signaler de ce côté.
2. **Puis ce qu'un script ne voit pas** :
   - contradiction entre deux notes (UC, US, séquence, Données), y compris entre
     deux US du même cas d'utilisation ;
   - contradiction entre la spec et une contrainte technique ;
   - critère ambigu ou impossible à tester tel qu'écrit.

Une seule liste pour tout le cas d'utilisation. Pour chaque écart, rédige une
**proposition de ligne** pour *Écarts* (date, note concernée, constat, proposition,
décision vide). **Ne l'écris dans la note qu'après accord de Yannick.** Ne tranche
jamais toi-même.

## Étape 7 — Expliquer et s'arrêter
1. Explique en quelques lignes le concept clé du cas d'utilisation (posture
   pédagogique : le principe avant le code).
2. Termine par trois questions : les plans de tests sont-ils validés ? La
   conception commune et l'ordre de livraison ? Les écarts proposés sont-ils à
   consigner ?
3. **Attends la réponse.** Le développement ne commence qu'après validation
   explicite.

## Livraison (après validation, hors de ce skill)
- **Une US à la fois**, dans l'ordre validé : RED (écrire ses tests, les voir
  échouer) → GREEN → refactor.
- **À la fin de chaque US** (ses tests verts, le lint qui passe), propose un message
  de commit Conventional Commits pour cette US seule (`feat:` …). Yannick commite.
- Passe à l'US suivante **sans relancer ce skill** : sa préparation est faite.
- Quand la dernière US est verte (ou si Yannick veut clore une US seule), propose
  `/terminer-uc` — proposer, ne jamais le lancer soi-même.

## Rappels
- Convention des tests : `describe` = nom exact de l'US, chaque `it` commence par le
  `CAnn` de la note et finit par son étiquette entre crochets :
  `it('CA07 — refuse un nom hors énumération [RG2]', …)`, `[RG2, RG5]` ou `[—]`.
- Ne coche aucune case dans le vault. Ne modifie aucune note de spec.
