# CLAUDE.md — Frontend HomeCycl'Home

Complète le `CLAUDE.md` racine avec les conventions du frontend. Les règles
d'affichage métier (libellés, statuts visibles, ce que chaque rôle voit) sont dans la
spec du vault, pas ici.

**Ces conventions décrivent le code tel qu'il est.** Un nouveau code les suit ; un
code existant qui s'en écarte est corrigé quand on le touche.

---

## 1. Stack

| Outil | Usage |
|---|---|
| React 19 + Vite | Framework + bundler |
| TypeScript (`strict`) | Typage statique |
| React Router 7 | Routing SPA, pages chargées en `React.lazy()` |
| Axios | Client HTTP unique (`shared/services/apiClient`) |
| SCSS Modules | Styles de tous les composants, admin compris (section 4) |
| shadcn/ui (Radix) | Composants d'interface de l'admin (`shared/components/ui/`) |
| Tailwind v4 | Uniquement à l'intérieur des composants shadcn |
| FullCalendar | Calendriers (réservation, planning) |
| Google Maps JS API | Autocomplete d'adresse (section 7) |
| Prettier | Formatage, configuration `.prettierrc` à la racine du dépôt |

**Tests :** aucun test frontend (décision ouverte, consignée dans le Journal de
développement du vault). Un changement de comportement se vérifie à la main.

---

## 2. Structure

```
src/
├── app/
│   ├── providers/<nom>Context/   # un contexte global = 4 éléments :
│   │                             #   <nom>.context.ts (createContext),
│   │                             #   <Nom>Context.tsx (Provider),
│   │                             #   use<Nom>.ts (hook d'accès), types/
│   ├── router/                   # ProtectedRoute
│   ├── styles/                   # SCSS global, tokens du design system, tailwind.css
│   ├── App.tsx                   # routes, pages en lazy()
│   └── main.tsx
├── assets/
├── features/<nom>/               # une fonctionnalité métier
│   ├── components/<Composant>/   # <Composant>.tsx + <Composant>.module.scss
│   ├── hooks/                    # use<Quelque chose>.ts
│   ├── services/                 # <nom>Service.ts
│   ├── types/                    # <nom>.types.ts
│   └── utils/                    # fonctions pures (optionnel)
├── pages/                        # une page = une route, orchestre des features
└── shared/
    ├── components/               # composants génériques ; ui/ = shadcn (généré)
    ├── hooks/                    # useAsyncData, usePagination, useIsMobile…
    ├── services/                 # apiClient (instance Axios + intercepteurs)
    ├── types/                    # types transverses
    └── utils/                    # apiError, cn, timeUtils…
```

- Spécifique à une fonctionnalité → `features/<nom>/` ; réutilisé par plusieurs →
  `shared/`.
- Pas de `app/config/` : les variables d'environnement se lisent par
  `import.meta.env.VITE_*`. Pas de React Query : les appels passent par le schéma de
  la section 5.

---

## 3. Conventions de code

**Nommage :**

| Élément | Convention | Exemple |
|---|---|---|
| Composant | `PascalCase`, un dossier par composant | `ForfaitFormDialog/ForfaitFormDialog.tsx` |
| Props | `interface <Composant>Props` | `interface ForfaitFormDialogProps` |
| Hook | `use` + `camelCase` | `useAdminForfaits.ts` |
| Service | objet `<nom>Service` | `adminForfaitsService.ts` |
| Fichier de types | `<nom>.types.ts` | `forfaits.types.ts` |
| Type d'une réponse API | nom de la ressource, sans suffixe | `Forfait`, `AdminUser`, `PaginatedUsers` |
| Corps de requête | suffixe `Payload` | `CreateZonePayload` |
| Paramètres d'URL | suffixe `Params` | `GetUsersParams` |
| Classe CSS (module) | `camelCase` | `.headerWrapper` |

- Données : `type` ; props de composant : `interface`. Pas de préfixe `I`.

**Exports :** composants en `export function` nommé. Les **pages** sont les seules en
`export default`, parce que `React.lazy()` l'exige.

**TypeScript :** `strict`, jamais `any`. Pas de transtypage forcé (`as { … }`) pour
lire une erreur : `getApiErrorMessage` ou `axios.isAxiosError` (section 5).

**Composants :** fonctionnels, une responsabilité. Viser moins de 150 lignes ;
plusieurs composants existants dépassent : on les découpe quand on les modifie, pas
dans un lot à part.

