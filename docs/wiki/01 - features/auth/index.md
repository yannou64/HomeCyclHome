---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Auth

**Statut** : ✅ Complet

## Description

Authentification complète du client : inscription avec confirmation par email, connexion
(JWT access + refresh en cookies HttpOnly), déconnexion et renouvellement silencieux du
token. Les routes sensibles sont throttlées (5 req/min). Voir aussi
[[16. Le Parcours Enregistrement client]] et les fiches 17-33 pour
la construction pas à pas de cette feature.

## Fichiers Backend

- Module : `Backend/src/features/auth/auth.module.ts`
- Controller : `controllers/auth.controller.ts`
- DTOs : `dto/{login.dto.ts, register.dto.ts, auth-response.dto.ts}`
- Guard : `guards/jwt-auth.guard.ts` (extends `AuthGuard('jwt')`)
- Strategy : `strategies/jwt.strategy.ts` (lit le cookie `access_token`, peuple `req.user = {userId, role}`)
- Repository : `repositories/{auth.repository.interface.ts, auth.prisma.repository.ts}`
- Use cases : `use-cases/{register, confirm-email, login, logout, refresh-token}.use-case.ts`
- Tests : 5 specs (un par use case)

## Fichiers Frontend

- Composants : `features/auth/components/LoginForm/`, `RegisterForm/`
- Hooks : `features/auth/hooks/{useLogin, useRegister, useLogout, useConfirmEmail}.ts`
- Service : `features/auth/services/authService.ts`
- Types : `features/auth/types/auth.types.ts`
- Pages : `pages/LoginPage.tsx`, `pages/RegisterPage.tsx`, `pages/ConfirmEmailPage.tsx`
- `useLogin`/`useLogout` consommés aussi par `shared/components/Header/Header.tsx`

## Endpoints API

| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/auth/register` | Public (throttlé 5/min) |
| GET | `/api/auth/confirm-email?token=` | Public |
| POST | `/api/auth/login` | Public (throttlé 5/min) — pose les cookies, ne retourne jamais le token en body |
| POST | `/api/auth/refresh` | Public (throttlé 5/min) — lit `refresh_token` du cookie |
| POST | `/api/auth/logout` | `JwtAuthGuard` |

## Entités Prisma liées

- `Utilisateur` (`password_hash`, `email_confirmation_token`, `token_expires_at`, `refresh_token_hash`, `is_actif`, `date_dernier_login`)

## Dépendances avec d'autres features

- Dépend de `email` (`EmailService.sendConfirmationEmail`, appelé par `RegisterUseCase`)
- `shared/guards/roles.guard.ts` et `shared/decorators/roles.decorator.ts` dépendent du type `UserRole` défini dans `features/users/dto/user-profile.dto.ts`, pas de `auth`

## Diagrammes

_À compléter (parcours inscription/connexion, séquence refresh token) — session dédiée avec Yannick._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
