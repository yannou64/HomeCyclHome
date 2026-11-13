---
name: demarrer-us
description: Prépare le développement d'une user story de la V2 — lit sa spec dans le vault (épique, cas d'utilisation, critères, séquence), produit le plan de tests CA<n>, signale les écarts, puis s'arrête jusqu'à validation. À lancer par Yannick au début de chaque user story.
argument-hint: <nom de l'US, ex. "US-01 Choisir la couleur d'une zone 2.0">
allowed-tools: [Read, Grep, Glob, Bash(ls:*), Bash(find:*), Bash(awk:*), Bash(python3:*), Bash(git status:*), Bash(git log:*)]
disable-model-invocation: true
---

# Démarrer une user story

User story demandée : **$ARGUMENTS**

Vault de la V2 (lecture seule, sauf la note *Écarts* à l'étape 5 avec accord) :
```
/Users/yannickbiot/Mini Brain/30 Projets/HomeCycl'Home/3. Développement - Suivi et contrôle/V2
```
Dans les commandes ci-dessous, `<V2>` désigne ce dossier. Toujours entre
guillemets : les chemins contiennent des espaces et des apostrophes.

**Tu n'écris aucun code et aucun test dans ce skill.** Tu prépares, tu expliques,
tu t'arrêtes.

**Économie de lecture.** Lis en entier ce qui sert à raisonner : Lisez-moi, épique,
cas d'utilisation, US. Pour le reste, n'extrais que la partie utile avec les
commandes indiquées. Ne lis jamais en entier l'Index des spécifications ni une note
« Séquences (export IA) ».

## Étape 1 — Situer l'US
1. Lis `Assistant IA/Assistant IA - Lisez-moi.md` si ce n'est pas déjà fait dans la
   session (ordre de lecture, ce qui fait foi, définition de fini).
2. Trouve la note de l'US :
   ```bash
   find "<V2>" -name "$ARGUMENTS.md" -not -path "*/Assistant IA/*"
   ```
   Son dossier est celui de l'US, le dossier parent celui du cas d'utilisation, le
   suivant celui de l'épique ; chaque dossier contient une note du même nom. Aucun
   résultat ou plusieurs : relance avec `-name "*<partie du nom>*"`, liste les
   candidats avec leur cas d'utilisation et demande lequel.
3. Avancement, sans lire tout le Journal :
   ```bash
   awk '/^## Avancement/,/^## Entrées/' "<V2>/Assistant IA/Assistant IA - Journal de développement.md"
   ```
   Compare avec la ligne du calendrier de `Refonte 2.0.md` qui cite le cas
   d'utilisation (Grep sur son nom). Si l'US est en avance ou en retard,
   signale-le en une ligne.
4. Lis `Assistant IA/Assistant IA - Écarts d'implémentation.md` : un écart ouvert
   concerne-t-il ce cas d'utilisation ?

## Étape 2 — Lire la spec, dans cet ordre
1. L'épique (note entière).
2. Le cas d'utilisation (note entière) : les règles de gestion (RG), y compris
   celles marquées *Sans critère*.
3. L'US (note entière) : la description et les critères d'acceptation.
   **Reprends le numéro `CAnn` écrit dans la note, tel quel. Ne renumérote jamais** :
   les numéros sont stables et peuvent avoir des trous (un critère retiré ne libère
   pas son numéro). Garde aussi l'étiquette de règle du critère : `(RG2)`,
   `(RG2, RG5)` ou `(—)`.
4. La séquence en texte, extraite seule. La note s'appelle « Séquences (export IA) -
   <épique> » :
   ```bash
   awk -v t="### $ARGUMENTS" '$0==t{f=1} f&&/^##/&&$0!=t{exit} f' \
     "<V2>/Assistant IA/Séquences/Séquences (export IA) - <épique>.md"
   ```
   Ordre des échanges, appels à la base, transactions (dernière ligne du bloc).
5. Si l'US touche aux données, la section « Données » de `Refonte 2.0.md`, seule :
   ```bash
   awk '/^## Données/{f=1} /^## Forfaits/{f=0} f' "<V2>/Refonte 2.0.md"
   ```
6. `Assistant IA/Assistant IA - Glossaire.md` seulement si un terme bloque.

## Étape 3 — Confronter au code
Repère dans le dépôt ce qui existe déjà pour cette US : module (voir « Où ça vit dans
le code » dans le Lisez-moi), use cases, schéma Prisma, composants, et un éventuel
`describe` qui porte déjà le nom de l'US. Repère aussi ce qui est à créer ou à
modifier. Pas de lecture exhaustive : juste assez pour situer le travail.

## Étape 4 — Produire le plan de tests
Un tableau, un critère par ligne, avec le numéro et la règle **tels qu'écrits dans la
note** :

| CA | RG | Critère (résumé) | Type | Fichier de test visé |
|---|---|---|---|---|

Choix du type, selon `Backend/CLAUDE.md` section Tests :
- règle pure → unitaire `domain/` ;
- logique d'un use case → unitaire, repository simulé ;
- transaction, écriture conditionnelle, concurrence, clé étrangère, droit d'accès de
  bout en bout → intégration (`test/*.e2e-spec.ts`) ;
- critère purement visuel (frontend) → « non automatisable — vérification
  manuelle », à signaler comme tel.

Les critères qui contiennent un exemple chiffré deviennent des tests tels quels.

## Étape 5 — Signaler les écarts
1. **Contrôle mécanique d'abord** : lance le vérificateur du vault et ne garde que les
   lignes de cette US.
   ```bash
   python3 "/Users/yannickbiot/Mini Brain/.claude/skills/_shared/cascade/verifier-ca.py" "<V2>" \
     | grep -F "$ARGUMENTS"
   ```
   Il signale les numéros CA en doublon ou désordonnés, les étiquettes absentes, les
   RG citées qui n'existent pas, et les RG applicables sans critère. Ne refais pas
   ces contrôles à la main. Aucune ligne = rien à signaler de ce côté.
2. **Puis ce qu'un script ne voit pas** :
   - contradiction entre deux notes (UC, US, séquence, Données) ;
   - contradiction entre la spec et une contrainte technique ;
   - critère ambigu ou impossible à tester tel qu'écrit.

Pour chacun, rédige une **proposition de ligne** pour *Écarts* (date, note
concernée, constat, proposition, décision vide). **Ne l'écris dans la note qu'après
accord de Yannick.** Ne tranche jamais toi-même.

## Étape 6 — Expliquer et s'arrêter
1. Explique en quelques lignes le concept clé de l'US (posture pédagogique : le
   principe avant le code), et l'ordre d'implémentation prévu.
2. Termine par : le plan de tests est-il validé ? Les écarts proposés sont-ils à
   consigner ?
3. **Attends la réponse.** Le développement (RED puis GREEN) ne commence qu'après
   validation explicite.

## Rappels
- Convention des tests : `describe` = nom exact de l'US, chaque `it` commence par le
  `CAnn` de la note et finit par son étiquette entre crochets :
  `it('CA07 — refuse un nom hors énumération [RG2]', …)`, `[RG2, RG5]` ou `[—]`.
- Ne coche aucune case dans le vault. Ne modifie aucune note de spec.
