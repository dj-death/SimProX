# SimProX / "Stratege" — Codebase Review

_Review date: 2026-06-24_

This document describes what the project is, how it is built, how the
simulation engine works, the main risks found, and a staged plan for
modernising the frontend. A first pass of low-risk **security** and **repo
hygiene** fixes has already been applied (see _Changes applied_ at the end).

---

## 1. What this is

**SimProX** (internally "Stratege", also branded "Bridge+" / "E4E" / "HCD
Learning") is a web-based **business-simulation game**. Teams of students run a
virtual company across several markets and products (SKUs) over a sequence of
decision rounds ("periods"). Each round they submit decisions (price,
advertising, production volume, hiring, machinery, financing, etc.); the engine
simulates a competitive marketplace and returns financial and operational
reports plus a score.

It is a single application serving several audiences from one Express server:

- **Players** — the simulation UI (decisions + reports), `views/player`.
- **Admins / instructors** — seminar management, `views/admin`.
- **B2C / marketing site** — registration, campaigns, profiles (`views/b2c`,
  `views/e4e`), partly localized to Chinese.

---

## 2. Tech stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Node.js + Express 4.14 | bootstrap in `server.ts` |
| Language | TypeScript → compiled to JS in place | ~181 `.ts` files |
| Data | MongoDB via Mongoose 4.5 | `api/models/**` |
| Realtime | socket.io 1.4 + `socketio-jwt` | `api/utils/socketio` |
| Auth | Passport (local) + JWT (`express-jwt`) | `api/auth.ts`, `api/controllers/user/authentication.ts` |
| Views | EJS (error/landing pages) | `views/**` |
| Frontend | **AngularJS 1.x** SPA + Bower | `public/app/**` (~40 controllers/directives, 50 partials) |
| Reporting | Excel (`xlsx-populate`, `xlsx-style`) | templates in `kernel/data/templates` |
| Build/IDE | Visual Studio Node.js project (`Server.njsproj`) | no `tsconfig.json` originally |

The stack dates to roughly 2016. AngularJS, Bower, `bcrypt-nodejs`, Mongoose 4,
and Express 4 are all **end-of-life or unmaintained**.

---

## 3. Repository layout

```
server.ts / server.js     Express bootstrap: middleware, socket.io, mongoose, error handlers
config.ts / config.js     ports, mongo conn string, external service tokens
routes/index.ts           631-line central route table (REST + page renders)
api/
  auth.ts                 session/login/logout helpers
  controllers/            user (admin/student/auth), simulation (decision/report/chart/init/seminar), b2c, faq, questionnaire
  models/                 Mongoose schemas (user, scenario, simulation, decision, seminar, b2c)
  assemblers/             shape engine output into chart/report/decision view models
  convertors/, promises/, utils/
kernel/
  app.ts                  facade over the engine (initialize / setDecisions / simulateEnv / simulateMarketplace / getEndState)
  Engine/
    Game.ts, Scenario.ts, Reel.ts
    ComputeEngine/        Company, IObject, IDepartment, ObjectsFactory, ObjectsManager, ENUMS
      Finance/ Manufacturing/ Marketing/ Personnel/ Environnement/
    ScoringEngine/        Marketplace, StockMarket
  data/                   scenarios, templates, downloads, simulation state
public/app/               AngularJS frontend (js/, partials/, css/, dist/, bower_components/)
views/                    EJS pages (admin / b2c / e4e / player / statistic / page404 / page500)
```

> **Note on the `.js` files:** every `.ts` is committed alongside its compiled
> `.js`. The app's `start` script runs `nodemon server.js` directly — there is
> **no compile step in the deploy path** — so the committed `.js` are the
> runtime artifacts. Keep `.ts` and `.js` in sync until a real build step is
> introduced (see §6).

---

## 4. How the simulation engine works (deep-dive)

The engine is the most valuable and most complex part of the codebase. A round
is orchestrated through the facade in `kernel/app.ts`:

1. **`initialize(playerID, currPeriod, lastDecisions, lastPeriodResults, envLastStates)`**
   — builds all company objects for a player from prior-period state.
2. **`setDecisions(playerID, currPeriod, decision)`** — applies the player's
   decisions to the Manufacturing, Marketing and Finance objects.
3. **`simulateEnv(currPeriod)`** — advances the shared macro-economy (GDP,
   inflation, FX, material markets, central-bank rates, building contractor
   costs).
4. **`simulateMarketplace()`** — resolves competition across all firms.
5. **`getEndState(playerID, currPeriod)`** — collects computed results from every
   object/department into a `Scenario.Results` structure.

### Object / department model (`ComputeEngine`)

- **`IObject`** — base class for every simulated entity (product, machine,
  worker, market, bank account…). Lifecycle hooks: `onBeforeReady()` →
  `onReady()` → `onFinish()`.
- **`IDepartment`** — abstract aggregator for a department.
- **`ObjectsManager`** — singleton registry: `playerID → department → IObject[]`.
- **`ObjectsFactory`** — builds the bundle of departmental objects per player.
- **`Company`** — aggregates `ProductionDept`, `MarketingDept`, `ManagementDept`,
  `FinanceDept` and derives consolidated metrics (gross/operating/net P&L, ROE,
  working capital, free cash flow, equity value).

### Departments and what they compute

- **Manufacturing** (`Manufacturing/`): Product, SemiProduct, Machinery,
  RawMaterial, Worker, Factory, Land, Warehouse. Machine power/degradation,
  production scheduling, quality sampling (Poisson), inventory → `producedQ`,
  `rejectedQ`, `qualityScore`, closing inventory value.
- **Marketing** (`Marketing/`): Market/subMarkets, SalesForce, Transport,
  ECommerce, SalesOffice, Intelligence. Demand from price/advertising/quality/
  credit vs. competitors → `soldQ`, `effectiveDeliveredQ`, backlog, stock,
  satisfaction.
- **Personnel** (`Personnel/`): Employee, Management. Hiring/dismissal, wages,
  strike probability from wage levels.
- **Finance** (`Finance/`): Capital, BankAccount, Insurance, CashFlow. Share
  issuance/dividends, loans/deposits/overdraft, interest, tax, and the cash-flow
  statement.
- **Environnement** (`Environnement/`): Economy, MaterialMarket, Bank, Currency,
  CentralBank, BuildingContractor, StockMarket — **shared global state**, not
  per-player.

### Scoring (`ScoringEngine/`)

`Marketplace` is a singleton that aggregates every firm's market data
(price, volume, quality, advertising across markets × products), builds a
normalized **marketing-mix matrix**, and computes each firm's competitive
position and demand share (using harmonic/geometric/arithmetic means).
`StockMarket` values equity by discounted free cash flow:
`equityMarketValue = discountedFirmValue − debtMarketValue` → share price.

### One step, end to end

```
setDecisions → object lifecycle (onBeforeReady → onReady)
            → Manufacturing (machines, scheduling, quality, inventory)
            → Marketing (demand, sales force, e-commerce, deliveries)
            → CashFlow (receipts − payments, financing, investing)
            → Finance (tax, capital, interest, insurance)
            → Environnement.simulate (macro update)
            → Marketplace + StockMarket (competition, share price)
            → onFinish (collect per-object results)
            → getEndState (consolidate via Company/Production/Marketing/Finance)
```

Async collection across the interdependent objects is done with **Q promises**
via `ObjectsManager`.

Results are turned into player-facing data by `api/assemblers/*` (chart,
financialReport, decision, spendingDetails) and rendered both as HTML/Angular
and as downloadable Excel.

---

## 5. Findings & risks

### Security (highest priority)

| # | Issue | Location | Status |
|---|-------|----------|--------|
| S1 | JWT signing secret hardcoded (`'didi'`) | `server.ts:2` | **Fixed** — now env-first with dev fallback |
| S2 | Third-party service tokens committed in plaintext (`bbs.token`, `messageConfig.appkey`) | `config.ts` | **Fixed** — env-first; rotate the leaked values |
| S3 | `mongo_conn` and ports hardcoded | `config.ts` | **Fixed** — env-first |
| S4 | EOL/vulnerable dependencies (Express 4.14, Mongoose 4.5, `bcrypt-nodejs` [deprecated], AngularJS [EOL], `node-uuid` [deprecated]) | `package.json` | Open — needs an upgrade plan |
| S5 | CORS fully commented out; `methodOverride` enabled | `server.ts` | Review intended policy |

> **Action required:** S1–S3 are fixed in code, but the previously committed
> secret values remain in git history. **Rotate** `JWT_SECRET`, `bbs.token` and
> `messageConfig.appkey` — treat them as compromised.

### Repo hygiene

| # | Issue | Status |
|---|-------|--------|
| H1 | `.gitignore` globs (`api/*.js`) only matched top-level files, so nested compiled `.js`/`.map` were tracked | **Fixed** — recursive, scoped patterns |
| H2 | 221 `.js.map` source maps committed | **Fixed** — untracked (`git rm --cached`) |
| H3 | No `tsconfig.json` — build depended on Visual Studio | **Fixed** — added `tsconfig.json` + `npm run build` |
| H4 | Compiled `.js` still committed (needed at runtime since deploy has no build step) | Open — see §6 |
| H5 | Empty `README.md`, dead code (commented CORS/pm2 blocks, `"I:/dash"` path), OpenShift-era env fallbacks | Open |
| H6 | No tests, no CI, no lint config | Open |

### Architecture observations

- `routes/index.ts` is a 631-line monolith mixing API endpoints and page
  renders; would benefit from per-feature route modules.
- Engine relies on **singletons** (`ObjectsManager`, `Marketplace`, global
  `Environnement`) and a global `gsocketio`. This makes multi-tenant/concurrent
  simulation runs and unit testing hard.
- Mongoose `.Promise` is wired to Q; mixing Q with native promises across the
  codebase is a maintenance hazard.

---

## 6. Recommended next steps (not yet done)

1. **Rotate the leaked secrets** (S2) and move them fully out of code once a
   secrets store is available.
2. **Introduce a real build step**: compile `.ts` → `dist/` via
   `npm run build`, run from `dist/`, then stop committing compiled `.js`
   entirely (resolves H4). Until then, edit `.ts` and `.js` together.
3. **Dependency upgrade plan** (S4): prioritise Express, Mongoose, and replacing
   `bcrypt-nodejs` with `bcrypt`/`argon2`.
4. **Add CI**: `tsc --noEmit` typecheck + a smoke test that boots the server and
   runs one simulation step against a fixture scenario.
5. **Write the README** with setup, env vars (now in `.env.example`), and a
   one-paragraph engine overview linking to this document.

---

## 7. Frontend migration plan (AngularJS → React Native)

The request included migrating the frontend to **React Native**. This is a large
undertaking and worth scoping carefully before any code is written.

### Reality check

- The current frontend is a **desktop-oriented web SPA** (AngularJS 1.x) with
  dense financial tables, multi-column decision forms, and Excel-style reports —
  UIs that map poorly to a phone form factor. React **Native** targets iOS/
  Android; for a data-dense instructor/finance tool, **React (web)** — or
  **React Native for Web** if a shared mobile + web codebase is genuinely
  needed — is the more appropriate target. Recommend confirming the goal:
  _native mobile apps_ vs. _a modern web rewrite_.
- There is **no REST/JSON contract document**; the Angular app couples directly
  to server endpoints in `routes/index.ts` and socket.io events. A clean API
  boundary is a prerequisite for any frontend rewrite.

### Staged approach (recommended)

1. **Carve out the API.** Inventory every endpoint and socket event the Angular
   app consumes; document request/response shapes (the `api/assemblers` output
   types are the source of truth). Freeze this as the contract.
   ✅ **Done** — see [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md): full REST
   table, the 3 socket events, auth model, response shapes, and the gaps to
   resolve before building UI.
   ✅ **Step 2 done** — see [`packages/api-types`](packages/api-types) (shared
   TypeScript types for the four UI payloads + sockets) and
   [`docs/openapi.yaml`](docs/openapi.yaml) (machine-readable REST spec).
2. **Stand up a React app** (Vite + TypeScript + React Query) alongside the
   Angular app, served under a separate path. Reuse the existing JSON API.
3. **Migrate feature-by-feature**, lowest-risk first: auth/login → B2C/profile
   pages → reports (read-only) → decision forms (most complex; heavy validation
   in `SIM_D_*` directives) → realtime/socket features.
4. **Strangle the Angular app**: route migrated features to React, retire
   Angular partials as they are replaced.
5. **If true mobile is required**, build the React layer with **React Native for
   Web** so screens are shareable, and ship native apps from the same component
   library once the web rewrite stabilises.

### Effort

This is a **multi-month** effort (≈40 Angular controllers/directives, 50
partials, dense financial UIs, socket.io realtime). It should be planned as its
own project with the API-contract work (step 1) done first. I have **not**
started the migration here — happy to begin with step 1 (the API/endpoint
inventory) on request.

---

## Changes applied in this pass

- `server.ts` / `server.js`: JWT secret read from `process.env.JWT_SECRET`.
- `config.ts` / `config.js`: port, host, mongo connection, domain, BBS token and
  message app key read from environment with legacy fallbacks.
- `.env.example`: documents all externalized configuration.
- `.gitignore`: recursive, source-scoped patterns for compiled output; stops
  tracking `public/app/js` source by mistake.
- Untracked 221 committed `.js.map` source maps.
- `tsconfig.json`: reproducible build outside Visual Studio.
- `package.json`: added `npm run build` (`tsc -p tsconfig.json`).
