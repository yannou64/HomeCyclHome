---
name: fin-session
description: Audit incrémental de l'alignement CLAUDE.md/wiki avec le code, propose des corrections, puis met à jour l'état du sprint. À lancer manuellement en fin de session de développement importante.
allowed-tools: [Read, Grep, Glob, Bash(git:*), Bash(sh scripts/sync-wiki.sh:*)]
disable-model-invocation: true
---

# Fin de session — audit doc + sprint

Tu es invoqué manuellement par Yannick en fin de session de développement sur le projet
HomeCycl'Home. Ta mission a deux parties, dans cet ordre précis : d'abord vérifier que
`CLAUDE.md` et le wiki de synthèse sont toujours alignés avec le code réel, puis seulement
ensuite mettre à jour l'état du sprint — dans cet ordre, parce que la mise à jour du sprint
évalue l'avancement en se basant sur les règles métier de `metier.md` (vault, voir ci-dessous) :
si ce fichier est faux, l'évaluation du sprint le sera aussi.

**Vault** (source de vérité, toutes les opérations de lecture/écriture ci-dessous s'y
appliquent, jamais à la copie locale `docs/wiki/` du repo) :
```
/Users/yannickbiot/Documents/Mini Brain/30 Projets/HomeCycl'Home
```

**Règle absolue : tu ne modifies jamais un fichier directement pendant la phase d'audit.** Tu
listes les écarts trouvés, tu proposes une correction pour chacun, et tu attends la validation
de Yannick avant d'écrire quoi que ce soit. Ça vaut aussi bien pour une contradiction factuelle
que pour un ajout de contenu manquant (nouvelle feature sans fiche, etc.) — les deux passent par
la même proposition, jamais d'écriture silencieuse.

## Étape 1 — Lire le marqueur

Lis `.last-doc-sync` (à la racine du vault). Il contient un `sha` (dernier commit audité) et une
`date`.

- S'il n'existe pas, traite-le comme "aucun commit encore audité" : ne tente pas un audit
  complet du projet (ce n'est pas le rôle de ce skill), contente-toi d'examiner les entrées de
  `log.md` (vault) marquées `⚠️ À vérifier :` sans base de comparaison temporelle, puis crée
  le marqueur à l'étape 7 avec le HEAD courant pour que les prochains runs soient incrémentaux.

## Étape 2 — Lister les commits depuis le marqueur

```
git log <sha>..HEAD --oneline
```

Si la liste est vide, il n'y a rien à auditer côté code — passe directement à l'étape 6 (mise à
jour du sprint). Ne saute pas pour autant l'examen du marqueur inexistant décrit à l'étape 1.

## Étape 3 — Examiner les signalements du post-commit

Lis `log.md` (vault), isole les entrées dont la date est postérieure à celle du marqueur.
Pour chaque entrée contenant une ligne `⚠️ À vérifier :`, vérifie concrètement :
1. Relis le fichier `CLAUDE.md` (racine, `Frontend/CLAUDE.md` ou `Backend/CLAUDE.md` selon le
   sujet) pour voir l'affirmation exacte mise en cause
2. Relis le code réel concerné (le fichier, la dépendance, le composant cité)
3. Décide si c'est une vraie divergence ou un faux positif du sous-agent post-commit — dans le
   doute, garde-le dans ta liste de propositions plutôt que de l'écarter silencieusement

## Étape 4 — Scan structurel léger

Sans relire tout le code, repère les changements structurels que le post-commit n'aurait pas
signalés :

```
git diff --stat <sha>..HEAD -- Backend/src/features Frontend/src/features
git diff --stat <sha>..HEAD -- '**/package.json'
```

- Un dossier de feature ajouté/supprimé/renommé sous `features/` → vérifie s'il existe une
  fiche correspondante dans `01 - features/` (vault), sinon propose-en une (même gabarit que les
  fiches existantes : Statut, Description, Fichiers Backend/Frontend, Endpoints, Entités,
  Dépendances, Diagrammes à compléter)
- Un `package.json` modifié → vérifie si une dépendance ajoutée/retirée contredit une
  affirmation d'un `CLAUDE.md` (ex : nouvelle lib de test, nouveau package Google Maps...)

## Étape 5 — Présenter et faire valider

Compile tout ce que tu as trouvé aux étapes 3 et 4 en une liste claire, avec pour chaque
élément : le fichier concerné, l'écart constaté, la correction ou l'ajout proposé. Présente
cette liste à Yannick et demande explicitement ce qu'il valide avant d'écrire quoi que ce soit.
Si rien n'a été trouvé, dis-le simplement et passe à l'étape 6.

Applique uniquement ce qui a été validé.

## Étape 6 — Mise à jour du sprint

@/Users/yannickbiot/Documents/Mini Brain/30 Projets/HomeCycl'Home/05 - prompts/updateSprint.md

Suis les instructions ci-dessus telles quelles, maintenant que `CLAUDE.md`/le wiki de synthèse
sont fiables.

## Étape 7 — Mettre à jour le marqueur

Réécris `.last-doc-sync` (racine du vault) avec le SHA du HEAD courant (`git rev-parse HEAD`) et
la date du jour, au même format que le fichier existant.

## Étape 8 — Resynchroniser la copie locale docs/wiki/

Le vault est maintenant à jour (corrections validées, sprint mis à jour, marqueur réécrit).
Rafraîchis la copie versionnée dans le repo :

```
sh scripts/sync-wiki.sh
```

Ce script supprime `docs/wiki/`, le recopie intégralement depuis le vault, puis stage le
résultat (`git add docs/wiki`) — il ne commit rien.

## Étape 9 — Résumer

Donne à Yannick un résumé court : ce qui a été corrigé/ajouté dans la doc (ou "rien à signaler"),
le nouvel état du sprint produit par l'étape 6, et confirme que `docs/wiki/` a été resynchronisé
et stagé.