# HomeCycl'Home — Frontend

Application React de HomeCycl'Home (réservation d'interventions de réparation et d'entretien de
vélos à domicile). Voir le [README racine](../README.md) pour la présentation générale du projet.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![SCSS](https://img.shields.io/badge/SCSS-Modules-CC6699?logo=sass)

## Architecture

Organisation feature-based, symétrique au découpage métier du backend, avec un flux de données
unidirectionnel strict :

```
Composant → Hook → Service → API Backend
```

```
src/
├── app/          # Noyau applicatif — router, providers globaux, styles
├── features/     # Fonctionnalités métier (components/, hooks/, services/, types/)
├── pages/        # 1 fichier = 1 route, orchestre des composants de features/
└── shared/       # Composants, hooks, services réutilisables entre features
```

Détails complets : [`CLAUDE.md`](./CLAUDE.md).

## Prérequis

- Node.js 20+
- Le backend doit tourner (voir [`../Backend/README.md`](../Backend/README.md))

## Variables d'environnement

Copier `.env.example` vers `.env` et renseigner les valeurs :

```bash
cp .env.example .env
```

| Variable                    | Description                                                        |
|------------------------------|---------------------------------------------------------------------|
| `VITE_API_URL`                | URL de base de l'API backend (ex: `http://localhost:3000/api`)     |
| `VITE_GOOGLE_MAPS_API_KEY`    | Clé API Google Maps Platform (Geocoding + Autocomplete d'adresse)  |

Toute variable d'environnement doit être préfixée `VITE_` pour être exposée au code client par
Vite. Ne jamais commit de clé API en dur — toujours via `.env`.

## Installation et lancement

```bash
npm install
npm run dev
# → Interface disponible sur http://localhost:5173
```

## Scripts disponibles

```bash
npm run dev        # serveur de développement Vite
npm run build      # build de production (tsc + vite build)
npm run preview     # prévisualisation du build de production
npm run lint         # ESLint
```

## Documentation

| Document | Contenu |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | Conventions de code, design system, structure des dossiers |
| [`../CLAUDE.md`](../CLAUDE.md) | Organisation globale du projet |
