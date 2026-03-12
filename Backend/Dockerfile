# ---- STAGE 1 : BUILD ----
# On part d'une image Node légère pour compiler le TypeScript
FROM node:24-alpine AS builder

WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe toutes les dépendances (dev incluses, nécessaires pour compiler)
RUN npm ci

# Copie le code source
COPY . .

# Compile le TypeScript en JavaScript (génère le dossier dist/)
RUN npm run build

# ---- STAGE 2 : IMAGE FINALE ----
# On repart d'une image Node vierge et légère
FROM node:24-alpine

WORKDIR /app

# Copie uniquement le code compilé depuis le stage builder
COPY --from=builder /app/dist ./dist

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe UNIQUEMENT les dépendances de production
# (pas Jest, ESLint, TypeScript etc.)
RUN npm ci --only=production

# Indique que le conteneur écoute sur le port 3000
EXPOSE 3000

# Commande de démarrage de l'application
CMD ["node", "dist/src/main"]