**Formatage :** `npm run format` (Prettier, configuration racine : 4 espaces,
guillemets simples, virgules finales). `npm run format:check` doit passer avant un
commit. Les composants `shared/components/ui/` ne sont pas formatés (code généré).

---

## 4. Styles et design system

Valeurs du design system : `CLAUDE.md` racine et `src/app/styles/_variables.scss`.
**Toujours consulter `_variables.scss` avant d'écrire un style ; jamais de valeur en
dur.**

**SCSS Modules partout**, admin compris :
- un `<Composant>.module.scss` colocalisé par composant ;
- variables importées par chemin relatif vers `app/styles/index`, par exemple depuis
  `src/features/auth/components/LoginForm/` :
  `@use '../../../../app/styles/index' as *;` ;
- jamais de style global dans un module (uniquement dans `global.scss`) ;
- `composes` seulement à l'intérieur d'un même fichier : entre deux modules
  SCSS, Vite lit le fichier cible comme du CSS brut, sans le compiler, et le
  build échoue. Entre deux modules, recopier la règle (exemple :
  `admin/components/planning/ModeleEdition`).

**Admin — shadcn/ui :** les écrans d'administration utilisent les composants de
`shared/components/ui/` (`Dialog`, `Table`, `Tabs`, `Pagination`, `Button`). Ils
sont stylés par une classe de module passée en `className`. Tailwind ne sert qu'à
l'intérieur de ces composants : **pas de classes Tailwind dans nos propres
composants.** Deux feuilles :
- `app/styles/shadcn.css` : utilitaires Tailwind et variables shadcn, **sans
  preflight**. À importer par tout composant hors admin qui utilise un composant
  shadcn (exemple : `user/components/DeleteAccountSection`) ;
- `app/styles/tailwind.css` : `shadcn.css` + preflight, importée **uniquement** par
  `AdminLayout`. Le preflight remettrait à zéro les styles SCSS du site client.

Ajout d'un composant : CLI shadcn (`components.json`), helper `cn` dans
`shared/utils/cn`.

**Couleurs d'état :** `$color-error` pour les messages d'erreur (classe `.error`),
`$color-danger` pour les actions destructrices et les signaux de conflit,
`$color-warning` pour les avertissements. Jamais la valeur hexadécimale dans un
composant.

**Constantes d'affichage partagées :** une correspondance utilisée à plusieurs
endroits (couleur de zone → code hexadécimal…) vit dans un seul fichier de `shared/`.
Ses valeurs viennent de la spec.
- **Couleur d'une zone** : `shared/utils/couleursZones.ts`. Toujours afficher
  `couleurAffichee(zone)` (gris si la zone est inactive), jamais la couleur
  enregistrée directement ; l'API ne transmet que le nom de la couleur.

**Styles inline :** seulement pour une valeur calculée à l'exécution (variable CSS,
durée d'animation).

**Composants UI clés de la maquette :** `Header` (états `unauthenticated` |
`authenticated`), `MobileMenu` (drawer orange), `AddressBlock` (Autocomplete + CTA),
`Footer` (fond mocha, liens légaux, copyright).

### Règles d'interface (uniformisation)

Une même action a **le même libellé, la même forme et la même place** partout dans
l'application. Avant de créer ou de modifier un composant : appliquer ces règles ;
un composant existant qui s'en écarte est corrigé quand on le touche. Une règle
manque ou ne convient pas : la proposer à Yannick, puis l'ajouter ici.

**Revenir, annuler, étape précédente** — trois actions distinctes :

