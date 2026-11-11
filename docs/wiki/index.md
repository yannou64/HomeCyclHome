---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Wiki — HomeCycl'Home

Point d'entrée de la mémoire projet. Consulter ce fichier en premier pour
s'orienter avant toute session de travail.

---

## État du projet

| Élément                         | Valeur                                                       |
| ------------------------------- | ------------------------------------------------------------ |
| Phase actuelle                  | Phase 3 — Développement                                      |
| Sprint en cours                 | Sprint 4 — Stabilisation & sécurité (Juillet) — paiement et clôture technicien restent à livrer |
| MVP cible                       | Cycle complet Réservation → Réalisation → Paiement → Clôture |
| Déploiement                     | ✅ Infrastructure en place (prod + staging)                   |
| Auth (back + front)             | ✅ Complet                                                    |
| Profil utilisateur              | ✅ Complet                                                    |
| Administration utilisateurs     | ✅ Complet (CRUD, RBAC, pagination)                           |
| Gestion des cycles client       | ✅ Complet                                                    |
| Forfaits & historique des prix  | ✅ Complet                                                    |
| Zones géographiques             | ✅ Complet (Google Maps, polygones)                           |
| Affectations technicien/zone    | ✅ Complet                                                    |
| Planification & créneaux        | ✅ Complet (génération algorithmique 3 couches)               |
| Adresses client (profil)        | ✅ Complet (HOM-300)                                          |
| Parcours client de réservation  | ✅ Complet (HOM-290 à HOM-315)                                |
| Dashboard admin (KPI)           | ✅ Complet                                                    |
| Visualisation admin des interventions | ✅ Complet                                              |
| Upload photos d'intervention (S3) | ✅ Complet                                                  |
| Documentation API (Swagger)     | ✅ Complet (`/api-docs`)                                      |
| Sécurité (Helmet + rate limiting) | ✅ Complet                                                  |
| Paiement                        | ⏳ À venir (Sprint 4)                                         |
| Clôture technicien              | ⏳ À venir (Sprint 4)                                         |

---

## Navigation

