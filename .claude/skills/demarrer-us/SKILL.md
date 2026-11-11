---
name: demarrer-us
description: Prépare le développement d'une user story de la V2 — lit sa spec dans le vault (épique, cas d'utilisation, critères, séquence), produit le plan de tests CA<n>, signale les écarts, puis s'arrête jusqu'à validation. À lancer par Yannick au début de chaque user story.
argument-hint: <nom de l'US, ex. "US-01 Choisir la couleur d'une zone 2.0">
allowed-tools: [Read, Grep, Glob, Bash(ls:*), Bash(find:*), Bash(awk:*), Bash(git status:*), Bash(git log:*)]
disable-model-invocation: true
---

# Démarrer une user story

User story demandée : **$ARGUMENTS**

Vault de la V2 (lecture seule, sauf la note *Écarts* à l'étape 5 avec accord) :
```
/Users/yannickbiot/Documents/Mini Brain/30 Projets/HomeCycl'Home/3. Développement - Suivi et contrôle/V2
```

**Tu n'écris aucun code et aucun test dans ce skill.** Tu prépares, tu expliques,
tu t'arrêtes.

## Étape 1 — Situer l'US
1. Lis `Assistant IA/Assistant IA - Lisez-moi.md` si ce n'est pas déjà fait dans la
   session (ordre de lecture, ce qui fait foi, définition de fini).
2. Dans `Assistant IA/Assistant IA - Index des spécifications.md`, retrouve l'US
   demandée : son épique, son cas d'utilisation, le chemin de sa note et le lien vers
   sa séquence en texte. Si le nom est ambigu ou introuvable, liste les candidats et
   demande lequel.
3. Lis `Assistant IA/Assistant IA - Journal de développement.md` (tableau
   Avancement) : l'US est-elle dans la semaine prévue par la Roadmap ? Si elle est
   en avance ou en retard, signale-le en une ligne.
4. Lis `Assistant IA/Assistant IA - Écarts d'implémentation.md` : un écart ouvert
   concerne-t-il ce cas d'utilisation ?

## Étape 2 — Lire la spec, dans cet ordre
1. L'épique.
2. Le cas d'utilisation : les règles de gestion (RG).
3. L'US : la description et les critères d'acceptation. **Numérote les critères
   `CA01`, `CA02`… dans l'ordre des lignes `- [ ]` / `- [x]` de la section
   « Critères d'acceptation »** : c'est la numérotation qu'utiliseront les tests.
4. La séquence en texte (note « Séquences (export IA) - … », ancre de l'US) : ordre
   des échanges, appels à la base, transactions.
5. Si utile : `Assistant IA/Assistant IA - Glossaire.md` et la section « Données » de
   `Refonte 2.0.md`.

## Étape 3 — Confronter au code
Repère dans le dépôt ce qui existe déjà pour cette US (module, use cases, schéma
Prisma, composants) et ce qui est à créer ou à modifier. Pas de lecture exhaustive :
juste assez pour situer le travail.

## Étape 4 — Produire le plan de tests
Un tableau, un critère par ligne (un critère peut avoir plusieurs tests) :

| CA | Critère (résumé) | Type | Fichier de test visé |
|---|---|---|---|

Choix du type, selon `Backend/CLAUDE.md` section Tests :
- règle pure → unitaire `domain/` ;
- logique d'un use case → unitaire, repository simulé ;
- transaction, écriture conditionnelle, concurrence, clé étrangère, droit d'accès de
  bout en bout → intégration (`test/*.e2e-spec.ts`) ;
- critère purement visuel (frontend) → « non automatisable — vérification
  manuelle », à signaler comme tel.

Les critères qui contiennent un exemple chiffré deviennent des tests tels quels.

## Étape 5 — Signaler les écarts
- RG du cas d'utilisation applicables à l'US mais couvertes par aucun critère.
- Critère sans RG.
- Contradiction entre deux notes, ou entre la spec et une contrainte technique.

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
- Convention des tests : `describe` = nom exact de l'US, chaque `it` commence par
  `CA<n>` (deux chiffres).
- Ne coche aucune case dans le vault. Ne modifie aucune note de spec.
