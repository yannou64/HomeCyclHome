---
name: audit-alignement
description: Audit en lecture seule de l'alignement entre la spec V2 du vault, le code, les tests, les CLAUDE.md et le Journal de développement. À lancer par Yannick aux points de contrôle (C1, C2, C3, fin de V2) ou en cas de doute.
argument-hint: "[épique ou cas d'utilisation — vide = toute la V2]"
allowed-tools: [Read, Grep, Glob, Bash(ls:*), Bash(find:*), Bash(awk:*), Bash(sed:*), Bash(shasum:*), Bash(git log:*), Bash(git status:*), Bash(npm test:*), Bash(npm run test:e2e:*)]
disable-model-invocation: true
---

# Audit d'alignement spec ↔ réalité

Périmètre : **$ARGUMENTS** (vide = toute la V2).

Vault de la V2 (noté `<V2>` ci-dessous ; `<dépôt>` = racine du dépôt de code) :
```
/Users/yannickbiot/Mini Brain/30 Projets/HomeCycl'Home/3. Développement - Suivi et contrôle/V2
```

**Règle absolue : tu n'écris rien, nulle part.** Tu produis un rapport et des
propositions ; Yannick décide de ce qui est appliqué.

## Contrôle 1 — Critères ↔ tests
Pour chaque US du périmètre ayant une entrée dans le Journal de développement :
1. Recalcule l'empreinte de ses critères :
   ```bash
   awk '/^## Critères d.acceptation/{f=1;next} /^## /{f=0} f && /^- \[.\] /' "<note de l'US>" \
     | sed -E 's/^- \[.\] //' | shasum -a 256 | cut -c1-12
   ```
   et compare-la à celle notée dans le Journal. **Différente = la spec a changé après
   l'implémentation** : identifie les critères ajoutés, retirés ou reformulés.
2. Compare les critères aux tests avec le vérificateur du vault, une seule fois pour
   tout le périmètre :
   ```bash
   python3 "/Users/yannickbiot/Mini Brain/.claude/skills/_shared/cascade/verifier-ca.py" "<V2>" "<dépôt>"
   ```
   Critères sans test, tests dont le `CA` n'existe pas dans la note, étiquettes
   `[RG…]` divergentes, `describe` sans US, RG sans critère. Les numéros `CAnn`
   sont ceux écrits dans les notes, jamais recomptés.
3. Cases cochées dans le vault mais sans test qui passe, et l'inverse (information
   pour Yannick — tu ne coches ni ne décoches rien).

## Contrôle 2 — Écarts en attente
Lignes de `Assistant IA - Écarts d'implémentation.md` sans décision, avec leur âge,
et décisions prises mais pas encore reportées dans la spec ou dans le code.

## Contrôle 3 — CLAUDE.md ↔ code
Pour `CLAUDE.md`, `Backend/CLAUDE.md` et `Frontend/CLAUDE.md` :
- chaque chemin cité existe-t-il encore ?
- chaque convention citée est-elle respectée par le code récent (par exemple
  écritures conditionnelles, fuseau, nommage `CA<n>`, Tailwind limité à l'admin) ?
- un CLAUDE.md recopie-t-il une règle métier, une date du plan ou un compteur
  (interdit par la règle « une information, un seul endroit ») ?

Vérifie aussi `Assistant IA - Lisez-moi.md` :
- la section « Où ça vit dans le code » : les chemins existent-ils toujours ?
- le renvoi vers la section « Invariants de sécurité des liens » de
  `/Users/yannickbiot/Mini Brain/CLAUDE.md` : cette section existe-t-elle
  toujours sous ce titre ?

## Contrôle 4 — Journal ↔ Roadmap
Compare le tableau Avancement du Journal au calendrier de `Refonte 2.0.md` :
critères couverts face au cumul prévu, retard en semaines au point de contrôle, et
si la ligne de coupe s'applique (règle écrite dans `Refonte 2.0`, ne pas la
recopier, la citer).

## Contrôle 5 — Tests
Lance `npm test` (et `npm run test:e2e` s'il existe) depuis `Backend/` : tout est-il
vert ?

## Rapport
Un rapport court, par contrôle : ✅ aligné, ou la liste des écarts avec, pour
chacun, le fichier, le constat et la correction proposée (et qui doit l'appliquer :
Yannick dans la spec, Claude dans le code ou un CLAUDE.md). Termine par les trois
actions les plus importantes.
