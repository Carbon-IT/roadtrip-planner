# roadtrip-planner — CLAUDE.md

## Stack

- **Runtime**: Node.js 21
- **Language**: TypeScript (strict, NodeNext modules)
- **Framework**: Express 5
- **Runner**: `tsx`
- **Auth**: JWT via `jsonwebtoken`
- **Data**: fichier JSON local (`data/roadtrip.json`)
- **Docs**: Swagger UI (`/api-docs`)

## Lancer le projet

```bash
# Requires a .env file with ACCESS_TOKEN_SECRET, LOGIN, PASSWORD
npm start          # tsx src/index.ts
npm run typecheck  # tsc --noEmit (vérification des types uniquement)
```

## Structure

```
src/
  index.ts                    # Point d'entrée : app Express + montage des routes
  constants.ts                # Champs exportés vers l'API restcountries
  utils/
    fileStorage.ts            # Lecture/écriture de data/roadtrip.json
    randomizer.ts             # Fisher-Yates sur les pays (retourne OrderedCountry[])
  model/
    roadtrip.model.ts         # Classe Roadtrip (countries: string[])
  middleware/
    auth.middleware.ts        # authenticateToken + déclaration globale Express.Request.user
  controllers/
    auth.controller.ts        # POST /api/login, POST /api/logout
    countries.controller.ts   # GET /api/countries, /name/:name, /codes, /codes/:code
    roadtrip.controller.ts    # CRUD /api/roadtrip et /api/roadtrip/countries
data/
  countries.json              # Liste locale de pays (source de vérité pour GET /api/countries)
```

## Conventions

- Chaque controller exporte un `Router` Express monté dans `index.ts` via `/api/*`.
- Les types de réponse partagés (ex. `PaginatedResponse<T>`) sont définis dans le controller qui les utilise.
- La validation des variables d'environnement se fait au démarrage dans `index.ts` ; les controllers accèdent à `process.env` directement.
- `import.meta.dirname` est utilisé pour résoudre les chemins fichiers absolus.
- Les imports de modules locaux utilisent l'extension `.js` (obligatoire avec `moduleResolution: NodeNext`).
- `tsconfig.json` a `noEmit: true` : TypeScript ne génère pas de fichiers `.js`. Le projet tourne entièrement via `tsx`.

## Données

- `data/countries.json` : liste locale de pays (source de vérité pour `GET /api/countries`)
- `data/roadtrip.json` : créé automatiquement au démarrage si absent ; contient `{ countries: string[] }` (codes cca3) — ignoré par git
- L'API externe `restcountries.com/v3.1` est utilisée pour les recherches par nom et par code.
