---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
**Au niveau d'un conteneur individuel**

```bash
docker stop homecyclhome_prod_backend      # arrêt propre (SIGTERM puis SIGKILL après 10s)
docker start homecyclhome_prod_backend     # relance le conteneur arrêté
docker restart homecyclhome_prod_backend   # stop + start en une seule commande
```

**Au niveau d'un service via docker compose** (recommandé, respecte les dépendances `depends_on`)

```bash
docker compose -f docker-compose.prod.yml stop backend
docker compose -f docker-compose.prod.yml start backend
docker compose -f docker-compose.prod.yml restart backend
```

**Toute la stack d'un coup**

```bash
docker compose -f docker-compose.prod.yml stop      # arrête tous les services, conteneurs conservés
docker compose -f docker-compose.prod.yml start     # relance tous les services arrêtés
docker compose -f docker-compose.prod.yml restart   # redémarre tout
```

**Différence importante avec `down` / `up`**

```bash
docker compose -f docker-compose.prod.yml down      # supprime les conteneurs (garde volumes/données)
docker compose -f docker-compose.prod.yml up -d      # recrée les conteneurs à partir des images
```

`stop`/`start` gardent le conteneur existant tel quel (rapide, pas de recréation). `down`/`up` détruisent et recréent le conteneur — utile après un changement de config ou une nouvelle image, mais recréation totale.

**Si un process système (pas Docker) bloque un port** (par ex. besoin de libérer le 5432 en local)

```bash
lsof -i :5432          # trouve le PID qui écoute sur le port
kill <PID>              # arrêt propre
kill -9 <PID>            # arrêt forcé si ça ne répond pas
```

**Voir l'état / logs**

```bash
docker compose -f docker-compose.prod.yml ps              # état des services de la stack
docker ps                                                  # tous les conteneurs actifs, toutes stacks confondues
docker compose -f docker-compose.prod.yml logs -f backend  # logs en direct d'un service
docker logs -f homecyclhome_prod_backend                   # équivalent par nom de conteneur
docker stats                                                # CPU/RAM en temps réel par conteneur
```

**Entrer dans un conteneur**

```bash
docker exec -it homecyclhome_prod_backend sh               # shell dans le backend NestJS
docker exec -it homecyclhome_prod_db psql -U <user> -d <dbname>  # psql direct dans le conteneur postgres
```

**Images**

```bash
docker images                                               # lister les images locales
docker pull ghcr.io/yannou64/homecyclhome-backend:prod      # récupérer une image précise
docker image prune -a                                       # supprimer les images non utilisées (libère de l'espace disque VPS)
```

**Build local (tester un Dockerfile avant push, depuis ton Mac)**

```bash
docker build -t homecyclhome-backend:test -f Backend/Dockerfile Backend
docker run --rm -p 3000:3000 homecyclhome-backend:test
```

**Nettoyage général (à utiliser avec prudence sur le VPS)**

```bash
docker system df                                             # espace disque utilisé par Docker
docker system prune                                          # nettoie conteneurs arrêtés, réseaux, images non taguées
```

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
