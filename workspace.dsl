workspace "HomeCycl'Home" "Modèle C4 — Contexte et Conteneurs" {

    model {
        # Acteurs (Person)
        client     = person "Client"     "Réserve une intervention"
        technicien = person "Technicien" "Réalise l'intervention"
        admin      = person "Admin"      "Configure et supervise"

        # Système central, décomposé en conteneurs (niveau 2)
        homeCyclHome = softwareSystem "HomeCycl'Home" "Réservation d'interventions de réparation et entretien de vélos à domicile" {

            spa = container "Application Web" "Recherche, réservation et suivi des interventions" "React 18 + Vite + TypeScript" {

                router = component "Router" "Définit les routes, protège les pages selon le rôle (ProtectedRoute), lazy-load les pages" "React Router"

                pages = component "Pages" "Orchestrent les composants de features pour composer un écran (1 fichier = 1 route)" "React"

                globalProviders = component "Providers globaux" "État transverse partagé entre features : session utilisateur, wizard de réservation multi-étapes" "React Context (AuthContext, ReservationContext)"

                sharedUI = component "Composants partagés" "UI générique réutilisable entre features (Header, Footer, CTAButton, Card...)" "React + shadcn/ui"

                apiClient = component "Client HTTP" "Instance Axios centralisée : baseURL, cookies, intercepteur de refresh automatique sur 401" "Axios"

                # Pattern répété à l'identique dans chaque feature :
                # auth, adresse, cycle, forfait, reservation, intervention, user, admin
                group "Module Feature (pattern répété x8)" {
                    featureComponents = component "Composants Feature" "UI spécifique à une fonctionnalité (ex: LoginForm, CreneauSelector, AuthStep...)" "React + SCSS Modules"

                    featureHooks = component "Hooks Feature" "Logique d'état, orchestre l'appel au service (ex: useLogin, useCreneaux...)" "React Hooks"

                    featureServices = component "Services Feature" "Appelle l'API et retourne des données typées (ex: authService, reservationService...)" "Objet async/await"
                }
            }

            api = container "API Backend" "Expose l'API REST, applique les règles métier, gère l'authentification JWT/RBAC" "NestJS + TypeScript" {

                guards = component "Guards" "Authentification JWT (JwtAuthGuard) et contrôle des rôles (RolesGuard)" "NestJS Guards + Passport"

                prismaService = component "PrismaService" "Point d'accès unique à la base de données, injecté dans tous les repositories" "Prisma Client"

                emailService = component "Service Email" "Envoi d'emails transactionnels (confirmation de compte, notifications...)" "Nodemailer (@nestjs-modules/mailer)"

                storageService = component "Service Storage" "Upload et lecture des photos d'intervention" "AWS SDK S3"

                # Pattern répété à l'identique dans chaque module métier :
                # admin, adresses, affectations, auth, cycle, forfaits,
                # intervention, planning, referentiel, users, zones
                group "Module Feature (pattern répété x11)" {
                    controllers = component "Controllers" "Reçoit la requête HTTP, valide via DTO, délègue au use case — aucune logique métier" "NestJS Controllers"

                    useCases = component "Use Cases" "Logique métier : une classe = une opération (ex: CreateInterventionUseCase)" "TypeScript"

                    repositories = component "Repositories" "Interface + implémentation Prisma, découplées via token d'injection" "Prisma"
                }
            }

            db = container "Base de données" "Utilisateurs, zones, créneaux, interventions, paiements..." "PostgreSQL 16" "Database"
        }

        # Systèmes externes (tag "External" pour le style, cf. bloc styles)
        gmaps = softwareSystem "Google Maps Platform" "Autocomplete d'adresse (Places) + affichage carte et dessin de zones (Maps JS)" "External"
        smtp  = softwareSystem "Serveur SMTP"          "Envoi d'emails (best-effort)" "External"
        s3    = softwareSystem "AWS S3"                "Stockage des photos (best-effort)" "External"

        # Relations utilisateurs -> conteneur SPA
        # (implique automatiquement client -> homeCyclHome pour la vue de contexte)
        client     -> spa "Utilise" "HTTPS"
        technicien -> spa "Utilise" "HTTPS"
        admin      -> spa "Utilise" "HTTPS"

        # Relations entre composants de l'API
        # (implique automatiquement api -> db / api -> smtp / api -> s3 au niveau conteneur)
        controllers -> guards    "Protège via"
        controllers -> useCases  "Délègue à"

        useCases -> repositories   "Appelle"
        useCases -> emailService   "Envoie des emails (ex: confirmation de compte, register/create-intervention)"
        useCases -> storageService "Stocke / lit les photos (ex: upload-intervention-photos)"

        repositories -> prismaService "Exécute les requêtes via" "Prisma Client"

        prismaService -> db  "Lit / écrit les données" "SQL/TCP"
        emailService  -> smtp "Envoie emails"                "SMTP"
        storageService -> s3  "Stocke / récupère les photos" "AWS SDK"

        # Relations entre composants de la SPA
        # (implique automatiquement spa -> api / spa -> gmaps au niveau conteneur)
        client     -> router "Utilise" "HTTPS"
        technicien -> router "Utilise" "HTTPS"
        admin      -> router "Utilise" "HTTPS"

        router -> pages          "Route vers"
        router -> globalProviders "Vérifie l'authentification et le rôle (ProtectedRoute)"

        pages -> featureComponents "Compose l'écran à partir de"

        featureComponents -> featureHooks  "Délègue la logique à"
        featureComponents -> sharedUI      "Réutilise"
        featureComponents -> globalProviders "Consomme (contexte)"
        featureComponents -> gmaps "Affichage carte + dessin de zones (composant dédié, ex: ZoneMapDrawer — feature admin)" "Maps JavaScript API"

        featureHooks -> featureServices "Appelle"
        featureHooks -> gmaps "Autocomplete + décomposition d'adresse (hook dédié, ex: useAddressAutocomplete)" "Places API"

        featureServices -> apiClient "Effectue les requêtes via"

        apiClient -> controllers "Fait des appels API" "JSON/HTTPS"

        # ==================================================
        # Modèle de déploiement (niveau 4)
        # Un seul VPS héberge deux stacks Docker Compose isolées
        # (réseaux distincts), distribuées par un unique Nginx hôte
        # qui route selon le nom de domaine.
        # ==================================================

        vps = deploymentEnvironment "VPS" {
            # Un groupe par stack : empêche Structurizr de relier
            # les instances d'un environnement à celles de l'autre
            # (ex: spa du staging vers api de la prod)
            stagingGroup = deploymentGroup "Staging"
            prodGroup    = deploymentGroup "Production"

            deploymentNode "VPS Ubuntu" "Hôte unique, partagé entre les deux environnements" "Linux Ubuntu + Docker Engine" {
                hostNginx = infrastructureNode "Nginx hôte + Certbot" "Reverse proxy public unique, terminaison SSL (Let's Encrypt), route selon le nom de domaine" "Nginx (hôte, hors Docker)"

                deploymentNode "Stack Docker Compose — Staging" "Réseau bridge isolé : staging_network" "Docker Compose" {
                    stagingReverseProxy = infrastructureNode "Nginx (reverse proxy interne)" "Route / vers le frontend, /api vers le backend" "nginx:alpine — 127.0.0.1:8080->80"

                    stagingSpaInstance = containerInstance spa stagingGroup
                    stagingApiInstance = containerInstance api stagingGroup
                    containerInstance db stagingGroup
                }

                deploymentNode "Stack Docker Compose — Production" "Réseau bridge isolé : prod_network" "Docker Compose" {
                    prodReverseProxy = infrastructureNode "Nginx (reverse proxy interne)" "Route / vers le frontend, /api vers le backend" "nginx:alpine — 127.0.0.1:8081->80"

                    prodSpaInstance = containerInstance spa prodGroup
                    prodApiInstance = containerInstance api prodGroup
                    containerInstance db prodGroup
                }
            }

            hostNginx -> stagingReverseProxy "Forward vers 127.0.0.1:8080 — staging.homecyclhome.yannickbiot.fr" "HTTP"
            hostNginx -> prodReverseProxy    "Forward vers 127.0.0.1:8081 — homecyclhome.yannickbiot.fr"          "HTTP"

            stagingReverseProxy -> stagingSpaInstance "Sert les fichiers statiques" "HTTP"
            stagingReverseProxy -> stagingApiInstance "Route /api/*"               "HTTP/JSON"

            prodReverseProxy -> prodSpaInstance "Sert les fichiers statiques" "HTTP"
            prodReverseProxy -> prodApiInstance "Route /api/*"               "HTTP/JSON"
        }
    }

    views {
        systemContext homeCyclHome "Contexte" "Vue de contexte — HomeCycl'Home" {
            include *
        }

        container homeCyclHome "Conteneurs" "Vue conteneurs — HomeCycl'Home" {
            include *
        }

        component spa "ComposantsFrontend" "Vue composants — Application Web" {
            include *
        }

        component api "ComposantsBackend" "Vue composants — API Backend" {
            include *
        }

        deployment homeCyclHome vps "Deploiement" "Vue déploiement — VPS (Staging + Production)" {
            include *

            # spa -> api est une dépendance logique (JS exécuté dans le navigateur),
            # pas un appel réseau conteneur-à-conteneur : en réalité tout passe par
            # le reverse proxy. On retire la relation d'instance auto-générée pour
            # ne pas laisser croire à un appel direct frontend -> backend.
            exclude "stagingSpaInstance -> stagingApiInstance"
            exclude "prodSpaInstance -> prodApiInstance"
        }

        styles {
            element "Person" {
                shape Person
                background #F97316
                color #ffffff
            }
            element "Software System" {
                background #4F3B30
                color #ffffff
            }
            element "External" {
                background #999999
                color #ffffff
            }
            element "Container" {
                background #4F3B30
                color #ffffff
            }
            element "Database" {
                shape Cylinder
            }
            element "Component" {
                background #F4FBF5
                color #4F3B30
            }
            element "Group" {
                color #4F3B30
                strokeWidth 3
            }
            element "Infrastructure Node" {
                background #666666
                color #ffffff
            }
            element "Deployment Node" {
                color #4F3B30
            }
        }
    }

}
