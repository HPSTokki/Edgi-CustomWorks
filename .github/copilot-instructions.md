## Quick orientation

- Repo layout: two main apps at the repository root: `BACKEND/` (Express + TypeScript + Drizzle ORM) and `FRONTEND/` (SvelteKit + Vite).
- Backend entry: `BACKEND/src/app.ts` — Express app that reads `process.env.EXPRESS_PORT`.
- DB wiring: `BACKEND/src/db.ts` and `BACKEND/src/db/index.ts` (the latter re-exports schema objects under PascalCase names).
- Migrations: `BACKEND/src/drizzle.config.ts` controls `drizzle-kit`; generate/migrate scripts are in `BACKEND/package.json`.

## What agents should know first (big picture)

- The backend is a TypeScript ESM service (see `BACKEND/package.json` with `"type": "module"`). It uses `drizzle-orm` + `pg` and expects a Postgres URL in `process.env.DB_URL`.
- The `db/index.ts` file aggregates and re-exports schema modules under explicit names (e.g. `Product`, `UserProfile`, `BarrelMaterialPricing`) — prefer editing schema files under `BACKEND/src/db/schema/` and updating exports in `db/index.ts` when adding new tables.
- Drizzle migration flow: update or add schema definitions, then run the repository's drizzle-kit scripts to generate SQL migrations into `BACKEND/src/db/migrations` and apply them.

## Concrete developer workflows (explicit)

- Generate migrations (project-provided npm script):
  - In `BACKEND/`: run the script labelled `db:generate` which calls `npx drizzle-kit generate --config=./src/drizzle.config.ts`.
  - Apply migrations with the `db:migrate` script which runs `npx drizzle-kit migrate --config=./src/drizzle.config.ts`.
- Backend runtime: there is currently no `start` script in `BACKEND/package.json`. To run the server for local testing, run the compiled JS or use `ts-node`/`nodemon` (e.g., `ts-node src/app.ts` or configure a `dev` script). The server listens on `process.env.EXPRESS_PORT`.

## Project-specific conventions & patterns

- Schema module names vs exported names: the `db/index.ts` normalizes exports with PascalCase names (example: `export { product as Product } from "./schema/products.ts"`). When adding a new schema file, mirror this pattern.
- File locations: all DB schema live under `BACKEND/src/db/schema/` including subfolders (e.g. `parts_design/`). Migrations are generated into `BACKEND/src/db/migrations`.
- Environment-first config: `drizzle.config.ts` and `db.ts` import `dotenv/config`; runtime configuration is expected from environment variables (`DB_URL`, `EXPRESS_PORT`). Agents should not hard-code credentials — read or document where to set `.env`.
- Type system / module style: project is TypeScript + ESM (`"type": "module"`) — imports use `import`/`export` and file extensions are sometimes explicit (e.g., `./db.ts`). Keep edits ESM-compatible.

## Integration and cross-component notes

- Frontend and backend are separate apps; the frontend is SvelteKit (`FRONTEND/`) and the backend exposes APIs via Express. There is no monorepo-runner; each app is started independently.
- The DB is only used by the backend; frontend communicates over HTTP to whatever port the backend is listening on (no proxy config present in repo). Document API endpoints in `BACKEND/src/server/` if you add them.

## Useful files to inspect when performing tasks

- Backend runtime and wiring: `BACKEND/src/app.ts`
- DB client and schema aggregator: `BACKEND/src/db.ts` and `BACKEND/src/db/index.ts`
- Drizzle config and migration output: `BACKEND/src/drizzle.config.ts` and `BACKEND/src/db/migrations`
- Example schema files: `BACKEND/src/db/schema/products.ts`, `BACKEND/src/db/schema/accounts.ts`, `BACKEND/src/db/schema/parts_design/*`
- Frontend entry & dev: `FRONTEND/package.json`, `FRONTEND/src/` (SvelteKit routes in `FRONTEND/src/routes/`)

## When editing or adding DB schema

1. Add or modify schema definitions under `BACKEND/src/db/schema/` following existing table patterns.
2. Add an explicit export in `BACKEND/src/db/index.ts` following the PascalCase alias convention.
3. Run `npm run db:generate` from the `BACKEND` folder to generate a migration, then `npm run db:migrate` to apply it.

## Example quick tasks an agent might be asked to do

- Add a new table: create schema file `BACKEND/src/db/schema/new_table.ts`, export it in `db/index.ts`, run generate + migrate.
- Add an API route: add a route file under `BACKEND/src/server/` (or extend `app.ts`), read/write via `db` imported from `BACKEND/src/db.ts`.

## Constraints & gotchas discovered

- There is no backend `start` script; a human may rely on `ts-node`/`nodemon` for dev runs. If you add automation, update `BACKEND/package.json` scripts accordingly.
- No test harness detected in the repo; don't assume test commands exist.

---
If any of these areas need more detail (example API routes, example `.env` values, or adding a `dev` start script for the backend), tell me which section to expand and I will iterate.
