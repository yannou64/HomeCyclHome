# CLAUDE.md — Frontend HomeCycl'Home

Ce fichier complète le `CLAUDE.md` racine avec les spécificités du Frontend.
Il est lu automatiquement par Claude Code quand tu travailles dans ce dossier.
Les règles d'affichage métier (libellés, statuts visibles, ce que chaque rôle voit)
sont dans la spec du vault, pas ici.

---

## 1. Stack Frontend

| Outil                  | Usage                                                   |
| ---------------------- | ------------------------------------------------------- |
| React 19 + Vite        | Framework + bundler                                     |
| TypeScript             | Typage statique strict                                  |
| SCSS Modules           | Styles scopés par composant (pages client et technicien) |
| Tailwind v4 + shadcn-ui | Panneau admin uniquement (voir section 4)              |
| React Router 7         | Routing SPA                                             |
| FullCalendar           | Calendriers (réservation, planning)                     |
| Google Maps JS API     | Autocomplete adresse                                    |

**Tests :** aucun test frontend (décision ouverte, consignée dans le Journal de
développement du vault).

---

## 2. Structure des dossiers

```
src/
├── app/                    # Noyau applicatif
│   ├── providers/          # Providers React globaux
│   │   ├── authContext/    # Session utilisateur (AuthContext, useAuth)
│   │   └── reservationContext/  # État global du tunnel de réservation
│   ├── router/             # Routes React Router + ProtectedRoute
│   ├── styles/             # SCSS global, variables et tokens du design system
│   ├── App.tsx
│   └── main.tsx
│
├── assets/                 # Images, fonts, icônes statiques
│
├── features/               # Fonctionnalités métier (feature-based)
│   └── auth/               # Exemple : authentification
│       ├── components/     # Composants spécifiques à la feature
│       ├── hooks/          # Hooks React spécifiques
│       ├── services/       # Appels API liés à la feature
│       └── types/          # Types TypeScript de la feature
│
├── pages/                  # Pages de l'application (1 fichier = 1 route)
│   └── Home.tsx
│
└── shared/                 # Éléments transversaux réutilisables
    ├── components/         # Composants génériques (Button, Input, Modal...)
    ├── hooks/              # Hooks génériques (useDebounce, useFetch...)
    ├── services/           # Services partagés (axios instance, auth token...)
    ├── types/              # Types TypeScript globaux
    └── utils/              # Fonctions utilitaires pures
```

Pas de dossier `app/config/` — les variables d'environnement sont lues directement via
`import.meta.env.VITE_*`. Pas de `QueryClient` (React Query) dans le projet — la gestion
des appels API passe uniquement par le pattern Composant → Hook → Service ci-dessous.

**Règle d'organisation :**

- Tout ce qui est spécifique à une fonctionnalité → `features/<nom>/`
- Tout ce qui est réutilisable entre features → `shared/`
- Une page = un fichier dans `pages/` qui orchestre des composants de `features/`

---

## 3. Conventions de code

**Nommage :**

- Composants React : `PascalCase` (ex: `AddressInput.tsx`)
- Hooks : `camelCase` préfixé `use` (ex: `useAddressSearch.ts`)
- Services : `camelCase` suffixé `Service` (ex: `interventionService.ts`)
- Types/Interfaces : `PascalCase`, sans préfixe (ex: `AuthSession`, `ForfaitDto`) — c'est la convention réellement suivie dans le code, pas de préfixe `I`
- Fichiers CSS/styles : `kebab-case`

**Composants :**

- Toujours des composants fonctionnels avec hooks
- Props typées avec une interface dédiée
- Un composant = une responsabilité unique
- Éviter les composants de plus de 150 lignes — découper si nécessaire

**TypeScript :**

- `strict: true` dans tsconfig — ne jamais utiliser `any`
- Typer explicitement les props, les retours de fonctions et les états
- Les types partagés vont dans `shared/types/`, les types locaux dans `features/<nom>/types/`

---

## 4. Design system — règles d'implémentation

Se référer au `CLAUDE.md` racine pour les valeurs (couleurs, typo).
Ici, les règles d'implémentation avec **SCSS Modules**.

**Organisation des styles (déjà en place dans `src/app/styles/`) :**

```
src/app/styles/
├── _base.scss        # Styles de base (body, html, éléments sémantiques)
├── _fonts.scss       # Déclarations @font-face (Grand Hotel, Nunito)
├── _mixins.scss      # Mixins réutilisables (responsive, flex helpers...)
├── _reset.scss       # Reset CSS global
├── _variables.scss   # Tokens du design system (couleurs, typo, espacements)
├── _index.scss       # Barrel — réexporte tous les partials
└── global.scss       # Entrée principale — importe _index.scss
```

Chaque composant possède son propre fichier `MonComposant.module.scss` colocalisé.
Pour importer les variables dans un module : chemin relatif vers `app/styles/index`.
Exemple depuis `src/features/auth/components/LoginForm/` : `@use '../../../../app/styles/index' as *;`
Compter les `../` selon la profondeur du fichier par rapport à `src/`.

