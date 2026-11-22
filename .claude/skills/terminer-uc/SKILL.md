---
name: terminer-uc
description: Clôt le développement d'un cas d'utilisation de la V2, ou d'une seule de ses user stories — lance les tests, produit un rapport de couverture CA<n> par user story, vérifie la définition de fini, calcule une empreinte par user story, propose l'entrée du Journal de développement et rappelle les commits. À lancer par Yannick quand les user stories du lot semblent terminées.
argument-hint: <cas d'utilisation, ex. "(Admin) Administrer les modèles de planification 2.0"> — ou une US seule
allowed-tools: [Read, Grep, Glob, Edit, Bash(npm test:*), Bash(npm run test:e2e:*), Bash(npm run lint:*), Bash(npx jest:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(awk:*), Bash(sed:*), Bash(grep:*), Bash(shasum:*), Bash(find:*), Bash(python3:*)]
disable-model-invocation: true
---

# Terminer un cas d'utilisation (ou une user story)

Périmètre demandé : **$ARGUMENTS**

Vault de la V2 (noté `<V2>` ci-dessous ; `<dépôt>` = racine du dépôt de code ;
`<Journal>` = `<V2>/Assistant IA/Assistant IA - Journal de développement.md`) :
```
/Users/yannickbiot/Mini Brain/30 Projets/HomeCycl'Home/3. Développement - Suivi et contrôle/V2
```

Ce que tu peux écrire dans le vault (section « Cases et repères » du Lisez-moi,
qui fait foi ; Invariants de sécurité des liens de
`/Users/yannickbiot/Mini Brain/CLAUDE.md` lus avant) :
- le Journal, **après accord explicite de Yannick** ;
- dans les notes d'US du périmètre, **la case d'un critère testé**, ligne par
  ligne (étape 5). Jamais la case d'un critère `*(manuel)*`, jamais une case de
  pilotage (US dans le cas d'utilisation, cas dans l'épique).
Rien d'autre dans une note de spec. Tu ne commites pas.

## Étape 0 — Fixer le périmètre
Trouve la note sans lire l'Index :
`find "<V2>" -name "$ARGUMENTS.md" -not -path "*/Assistant IA/*"`, puis lis son
`type:`.
- **`use_case`** : le périmètre est l'ensemble de ses US **développées** (un
  `describe` porte leur nom dans `Backend/src` ou `Backend/test`) et **pas encore
  journalisées** :
  ```bash
  find "<dossier du cas d'utilisation>" -mindepth 2 -maxdepth 2 -name "US-*.md"
  grep -E '^### |Empreinte' "<Journal>" | grep -F "<nom exact de l'US>"
  ```
  Une US non développée reste hors périmètre : signale-la (« reste à faire »).
- **`user_story`** : le périmètre est cette US seule.

Annonce le périmètre en une ligne avant de continuer.

## Étape 1 — Lancer les tests
Une seule fois, depuis `Backend/` : `npm test`, puis `npm run test:e2e`. Si un test
échoue, arrête-toi : montre l'échec, le lot n'est pas terminé.