| Fichier                              | Contenu                                                    |
| ------------------------------------ | ---------------------------------------------------------- |
| [[stack.md]]                         | Justification des choix techniques                         |
| [[architecture.md]]                  | Structure des dossiers, modules NestJS, patterns           |
| [[metier.md]]                        | Entités, règles métier, relations, contraintes             |
| [[Modèle Conceptuel de Données.md]]  | MCD complet — entités, attributs, associations             |
| [[sprint-actuel.md]]                 | État et objectifs du sprint en cours                       |
| [[log.md]]                           | Journal chronologique des décisions (append-only)          |
| [[ia.md]]                            | Configuration IA — CLAUDE.md, wiki, sous-agents, MCP Figma |
| [[01 - features/index]]                | Fiches par feature — description, fichiers, endpoints, entités |
| [Documentation API](http://localhost:3000/api-docs) | 69 endpoints — Swagger UI interactif *(lancé en local)* |

---

## Flux métier clés

Trois flux traversent plusieurs features — points d'entrée pour naviguer rapidement :

| Flux | Étapes principales | Tag Swagger | Référence |
|---|---|---|---|
| Réservation client | Validation adresse → vérification zone → sélection forfait → créneau → intervention | `Zones` · `Créneaux` · `Interventions` | [[metier.md]] |
| Génération de créneaux | Modèle de travail → pauses récurrentes → indisponibilités (3 couches) | `Administration — Planning` | [[metier.md]] |
| Upload photos d'intervention | Clôture → upload multipart → stockage AWS S3 → URLs enregistrées en base | `Interventions` | [[metier.md]] |

---

## Journal de construction

Ces 34 guides retracent, étape par étape, la construction de chaque brique technique du projet.
Ils constituent la preuve d'une démarche méthodique : chaque décision d'architecture y est justifiée, de la première ligne de code jusqu'au déploiement.

### Sprint 0 — Fondations frontend

| Fichier | Contenu |
| ------- | ------- |
| [[1. AuthContext]] | Architecture du contexte auth React |
| [[2. apiClient]] | Instance Axios partagée |
| [[3. Environnement-url]] | Variables d'environnement Vite |
| [[4. Composant Auth]] | Index des composants auth |
| [[5. Les types d'authentification]] | AuthSession vs payload de formulaire |
| [[6. authService.ts]] | Service d'appels API auth |
| [[7. Gestion des logs dans le front]] | Convention de logs frontend |
| [[8. Le hook useLogin]] | Hook orchestrateur login |
| [[9. Les protected routes]] | ProtectedRoute — sécuriser les routes par session et rôle |
| [[10. Composant Header]] | Header responsive desktop + mobile |
| [[11. Sous Composant MobileMenu]] | Drawer de navigation mobile |
| [[12. Composant Footer]] | Footer avec liens légaux |
| [[13. Composant PageLayout]] | Wrapper de mise en page |
| [[14. Composant Carousel]] | Galerie défilante |
| [[15. Composant HeroBrand]] | Bloc hero identitaire |

### Sprint 1 — Backend authentification

| Fichier | Contenu |
| ------- | ------- |
| [[16. Le Parcours Enregistrement client]] | Flux complet inscription → confirmation → connexion |
| [[17. Le shéma Prisma]] | Modèle Utilisateur, migrations, Prisma Studio |
| [[18. PrismaService]] | PrismaService injectable + DatabaseModule |
| [[19. Configuration JWT et cookies]] | Config JWT (access/refresh) + options cookies HttpOnly |
| [[20. EmailModule]] | Module email avec Nodemailer + Mailpit en dev |
| [[21. DTOs]] | RegisterDto, LoginDto, AuthResponseDto |
| [[22. JWT Strategy + Guard]] | JwtStrategy Passport + JwtAuthGuard |
| [[23. AuthService]] | Logique métier register / confirmEmail / login / logout |
| [[24. AuthController]] | Controller HTTP des routes /auth |
| [[25.AuthModule]] | Module NestJS assemblant toutes les pièces auth |
| [[26. Mise à jour de main.ts et AppModule]] | Bootstrap NestJS — cookies, CORS, validation |
| [[27. Test et Visualisation]] | Tests manuels Insomnia + Mailpit + Prisma Studio |
| [[28. Rafraîchissement silencieux du token JWT]] | Plan complet + explications du refresh silencieux — implémenté (voir suite ci-dessous) |
| [[28. Frontend, ajout de register]] | Intégration du register côté frontend |
| [[29. Hook useRegister]] | Hook orchestrateur d'inscription |
| [[30. RegisterForm]] | Composant formulaire d'inscription |
| [[31. Les routes dans Pages]] | Câblage des routes de pages |
| [[32. App.tsx]] | Point d'entrée applicatif |
| [[33. Les Tests]] | Suite de tests associée au register frontend |

---

## Acteurs du système

| Rôle | Responsabilité principale |
|---|---|
| `client` | Réserver et suivre ses interventions |
| `technicien` | Réaliser, documenter et clôturer les interventions |
| `admin` | Configurer zones, forfaits, utilisateurs, planning |

---

## Sprints planifiés

| Sprint | Période | Objectif | Statut |
|---|---|---|---|
| Sprint 0 | Mars | Fondations — DevOps, architecture, maquettage | ✅ Terminé |
| Sprint 1 | Avril | Authentification + gestion des cycles | ✅ Terminé |
| Sprint 2 | Mai | Prestations + zones géographiques | ✅ Terminé |
| Sprint 3 | Juin | Parcours client de réservation | ✅ Terminé |
| Sprint 4 | Juillet | Suivi, paiement, clôture — stabilisation technique et sécurité livrées en avance, paiement/clôture restent à faire | 🔄 En cours |
| Livraison | Août | Tests globaux, documentation, soutenance | ⏳ À venir |

---

## Jalons clés

- **J1** fin février — Cadrage validé ✅
- **J2** fin mars — Noyau technique opérationnel ✅
- **J3** fin avril — Authentification + cycles fonctionnels ✅
- **J4** fin mai — Forfaits, zones et planification configurables ✅
- **J5** fin juin — Parcours client de réservation fonctionnel ✅
- **J6** fin juillet — MVP stabilisé
- **J7** août — Livraison finale

---

## Domaines fonctionnels MVP

- Gestion des utilisateurs et authentification
- Gestion des cycles client
- Gestion des prestations (forfaits)
- Gestion des zones géographiques
- Planification des créneaux
- Gestion des interventions
- Exigences légales minimales (CGU, RGPD)

## Hors MVP (V2)

- Gestion des informations de l'entreprise
- Gestion des produits additionnels

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
