---
name: terminer-us
description: Clôt le développement d'une user story de la V2 — lance les tests, vérifie la définition de fini, produit le rapport de couverture CA<n>, propose l'entrée du Journal de développement et le message de commit. À lancer par Yannick quand une user story semble terminée.
argument-hint: <nom de l'US, ex. "US-01 Choisir la couleur d'une zone 2.0">
allowed-tools: [Read, Grep, Glob, Edit, Bash(npm test:*), Bash(npm run test:e2e:*), Bash(npm run lint:*), Bash(npx jest:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(awk:*), Bash(sed:*), Bash(shasum:*)]
disable-model-invocation: true
---

# Terminer une user story

User story : **$ARGUMENTS**

Vault de la V2 :
```
/Users/yannickbiot/Documents/Mini Brain/30 Projets/HomeCycl'Home/3. Développement - Suivi et contrôle/V2
```

Seule note où tu peux écrire, **après accord explicite de Yannick** :
`Assistant IA/Assistant IA - Journal de développement.md`. Tu ne coches aucune case,
tu ne modifies aucune note de spec, tu ne commites pas.

## Étape 1 — Lancer les tests
Depuis `Backend/` : `npm test`, puis `npm run test:e2e` si des tests d'intégration
existent. Si un test échoue, arrête-toi : montre l'échec, l'US n'est pas terminée.

## Étape 2 — Rapport de couverture
1. Relis les critères de l'US dans sa note (section « Critères d'acceptation ») et
   numérote-les `CA01`, `CA02`… dans l'ordre des lignes.
2. Retrouve les tests : `grep -rn "<nom exact de l'US>"` dans `Backend/src` et
   `Backend/test`, puis les `it('CA..` de ces `describe`.
3. Produis le tableau :

| CA | Critère (résumé) | Test(s) | Statut |
|---|---|---|---|

Statuts : **couvert** (au moins un test qui passe) · **non couvert** · **manuel**
(critère visuel, non automatisable — à vérifier par Yannick).
Signale aussi les tests orphelins (un `CA<n>` qui ne correspond à aucun critère).

## Étape 3 — Définition de fini
Vérifie, en citant le code :
- [ ] chaque critère automatisable a au moins un test qui passe ;
- [ ] les écritures que la séquence place dans une transaction sont dans une seule
      transaction (`prisma.$transaction` dans une méthode de repository) ;
- [ ] les écritures conditionnelles utilisent `updateMany` et lisent `count` ;
- [ ] aucune RG applicable du cas d'utilisation n'est laissée sans critère couvert ;
- [ ] aucun calcul de jour en UTC ;
- [ ] `npm run lint` passe (backend et frontend si touché).

Un point non tenu = l'US n'est pas terminée. Dis-le clairement.

## Étape 4 — Empreinte des critères
Calcule l'empreinte du texte des critères (l'état des cases n'y entre pas) :
```bash
awk '/^## Critères d.acceptation/{f=1;next} /^## /{f=0} f && /^- \[.\] /' "<note de l'US>" \
  | sed -E 's/^- \[.\] //' | shasum -a 256 | cut -c1-12
```
Elle sera notée dans le Journal : `/audit-alignement` s'en sert pour détecter un
critère modifié après l'implémentation.

## Étape 5 — Proposer l'entrée du Journal
Rédige, sans l'écrire encore :
- **Une entrée** en tête de la section « Entrées », au format de la note :
  date, US, type `Décision` | `Déviation` | `Écart spec` | `Incident` (ou
  « Terminée » si rien à signaler), constat, raison, impact sur le plan,
  à reprendre en V3 (oui/non), **empreinte : N critères, `<hash>`**.
  Décisions techniques prises pendant l'US, écarts par rapport au plan (retard,
  réordonnancement, périmètre), lien vers toute ligne d'*Écarts* créée.
- **La mise à jour du tableau Avancement** : la semaine concernée, US terminées,
  critères couverts sur prévus.

Montre les deux à Yannick, et **n'écris dans le Journal qu'après son accord**.

## Étape 6 — Vérifier les CLAUDE.md
Regarde le diff de l'US (`git diff dev...HEAD --stat` et les fichiers clés). Une
convention a-t-elle changé (nouveau pattern, nouvelle dépendance, chemin cité qui
n'existe plus) ? Si oui, propose la correction du `CLAUDE.md` concerné — ne l'écris
pas sans accord.

## Étape 7 — Conclure
1. Résumé court : couverture, définition de fini, entrée du Journal.
2. Liste des critères que Yannick peut cocher (couverts) et de ceux à vérifier à la
   main (manuels).
3. Proposition de message de commit conforme aux Conventional Commits
   (`feat:`, `fix:`, `test:`…), avec la ligne d'attribution habituelle.
