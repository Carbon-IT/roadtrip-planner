# roadtrip-planner — CLAUDE.md

## Stack

- **Runtime**: Node.js 21
- **Language**: TypeScript (strict, NodeNext modules)
- **Framework**: Express 5
- **Runner**: `tsx`
- **Auth**: JWT via `jsonwebtoken`
- **Data**: local JSON file (`data/roadtrip.json`)
- **Docs**: Swagger UI (`/api-docs`)

## Running the project

```bash
# Requires a .env file with ACCESS_TOKEN_SECRET, LOGIN, PASSWORD
npm start          # tsx src/index.ts
npm run typecheck  # tsc --noEmit (type checking only)
```

## Structure

```
src/
  index.ts                    # Entry point: Express app + route mounting
  constants.ts                # Fields exported to the restcountries API
  utils/
    fileStorage.ts            # Read/write data/roadtrip.json
    randomizer.ts             # Fisher-Yates on countries (returns OrderedCountry[])
  model/
    country.model.ts          # Country interface (matches restcountries shape)
    roadtrip.model.ts         # Roadtrip class (countries: string[])
  middleware/
    auth.middleware.ts        # authenticateToken + global Express.Request.user declaration
  controllers/
    auth.controller.ts        # POST /api/login, POST /api/logout
    countries.controller.ts   # GET /api/countries, /name/:name, /codes, /codes/:code
    roadtrip.controller.ts    # CRUD /api/roadtrip and /api/roadtrip/countries
data/
  countries.json              # Local country list (source of truth for GET /api/countries)
```

## Conventions

- Each controller exports an Express `Router` mounted in `index.ts` under `/api/*`.
- Shared response types (e.g. `PaginatedResponse<T>`) are defined in the controller that uses them.
- Environment variable validation happens at startup in `index.ts`; controllers access `process.env` directly.
- `import.meta.dirname` is used to resolve absolute file paths.
- Local module imports use the `.js` extension (required with `moduleResolution: NodeNext`).
- `tsconfig.json` has `noEmit: true`: TypeScript does not generate `.js` files. The project runs entirely via `tsx`.

## Data

- `data/countries.json`: local country list (source of truth for `GET /api/countries`)
- `data/roadtrip.json`: auto-created on startup if absent; contains `{ countries: string[] }` (cca3 codes) — git-ignored
- The external API `restcountries.com/v3.1` is used for search by name and by code.
