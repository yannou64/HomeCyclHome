# Wiki — HomeCycl'Home

Point d'entrée de la mémoire projet. Consulter ce fichier en premier pour
s'orienter avant toute session de travail.

---

## État du projet

| Élément         | Valeur                                                       |
| --------------- | ------------------------------------------------------------ |
| Phase actuelle  | Phase 3 — Développement                                      |
| Sprint en cours | Sprint 1 — Authentification & Cycles                         |
| MVP cible       | Cycle complet Réservation → Réalisation → Paiement → Clôture |
| Déploiement     | ✅ Infrastructure en place (prod + staging)                   |
| Backend auth    | ✅ Complet et testé (register / confirm / login / logout)     |
| Frontend auth   | 🔄 En cours (RegisterForm, pages, routing)                   |

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

---

## Historique de développement

### Sprint 0 — Fondations frontend

| Fichier | Contenu |
| ------- | ------- |
| [[Historique-Dev/1. AuthContext.md]] | Architecture du contexte auth React |
| [[Historique-Dev/2. apiClient.md]] | Instance Axios partagée |
| [[Historique-Dev/3. Environnement-url.md]] | Variables d'environnement Vite |
| [[Historique-Dev/4. Composant Auth.md]] | Index des composants auth |
| [[Historique-Dev/5. Les types d'authentification.md]] | AuthSession vs payload de formulaire |
| [[Historique-Dev/6. authService.ts.md]] | Service d'appels API auth |
| [[Historique-Dev/7. Gestion des logs dans le front.md]] | Convention de logs frontend |
| [[Historique-Dev/8. Le hook useLogin.md]] | Hook orchestrateur login |
| [[Historique-Dev/9. Les protected routes.md]] | ProtectedRoute — sécuriser les routes par session et rôle |
| [[Historique-Dev/10. Composant Header.md]] | Header responsive desktop + mobile |
| [[Historique-Dev/11. Sous Composant MobileMenu.md]] | Drawer de navigation mobile |
| [[Historique-Dev/12. Composant Footer.md]] | Footer avec liens légaux |
| [[Historique-Dev/13. Composant PageLayout.md]] | Wrapper de mise en page |
| [[Historique-Dev/14. Composant Carousel.md]] | Galerie défilante |
| [[Historique-Dev/15. Composant HeroBrand.md]] | Bloc hero identitaire |

### Sprint 1 — Backend authentification

| Fichier | Contenu |
| ------- | ------- |
| [[Historique-Dev/16. Le Parcours Enregistrement client.md]] | Flux complet inscription → confirmation → connexion |
| [[Historique-Dev/17. Le shéma Prisma.md]] | Modèle Utilisateur, migrations, Prisma Studio |
| [[Historique-Dev/18. PrismaService.md]] | PrismaService injectable + DatabaseModule |
| [[Historique-Dev/19. Configuration JWT et cookies.md]] | Config JWT (access/refresh) + options cookies HttpOnly |
| [[Historique-Dev/20. EmailModule.md]] | Module email avec Nodemailer + Mailpit en dev |
| [[Historique-Dev/21. DTOs.md]] | RegisterDto, LoginDto, AuthResponseDto |
| [[Historique-Dev/22. JWT Strategy + Guard.md]] | JwtStrategy Passport + JwtAuthGuard |
| [[Historique-Dev/23. AuthService.md]] | Logique métier register / confirmEmail / login / logout |
| [[Historique-Dev/24. AuthController.md]] | Controller HTTP des routes /auth |
| [[Historique-Dev/25.AuthModule.md]] | Module NestJS assemblant toutes les pièces auth |
| [[Historique-Dev/26. Mise à jour de main.ts et AppModule.md]] | Bootstrap NestJS — cookies, CORS, validation |
| [[27. Test et Visualisation]] | Tests manuels Insomnia + Mailpit + Prisma Studio |

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
| Sprint 1 | Avril | Authentification + gestion des cycles | 🔄 En cours |
| Sprint 2 | Mai | Prestations + zones géographiques | ⏳ À venir |
| Sprint 3 | Juin | Planification + création d'interventions | ⏳ À venir |
| Sprint 4 | Juillet | Suivi, paiement, clôture | ⏳ À venir |
| Livraison | Août | Tests globaux, documentation, soutenance | ⏳ À venir |

---

## Jalons clés

- **J1** fin février — Cadrage validé ✅
- **J2** fin mars — Noyau technique opérationnel ✅
- **J3** fin avril — Authentification + cycles fonctionnels 🔄
- **J4** fin mai — Réservation possible
- **J5** fin juin — Cycle complet d'intervention
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