## Étape 2 — Rapport de couverture, par US
1. Relis les critères de chaque US du périmètre (section « Critères
   d'acceptation ») : **le numéro `CAnn` et l'étiquette `(RG…)` sont ceux écrits
   dans la note. Ne renumérote jamais**, les trous de numérotation sont normaux.
2. **Contrôle mécanique** : lance le vérificateur du vault avec le dépôt, et garde
   les lignes des US du périmètre et celles qui citent un fichier de test :
   ```bash
   python3 "/Users/yannickbiot/Mini Brain/.claude/skills/_shared/cascade/verifier-ca.py" "<V2>" "<dépôt>" \
     | grep -F -e "<nom de l'US 1>" -e "<nom de l'US 2>" -e "spec.ts"
   ```
   Il signale les critères sans test, les tests dont le `CA` n'existe pas dans la
   note, les étiquettes `[RG…]` absentes ou divergentes, les `describe` sans US.
   Chaque erreur qui concerne le périmètre est un point à corriger avant de conclure.
3. Retrouve les tests eux-mêmes (`grep -rn "<nom exact de l'US>"` dans `Backend/src`
   et `Backend/test`) et produis **un tableau par US**, titré de son nom :

| CA | RG | Critère (résumé) | Test(s) | Statut |
|---|---|---|---|---|

Statuts : **couvert** (au moins un test qui passe) · **non couvert** · **manuel**
(critère marqué `*(manuel)*` dans la note, vérifié à l'écran par Yannick, sans
test). Un critère d'affichage sans repère et sans test est un point à corriger :
pose le repère (limites du Lisez-moi ; critère douteux → manuel) et justifie-le
dans l'entrée du Journal.

## Étape 3 — Définition de fini
Pour **chaque US** du périmètre, vérifie en citant le code :
- [ ] chaque critère automatisable a au moins un test qui passe ;
- [ ] les écritures que la séquence place dans une transaction sont dans une seule
      transaction (`prisma.$transaction` dans une méthode de repository) ;
- [ ] les écritures conditionnelles utilisent `updateMany` et lisent `count` ;
- [ ] aucun calcul de jour en UTC.

Puis, **une fois pour le lot** :
- [ ] chaque RG du cas d'utilisation est couverte par un critère d'au moins une de
      ses US (terminées avant ou dans ce lot), sauf les RG marquées *Sans critère*.
      Une RG qui attend une US hors périmètre est signalée, pas bloquante ;
- [ ] `npm run lint` passe (backend, et frontend si touché).

Un point non tenu = l'US concernée n'est pas terminée. Dis-le clairement ; les
autres US du lot peuvent être closes sans elle.

## Étape 4 — Empreinte des critères, par US
Pour chaque US du périmètre, calcule l'empreinte du texte des critères (l'état des
cases n'y entre pas) :
```bash
awk '/^## Critères d.acceptation/{f=1;next} /^## /{f=0} f && /^- \[.\] /' "<note de l'US>" \
  | sed -E 's/^- \[.\] //' | shasum -a 256 | cut -c1-12
```
Elle sera notée dans le Journal : `/audit-alignement` s'en sert pour détecter un
critère modifié après l'implémentation. Le repère `*(manuel)*` fait partie du
texte : calcule l'empreinte **après** l'ajout des repères.

## Étape 5 — Cocher les critères testés
Seulement si l'étape 1 est entièrement verte et l'étape 3 tenue. Relance
`verifier-ca.py "<V2>" "<dépôt>"` et, pour chaque US du périmètre :
- un critère signalé « testé, case à cocher » : remplace `- [ ] **CAnn**` par
  `- [x] **CAnn**` sur sa ligne, rien d'autre ;
- un critère signalé « case cochée mais aucun test » : décoche-le et dis-le.
Relance le script : il ne doit plus signaler aucun critère testé à cocher.
L'état des cases n'entre pas dans l'empreinte.

## Étape 6 — Proposer l'entrée du Journal
Rédige, sans l'écrire encore :
- **Une entrée** en tête de la section « Entrées », au format de la note :
  - titre `### JJ/MM/AAAA · <type> · <cas d'utilisation>` (ou `· <nom de l'US>`
    pour une US seule) ; type `Décision` | `Déviation` | `Écart spec` |
    `Incident`, ou `Terminée` si rien à signaler ;
  - les US livrées, puis constat, raison, impact sur le plan, à reprendre en V3
    (oui/non) ; décisions techniques prises, écarts au plan (retard,
    réordonnancement, périmètre), lien vers toute ligne d'*Écarts* créée ;
  - les repères `*(manuel)*` posés pendant le lot, chacun avec sa raison ;
  - **une ligne d'empreinte par US**, avec son nom exact (c'est ce que cherche
    `/audit-alignement`) :
    `- **Empreinte · <nom exact de l'US>** : N critères, \`<hash>\`.`
- **La mise à jour du tableau Avancement** : la semaine concernée, US terminées,
  critères couverts sur prévus.

Montre les deux à Yannick, et **n'écris dans le Journal qu'après son accord**.

## Étape 7 — Vérifier les CLAUDE.md
Regarde le diff du lot (`git diff dev...HEAD --stat` et les fichiers clés). Une
convention a-t-elle changé (nouveau pattern, nouvelle dépendance, chemin cité qui
n'existe plus, nouvelle règle d'interface) ? Si oui, propose la correction du
`CLAUDE.md` concerné — ne l'écris pas sans accord.

## Étape 8 — Conclure
1. Résumé court : couverture par US, définition de fini, entrée du Journal.
2. Liste, par US, des critères cochés (couverts) et de ceux que Yannick vérifie
   à l'écran puis coche lui-même (manuels).
3. Commits : rappelle ceux proposés au fil des US (`git log dev..HEAD --oneline`
   pour voir ce qui est déjà commité) et propose le message de ce qui reste, en
   Conventional Commits, avec la ligne d'attribution habituelle.
