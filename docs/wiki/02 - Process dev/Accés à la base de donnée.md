---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# En local
DATABASE_URL="postgresql://yannickbiot@localhost:5432/homecycl"
user : yannickbiot
dbname: homecycl

Pour lancer psql dans le terminal :
````bash
psql "postgresql://yannickbiot@localhost:5432/homecycl"
````
# En production
POSTGRES_DB=homecyclhome
POSTGRES_USER=admin
POSTGRES_PASSWORD=touchePasAuBisBi5690

Pour lancer psql dans le terminal :
```bash
docker exec -it homecyclhome_prod_db psql -U admin -d homecyclhome
```
# En staging
POSTGRES_DB=homecyclhome
POSTGRES_USER=admin
POSTGRES_PASSWORD=touchePasAuBisBi5690

Pour lancer psql dans le terminal :
````bash
docker exec -it homecyclhome_staging_db psql -U admin -d homecyclhome
````
# Commandes utiles
**Une fois connecté — navigation**

```
\l                  -- lister toutes les bases de données
\c nom_dbname       -- se connecter à une autre base
\dt                 -- lister les tables de la base courante
\d nom_table        -- afficher la structure d'une table (colonnes, types, clés)
\d+ nom_table       -- structure détaillée (taille, description)
\du                 -- lister les rôles/utilisateurs
\dn                 -- lister les schémas
\di                 -- lister les index
```

**Requêtes utiles**

```sql
SELECT * FROM "Utilisateur" LIMIT 10;
SELECT COUNT(*) FROM "Intervention";
SELECT * FROM _prisma_migrations ORDER BY started_at DESC;

INSERT INTO "Utilisateurs" (id, nom, prenom, email, password_hash, telephone, role)
VALUES (gen_random_uuid(), 'Dupont', 'Jean', 'jean@mail.com', '<hash>', '0600000000', 'client');

UPDATE "Utilisateurs" SET is_actif = true WHERE email = 'jean@mail.com';

DELETE FROM "Utilisateurs" WHERE email = 'jean@mail.com';

CREATE TABLE "HistoriquePrixForfaits" (
    "id"         TEXT NOT NULL,
    "montant"    DECIMAL(10,2) NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin"   TIMESTAMP(3),
    "forfait_id" TEXT NOT NULL,

    CONSTRAINT "HistoriquePrixForfaits_pkey" PRIMARY KEY ("id")
);


ALTER TABLE "HistoriquePrixForfaits"
  ADD CONSTRAINT "HistoriquePrixForfaits_forfait_id_fkey"
  FOREIGN KEY ("forfait_id") REFERENCES "Forfaits"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
```
```
```

(Prisma préserve la casse des noms de modèles → toujours mettre le nom de table entre guillemets doubles s'il contient une majuscule)

**Confort d'affichage**

```
\x                  -- mode "étendu" : une colonne par ligne (pratique pour les lignes larges)
\timing             -- affiche le temps d'exécution de chaque requête
```

**Sortie**

```
\q                  -- quitter psql
```

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
