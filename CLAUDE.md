# roadtrip-planner — CLAUDE.md

## Stack

- **Runtime**: Node.js (≥ 21, requis pour `import.meta.dirname`)
- **Language**: TypeScript (strict, NodeNext modules)
- **Framework**: Express 5
- **Runner**: `tsx` (exécution directe sans compilation)
- **Auth**: JWT via `jsonwebtoken`
- **Data**: fichier JSON local (`roadtrip.json`)
- **Docs**: Swagger UI (`/api-docs`)

## Lancer le projet

```bash
# Requires a .env file with ACCESS_TOKEN_SECRET, LOGIN, PASSWORD
npm start          # tsx index.ts
npx tsc --noEmit   # vérification des types uniquement
```

## Structure

```
index.ts                    # Point d'entrée : app Express + montage des routes
constants.ts                # Champs exportés vers l'API restcountries
fileStorage.ts              # Lecture/écriture de roadtrip.json
randomizer.ts               # Fisher-Yates sur les pays (retourne OrderedCountry[])
model/
  roadtrip.model.ts         # Classe Roadtrip (countries: string[])
middleware/
  auth.middleware.ts        # authenticateToken + déclaration globale Express.Request.user
controllers/
  auth.controller.ts        # POST /api/login, POST /api/logout
  countries.controller.ts   # GET /api/countries, /name/:name, /codes, /codes/:code
  roadtrip.controller.ts    # CRUD /api/roadtrip et /api/roadtrip/countries
```

## Conventions

- Chaque controller exporte un `Router` Express monté dans `index.ts` via `/api/*`.
- Les types de réponse partagés (ex. `PaginatedResponse<T>`) sont définis dans le controller qui les utilise.
- La validation des variables d'environnement se fait au démarrage dans `index.ts` ; les controllers accèdent à `process.env` directement.
- `import.meta.dirname` est utilisé pour résoudre les chemins fichiers absolus.
- Les imports de modules locaux utilisent l'extension `.js` (obligatoire avec `moduleResolution: NodeNext`).

## Données

- `countries.json` : liste locale de pays (source de vérité pour `GET /api/countries`)
- `roadtrip.json` : créé automatiquement au démarrage si absent ; contient `{ countries: string[] }` (codes cca3)
- L'API externe `restcountries.com/v3.1` est utilisée pour les recherches par nom et par code.
