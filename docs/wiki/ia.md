# Configuration IA — HomeCycl'Home

Documentation de l'environnement IA mis en place pour le projet.
Claude Code CLI est utilisé comme agent de développement principal.

---

## 1. Philosophie d'utilisation

L'IA est un **outil d'assistance**, pas de substitution.

| Ce que Claude Code fait                     | Ce que le développeur conserve |
| ------------------------------------------- | ------------------------------ |
| Respecter les conventions et l'architecture | Les décisions techniques       |
| Scaffolding de code                         | La créativité UI/UX            |
| Mise à jour du wiki                         | La validation du code          |
| Analyse de l'avancement                     | Le jugement sur la qualité     |

**Règle fondamentale :** tout ce que Claude Code produit est relu et validé
par le développeur avant d'être intégré.

---

## 2. Configuration — fichiers CLAUDE.md

Les fichiers `CLAUDE.md` sont lus automatiquement par Claude Code
au démarrage de chaque session. Ils définissent le contexte permanent du projet.

| Fichier               | Contenu                                                                     | Chargé quand             |
| --------------------- | --------------------------------------------------------------------------- | ------------------------ |
| `/CLAUDE.md`          | Contexte global, stack, conventions Git, design system, posture pédagogique | Toujours                 |
| `/Frontend/CLAUDE.md` | Structure feature-based, SCSS Modules, Google Maps, MCP Figma               | Session dans `Frontend/` |
| `/Backend/CLAUDE.md`  | Clean Architecture, Prisma, sécurité JWT, TDD                               | Session dans `Backend/`  |

**Règle :** ne jamais contredire les `CLAUDE.md` dans un prompt ponctuel.
Si un choix doit évoluer, mettre à jour le fichier concerné et ajouter
une entrée dans `docs/wiki/log.md`.

---

## 3. Wiki projet

Le wiki est la **mémoire persistante** du projet. Claude Code le consulte
pour s'orienter avant chaque session de travail.

| Fichier            | Rôle                                       | Mise à jour                         |
| ------------------ | ------------------------------------------ | ----------------------------------- |
| `index.md`         | Vue d'ensemble, état du projet, navigation | Manuelle — début de sprint          |
| `metier.md`        | Entités, règles métier, contraintes        | Manuelle — si le domaine évolue     |
| `stack.md`         | Choix techniques et justifications         | Manuelle — si un choix change       |
| `architecture.md`  | Structure des dossiers, patterns, flux     | Manuelle — si l'architecture évolue |
| `sprint-actuel.md` | User stories et avancement du sprint       | Via prompt `update-sprint.md`       |
| `log.md`           | Journal des décisions (append-only)        | Automatique via hook post-commit    |
| `ia.md`            | Ce fichier — configuration IA              | Manuelle — si la config évolue      |

### Règles du wiki

- Ne jamais supprimer d'information — amender ou compléter
- `log.md` est **append-only** — aucune entrée existante ne peut être modifiée
- Les fichiers du wiki sont une source de vérité — en cas de conflit
  avec le code, le code prime et le wiki doit être mis à jour

---

## 4. Automatisation — sous-agent post-commit

**Déclencheur :** chaque `git commit` sur une branche `feature/*`

**Comportement :**

1. Récupère le message du commit, les fichiers modifiés, la date et la branche
2. Génère une entrée dans `docs/wiki/log.md`
3. N'intervient pas sur `main` ou `dev` (merge commits)
4. Ignore les commits `style:` et `docs:` non significatifs

**Fichiers concernés :**

- Hook : `.husky/post-commit`
- Prompt : `docs/wiki/prompts/update-log.md`

**Format d'une entrée générée :**

```
## [YYYY-MM-DD] <type> | <titre>

<Description factuelle en 2-4 lignes>
Fichiers concernés : <fichiers clés>
```

---

## 5. Prompt manuel — mise à jour du sprint

**Déclencheur :** appel explicite du développeur en fin de session ou de journée

**Utilisation dans Claude Code :**

```
Suis les instructions de docs/wiki/prompts/update-sprint.md
et mets à jour l'état du sprint.
```

**Comportement :**

1. Lit `sprint-actuel.md` pour connaître les user stories
2. Analyse le code dans `Frontend/src/` et `Backend/src/`
3. Met à jour les statuts (⏳ À faire / 🔄 En cours / ✅ Terminé / 🚫 Bloqué)
4. Produit un résumé d'avancement et des suggestions de priorité

**Fichier prompt :** `docs/wiki/prompts/update-sprint.md`

---

## 6. MCP Figma

**Statut :** ✅ connecté via plugin officiel

**Installation :**

```bash
claude plugin install figma@claude-plugins-official
```

**Utilisation :**

1. Ouvrir le fichier dans **Figma desktop** (pas le navigateur)
2. Sélectionner le calque ou composant cible
3. Dans Claude Code :

```
En te basant sur le composant Figma sélectionné,
implémente [composant] en SCSS Modules en respectant
le design system défini dans CLAUDE.md
```

**Limites connues :**

- Nécessite une sélection active dans Figma desktop
- Les noms de calques génériques (Frame 1, Group 3...) réduisent la précision
- Nommer les composants clés dans Figma améliore la qualité du code généré

---

## 7. Bonnes pratiques

- **Début de session :** laisser Claude Code lire le wiki avant de commencer
  (`"Lis docs/wiki/index.md et dis-moi où on en est"`)
- **Fin de session :** lancer la mise à jour du sprint si des user stories ont avancé
- **Nouveau choix technique :** mettre à jour `stack.md` et ajouter une entrée dans `log.md`
- **Changement d'architecture :** mettre à jour `architecture.md` et le `CLAUDE.md` concerné