| Action | Libellé | Forme et place |
|---|---|---|
| Quitter l'écran pour l'écran parent | « ← Retour » | Lien texte (couleur `$color-text-label`, souligné au survol), **en haut à gauche, au-dessus du titre**. Jamais de doublon en bas de l'écran |
| Abandonner une saisie (formulaire, dialogue) | « Annuler » | Bouton secondaire, **en bas, juste à gauche** du bouton principal |
| Étape précédente d'un tunnel (réservation) | « Retour » | Lien texte souligné (`$color-text-label`), **sous** le bouton principal de l'étape (mobile d'abord) |

- Exception : quand l'action principale est elle-même une annulation
  (« Confirmer l'annulation »), le bouton de renoncement s'appelle « Retour »,
  pour ne pas afficher deux « Annuler ».
- Références : `admin/components/planning/ModeleForm` (retour et
  annuler), `reservation/components/CreneauSelector` (étape précédente).

---

## 5. Données, appels API et état

**Schéma obligatoire :** `Composant → Hook → Service → API`. Un composant n'importe
jamais un service ni `apiClient`.

**Service :** un objet nommé, `async/await`, retourne `r.data`. Référence :
`features/admin/services/adminUsersService.ts`.

```typescript
export const featureService = {
    async getAll(): Promise<Feature[]> {
        const r = await apiClient.get<Feature[]>('/endpoint');
        return r.data;
    },
};
```

**Charger une donnée : `shared/hooks/useAsyncData`.** Aucun hook ne gère son
chargement à la main.

```typescript
const loadForfaits = () => adminForfaitsService.getAll(); // hors du composant

export function useAdminForfaits() {
    const { data: items, isLoading, error, reload } = useAsyncData<Forfait[]>(
        loadForfaits, [], 'Impossible de charger les forfaits.',
    );
    const createItem = async (payload: ForfaitPayload) => {
        await adminForfaitsService.create(payload);
        reload(); // recharge après une modification
    };
    return { items, isLoading, error, createItem };
}
```

- Le **loader doit être stable** : défini hors du composant, ou en `useCallback` avec
  ses dépendances (filtres, page, identifiant). Quand elles changent, la donnée est
  rechargée et `isLoading` repasse à `true` tout seul.
- `{ enabled: false }` suspend le chargement (dialogue fermé, utilisateur non
  connecté).
- Référence avec filtres : `features/admin/hooks/useAdminUsers.ts`.

**Déclencher une action** (connexion, envoi de formulaire, suppression) : état local
`isLoading` / `error` modifié **dans la fonction appelée par l'événement**. Référence :
`features/user/hooks/useUpdateProfile.ts`.

**Erreurs de l'API :** `getApiErrorMessage(err, 'Message par défaut')`
(`shared/utils/apiError`) dans le `catch`. Il gère le message unique d'une exception
métier et la liste de messages du `ValidationPipe`.

**Effets et état (règle `react-hooks/set-state-in-effect`, imposée par le lint) :**
- jamais de `setState` synchrone dans un `useEffect` ; un effet sert à se
  synchroniser avec l'extérieur (API, DOM, abonnement) ;
- un état qui découle d'une action de l'utilisateur se modifie dans le gestionnaire
  d'événement (référence : `selectCycle` dans `cycle/components/MesCycles`) ;
- ce qui se calcule à partir d'autres données ne se stocke pas : on le calcule au
  rendu ;
- **formulaire dans un dialogue :** l'état vit dans un sous-composant rendu dans
  `<DialogContent>`, que Radix démonte à la fermeture ; il s'initialise par
  `useState(() => …)` à chaque ouverture. Référence :
  `admin/components/forfaits/ForfaitFormDialog`.

---

## 6. Authentification

- `access_token` et `refresh_token` en cookies `HttpOnly`, inaccessibles au
  JavaScript. Renouvellement silencieux par l'intercepteur de `apiClient`.
- Session et rôle via `useAuth()` (`app/providers/authContext`).
- Routes protégées : `ProtectedRoute` (`app/router/ProtectedRoute.tsx`) avec `roles`.

---

## 7. Google Maps

- Uniquement `@googlemaps/js-api-loader` (pas `@react-google-maps/api`).
- Autocomplete limité à la France (`componentRestrictions: { country: 'fr' }`).
- Une adresse sélectionnée est décomposée (`numero`, `rue`, `codePostal`, `ville`,
  `latitude`, `longitude`, `googlePlaceId`) avant envoi : jamais d'adresse brute.
  Implémentation : `features/adresse/hooks/useAddressAutocomplete.ts`.

---

## 8. Maquettes — vault puis Figma

**Écrans V2 :** wireframes et maquettes de travail dans le vault
(`2. Conception/4. Wireframes/` : `planning 2.0`, `intervention 2.0` ;
`2. Conception/5. Maquettes/` : `Maquette-planning 2.0`). Les lire avant
d'implémenter un écran V2 : ils fixent la structure et le parcours.

**Espace technicien :** mobile d'abord (usage terrain), desktop ensuite.

**MCP Figma** (valeurs visuelles des composants existants) : consulter la maquette,
extraire les valeurs exactes, implémenter en SCSS Modules, signaler toute
incohérence entre maquette, wireframe du vault et design system.

---

## 9. Points d'attention

- **Responsive first** : mobile, puis desktop.
- **Accessibilité** : attributs ARIA, HTML sémantique, focus visible.
- **Variables d'environnement** préfixées `VITE_` ; jamais de clé API en dur.

---

## 10. Avant de commiter

Depuis `Frontend/` :
```bash
npm run lint          # aussi lancé par le hook pre-commit et la CI
npm run format:check
npm run build         # type-check + build Vite
```