**Toutes les valeurs du design system (couleurs, typographie, espacements) sont définies
dans `src/app/styles/_variables.scss`. Toujours consulter ce fichier avant d'implémenter
un composant — ne jamais écrire de valeurs en dur.**

**Règles SCSS Modules :**

- Un fichier `MonComposant.module.scss` par composant, colocalisé
- Utiliser `composes` pour réutiliser des classes entre modules si besoin
- Toujours importer les variables via un chemin relatif vers `app/styles/index` (ex: `@use '../../../app/styles/index' as *;`)
- Ne jamais écrire de styles globaux dans un module — uniquement dans `global.scss`
- Nommage des classes en `camelCase` dans les modules (ex: `.headerWrapper`)

**Panneau admin — Tailwind v4 + shadcn-ui :**

- Réservé aux écrans d'administration ; ne jamais l'utiliser sur les pages client ou
  technicien, qui restent en SCSS Modules.
- Composants shadcn dans `src/shared/components/ui/`, point d'entrée Tailwind
  `src/app/styles/tailwind.css`, helper `src/shared/utils/cn` (config :
  `components.json`).

**Constantes d'affichage partagées :** une correspondance utilisée à plusieurs
endroits (par exemple nom de couleur de zone → code hexadécimal) vit dans **un seul
fichier** de `shared/`, importé partout. Ses valeurs viennent de la spec.

**Composants UI clés identifiés dans la maquette :**

- `Header` — deux états : `unauthenticated` | `authenticated`
- `MobileMenu` — drawer orange avec navigation complète
- `AddressBlock` — champ Google Autocomplete + bouton CTA groupés visuellement
- `Footer` — fond mocha, liens légaux + copyright

---

## 5. Appels API

- Les appels spécifiques à une feature → `features/<nom>/services/`
- Les éléments transversaux (instance Axios, intercepteurs) → `shared/services/`
- Ne jamais faire d'appel API directement dans un composant

**Pattern à respecter :**

```
Composant → Hook → Service → API Backend
```

**Forme du service (objet nommé — obligatoire) :**

```typescript
// featureService.ts
export const featureService = {
  async getX(params: GetXParams): Promise<X> {
    const r = await apiClient.get<X>('/endpoint', { params });
    return r.data;
  },
  async createX(payload: CreateXPayload): Promise<X> {
    const r = await apiClient.post<X>('/endpoint', payload);
    return r.data;
  },
};
```

- Toujours exporter un objet nommé (jamais des fonctions isolées)
- Toujours utiliser `async/await` (jamais `.then()/.catch()`), y compris dans les hooks et composants qui consomment un service
- **Référence :** `features/admin/services/adminUsersService.ts` est l'implémentation de référence

---

## 6. Gestion de l'authentification

- Le token JWT est stocké dans un cookie `HttpOnly` (inaccessible au JavaScript — protection XSS)
- Le refresh token est également en cookie `HttpOnly`
- Le renouvellement du token est silencieux (géré côté backend)
- Les routes protégées utilisent un `ProtectedRoute` wrapper (`app/router/ProtectedRoute.tsx`)
- Le rôle de l'utilisateur (`client` | `technicien` | `admin`) conditionne l'affichage

---

## 7. Google Maps Integration

- Utiliser uniquement `@googlemaps/js-api-loader` (pas `@react-google-maps/api`, absent du projet)
- L'Autocomplete est limité aux adresses françaises (`componentRestrictions: { country: 'fr' }`)
- À la sélection d'une adresse, décomposer via l'API Geocoding pour extraire :
  `numero`, `rue`, `code_postal`, `ville`, `latitude`, `longitude`, `google_place_id`
- Ne jamais stocker une adresse brute — toujours la décomposer avant envoi au backend

---

## 8. Maquettes — vault puis Figma

**Écrans V2 :** les wireframes et maquettes de travail sont dans le vault
(`2. Conception/4. Wireframes/` : `planning 2.0`, `intervention 2.0` ;
`2. Conception/5. Maquettes/` : `Maquette-planning 2.0`). Les lire avant d'implémenter
un écran V2 : ils fixent la structure et le parcours.

**Espace technicien :** conçu mobile d'abord (usage terrain), desktop ensuite.

**MCP Figma** (valeurs visuelles des composants existants) :

1. Consulter la maquette Figma via MCP
2. Extraire les valeurs exactes (dimensions, couleurs, espacements)
3. Implémenter en SCSS Modules en respectant ces valeurs
4. Signaler toute incohérence entre maquette, wireframe du vault et design system

---

## 9. Points d'attention

- **Responsive first** : commencer mobile, adapter desktop
- **Accessibilité** : attributs ARIA, roles sémantiques HTML, focus visible
- **Performance** : lazy loading des pages avec `React.lazy()`
- **Variables d'environnement** : préfixées `VITE_` obligatoirement
- Ne jamais commit de clé API en dur — toujours via `.env`
