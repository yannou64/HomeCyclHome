# ---- STAGE 1 : BUILD ----
# On part d'une image Node légère pour compiler l'application
FROM node:24-alpine AS builder

# Définit le dossier de travail dans le conteneur
WORKDIR /app

# Copie les fichiers de dépendances en premier
# (optimisation cache Docker : si pas de changement, cette étape n'est pas rejouée)
COPY package*.json ./

# Installe toutes les dépendances
RUN npm ci

# Copie le reste du code source
COPY . .

# Compile l'application React (génère le dossier dist/)
RUN npm run build

# ---- STAGE 2 : IMAGE FINALE ----
# On repart d'une image Nginx vierge et légère
FROM nginx:alpine

# Copie UNIQUEMENT les fichiers compilés depuis le stage builder
# L'image finale ne contient pas Node, npm, ni les dépendances de dev
COPY --from=builder /app/dist /usr/share/nginx/html

# Indique que le conteneur écoute sur le port 80 (documentation)
EXPOSE 80