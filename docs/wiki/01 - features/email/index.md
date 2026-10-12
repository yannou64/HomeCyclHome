---
excalidraw-plugin: parsed
excalidraw-open-md: true
---
# Feature — Email

**Statut** : ✅ Complet

## Description

Service technique d'envoi d'emails transactionnels (confirmation d'inscription,
confirmation d'intervention) via `@nestjs-modules/mailer` / SMTP (Mailpit en dev). Pas de
controller — module de service pur, consommé par `auth` et `intervention`. Feature
réduite/technique, pas de règles métier propres.

## Fichiers Backend

- Module : `Backend/src/features/email/email.module.ts` (configure `MailerModule.forRoot` avec `MAIL_HOST/PORT/USER/PASS/FROM`)
- Service : `email.service.ts` (`sendConfirmationEmail`, `sendInterventionConfirmationEmail`)
- Tests : aucun (0 spec)

## Fichiers Frontend

- N/A — service backend uniquement, aucune contrepartie frontend

## Endpoints API

Aucun (pas de controller).

## Entités Prisma liées

Aucune.

## Dépendances avec d'autres features

- Consommé par `auth` (register) et `intervention` (création, best-effort non bloquant)

## Diagrammes

_Non applicable — service technique sans parcours utilisateur dédié._

%%
# Drawing
```json
{"type":"excalidraw","version":2,"source":"https://excalidraw.com","elements":[],"appState":{"gridSize":null,"viewBackgroundColor":"#ffffff"},"files":{}}
```
%%
