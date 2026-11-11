---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
## Prisma, en une image

Prisma, c'est un traducteur entre ton code TypeScript et PostgreSQL. Tu décris tes tables une fois dans un fichier (`schema.prisma`), et Prisma te génère un "client" — un objet JS avec des méthodes typées (`prisma.forfait.findMany()`, `prisma.forfait.create()`...) qui écrivent le SQL à ta place, avec autocomplétion et vérification de types.

Le cycle de vie a 3 étapes distinctes qu'il ne faut jamais confondre :

1. **Tu modifies** `Backend/prisma/schema.prisma` (tu ajoutes/changes un champ)
2. **Tu migres** → Prisma génère le SQL et l'applique en base
3. **Tu régénères le client** → les types TypeScript se mettent à jour

## L'exemple : le module Forfaits

Un `Forfait` (ex: "Révision complète", 45 min), c'est le modèle le plus simple du projet. Son schéma :

```prisma
// Backend/prisma/schema.prisma
model Forfait {
  id              String    @id @default(uuid())
  nom             String    @unique
  description     String?
  duree_minutes   Int
  is_actif        Boolean   @default(true)
  date_creation   DateTime  @default(now())
  historique_prix HistoriquePrixForfait[]
  interventions   Intervention[]
}
```

`historique_prix` et `interventions` ne créent **aucune colonne** — ce sont des relations "virtuelles" que Prisma résout via des clés étrangères ailleurs (côté `HistoriquePrixForfait`).

Maintenant, où ce modèle est utilisé — et c'est là que la Clean Architecture du projet prend tout son sens : **Prisma n'apparaît qu'à un seul endroit**, jamais dans la logique métier.

**[forfaits.repository.interface.ts](vscode-webview://0jo5apu4joq5a9b37foo7h107vqhvuheo8crs3i2eqpqe8t7h55f/Backend/src/features/forfaits/repositories/forfaits.repository.interface.ts)** — le contrat, zéro dépendance Prisma :

```ts
interface IForfaitsRepository {
  findAllActifs(): Promise<ForfaitDto[]>;
  create(data: CreateForfaitData): Promise<ForfaitDto>;
  // ...
}
```

**[forfaits.prisma.repository.ts](vscode-webview://0jo5apu4joq5a9b37foo7h107vqhvuheo8crs3i2eqpqe8t7h55f/Backend/src/features/forfaits/repositories/forfaits.prisma.repository.ts)** — la seule classe qui parle à Prisma :

```ts
async findAllActifs(): Promise<ForfaitDto[]> {
  const forfaits = await this.prisma.forfait.findMany({
    where: { is_actif: true },
    orderBy: { nom: 'asc' },
    include: {
      historique_prix: { where: { date_fin: null }, take: 1 }, // le prix courant
    },
  });
  return forfaits.map((f) => this.toDto(f)); // jamais le modèle Prisma brut en sortie
}
```

Le `use-case` (`GetForfaitsActifsUseCase`) injecte `IForfaitsRepository`, pas `ForfaitsPrismaRepository`. Il ne sait même pas que Prisma existe — si demain HomeCycl'Home passait sur un microservice HTTP pour ce module, seul ce fichier repository changerait.

**Le passage le plus intéressant** : `setPrix()`, qui utilise une transaction Prisma pour clôturer l'ancien prix et créer le nouveau de façon atomique (sinon on pourrait se retrouver avec deux prix "actifs" en même temps si le serveur crashe entre les deux écritures) :

```ts
async setPrix(forfaitId: string, montant: number, dateDebut: Date) {
  await this.prisma.$transaction(async (tx) => {
    await tx.historiquePrixForfait.updateMany({
      where: { forfait_id: forfaitId, date_fin: null },
      data: { date_fin: dateDebut },
    });
    await tx.historiquePrixForfait.create({
      data: { forfait_id: forfaitId, montant, date_debut: dateDebut },
    });
  });
}
```

C'est le même principe que la règle "créer une intervention + marquer le créneau indisponible" du [CLAUDE.md Backend](vscode-webview://0jo5apu4joq5a9b37foo7h107vqhvuheo8crs3i2eqpqe8t7h55f/Backend/CLAUDE.md) : `$transaction` garantit que les deux écritures réussissent ensemble, ou aucune.

## Les commandes utiles (depuis `Backend/`)

| Commande                                      | Quand l'utiliser                                                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `npx prisma migrate dev --name ajout_champ_x` | Après avoir modifié `schema.prisma` en dev : crée le fichier SQL de migration ET l'applique                                  |
| `npx prisma generate`                         | Régénère le client TS (types) — lancé automatiquement par `migrate dev`, mais utile après un `git pull` qui touche le schéma |
| `npx prisma studio`                           | Ouvre une UI web pour voir/éditer les données en base, pratique pour débugger                                                |
| `npx prisma migrate deploy`                   | Applique les migrations en staging/prod (jamais `migrate dev` en prod — il peut demander à réinitialiser la base)            |
| `npx prisma db pull`                          | Inverse : regénère `schema.prisma` à partir d'une base existante (rarement utile ici, le schéma est la source de vérité)     |

**Le piège classique** : modifier `schema.prisma` et oublier `migrate dev` → l'app compile mais crashe au runtime (colonne introuvable en base). C'est pour ça qu'il ne faut jamais éditer `generated/prisma/` à la main — ce dossier est entièrement régénéré, toute modif y est perdue au prochain `generate`.

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
