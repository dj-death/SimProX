# SimProX — API & Socket Contract

_Migration step 1 (frontend rewrite prerequisite). Generated 2026-06-24._

This document is the **frozen contract** between the current backend and any
frontend (the existing AngularJS app, or a future React / React Native client).
It inventories every REST endpoint and socket.io event the server exposes, the
auth model, request/response shapes, and the gaps a rewrite must account for.

Source of truth: `routes/index.ts` (route table), `api/utils/socketio.ts`
(realtime), `api/controllers/**` and `api/assemblers/**` (payload shapes),
`api/controllers/user/authentication.ts` (auth). Where a shape is
document-shaped (MongoDB) rather than strictly typed, that is called out.

---

## 1. Conventions

### Base paths
| Prefix | Audience |
|--------|----------|
| `/e4e/api/...` | B2C / "Bridge+" registration & student profile |
| `/stratege/api/...` | MarkSimos player (student) |
| `/stratege/api/admin/...` | Facilitator / admin |

All `/stratege/api/*` responses are forced to
`Content-Type: application/json; charset=utf-8` (`routes/index.ts:211`).

### HTTP verbs & method override
Standard REST verbs. `method-override` is enabled, so `?_method=PUT` is honored
(rarely used by the current client; a new client should use real verbs).

### Error envelope (`server.ts:198-279`)
| Status | Trigger | Body |
|--------|---------|------|
| 400 | `err.message` starts with `"cancel"` **or** `err.errorCode` set (domain/validation errors) | `{ title: "400 Data Error", message, errorCode }` |
| 401 | `err.name === 'UnauthorizedError'` (expired/invalid JWT) | **Redirects** to `/stratege/login`, `/stratege/admin`, or `/e4e/login` depending on URL — not JSON. A SPA must handle the redirect/401 itself. |
| 404 | no matching route and no `req.user` | `{ message: "404 Not found! URL: ..." }` |
| 500 | anything else | `{ title: "500 System Error", message }` |

> ⚠️ Migration note: error responses are **inconsistent** (some `{message}`,
> some `{title,message,errorCode}`, 401 is a redirect not JSON). A rewrite
> should normalize these behind one envelope.

---

## 2. Authentication

- **Scheme:** JWT. The token is looked up, in order, from
  (`authentication.ts:316`):
  1. request header `x-access-token`
  2. body field `x-access-token`
  3. query param `x-access-token`
  4. cookie `x-access-token`
- On login the server **both** sets an `httpOnly` cookie `x-access-token`
  **and** returns the user (with token) in the JSON body. The Angular client
  stores the token in `localStorage` (`<prefix>_logintoken`) and resends it as
  the `x-access-token` **header** via an `$http` interceptor.
- **Public routes** (no token required) — `routes/index.ts:52`:
  `/`, `/admin`, `/e4e/login`, `/e4e/emailverify/registration`,
  `/e4e/campaigns`, `/stratege/help`, `/e4e/forgotpassword`,
  `/stratege/login`, `/stratege/admin`, `/stratege/api/admin/login`,
  `/stratege/api/login`.
- **Authorization:** role-gated per route via
  `iAuth.authRole(strategeRight.<permission>)`. Roles: `student`,
  `facilitator`, `distributor`, `admin` (`api/models/user/UserRole`).
  Permission names are listed in the endpoint tables below (the `Auth` column).
- **JWT secret:** `process.env.JWT_SECRET` (see `.env.example`).

---

## 3. Socket.io contract

Single namespace, authenticated at the handshake (`socketio-jwt`) **and**
re-verified in `api/utils/socketio.ts`.

- **Connection:** client connects to the same host with query params:
  - `token` — the JWT (required; socket disconnects with `unauthorized` if absent/invalid)
  - `seminarId` — optional, used for facilitator room join
- **Rooms (server-side, automatic on connect):**
  - student → joins `"<seminarId><companyId>"` (company room) **and** `"<seminarId>"` (seminar room)
  - facilitator → joins `"<seminarId>"` if they own the seminar

### Server → client events
| Event | Payload | Emitted from |
|-------|---------|--------------|
| `marksimosDecisionUpdate` | the updated decision `data` | `emitMarksimosDecisionUpdate()` — on a teammate saving a decision |
| `marksimosChatMessageSeminarUpdate` | `{ user: {username, avatar}, message }` | seminar-wide chat |
| `marksimosChatMessageCompanyUpdate` | `{ user: {username, avatar}, message }` | company chat |

### Client → server events
| Event | Notes |
|-------|-------|
| `debugInfo` | debug only; commented out in the current client. No functional client→server events — chat is sent over **REST** (`/stratege/api/seminar/chat/*`) and broadcast back over the socket. |

---

## 4. REST endpoints

Legend — **Auth** column: `public` = no token; otherwise the
`strategeRight.<permission>` required. Commented-out routes in source are listed
under "Disabled" because the client still references some of them.

### 4.1 B2C / E4E auth & registration (`/e4e/api`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/e4e/api/registercompany` | public | register enterprise |
| POST | `/e4e/api/registerstudent` | public | register student |
| POST | `/e4e/api/register/username` | public | check username free |
| POST | `/e4e/api/register/email` | public | check email free |
| POST | `/e4e/api/register/mobilePhone` | public | check phone free |
| GET | `/e4e/api/captcha` | public | SMS/registration captcha |
| POST | `/e4e/api/forgotpasswordstep1..3` | public | password reset flow |
| PUT | `/e4e/api/student/password` | studentInfoSingleCUD | change password |
| PUT | `/e4e/api/student` | studentInfoSingleCUD | update profile |
| GET/POST | `/e4e/api/student/phoneverifycode` | studentInfoSingleCUD | phone verify code |
| POST | `/e4e/api/team` | teamInfoSingleCUD | rename team |
| POST | `/e4e/api/team/student` | teamInfoSingleGet | add student to team |
| DELETE | `/e4e/api/team/student/:student_id` | teamInfoSingleCUD | remove from team |
| GET | `/e4e/api/campaigns/:campaignId` | campaignSingleGet | campaign detail |
| POST | `/e4e/api/campaigns/teams` | campaignSingleGet | join campaign |
| POST | `/e4e/api/campaigns/teams/remove` | campaignSingleGet | leave campaign |

### 4.2 Player / MarkSimos (`/stratege/api`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/stratege/api/login` | public | student login → user + token |
| GET | `/stratege/api/logout` | — | clear cookie |
| GET | `/stratege/api/user` | studentInfoSingleGet | current user info |
| GET | `/stratege/api/student/seminar` | seminarListOfStudentGet | seminar list |
| GET | `/stratege/api/choose_seminar` | seminarListOfStudentGet | switch active seminar |
| GET | `/stratege/api/report/:report_name` | seminarSingleDecisionGet | table report (§5.1) |
| GET | `/stratege/api/downloadReport` | seminarSingleDecisionGet | Excel binary (arraybuffer) |
| GET | `/stratege/api/chart/:chart_name` | seminarSingleDecisionGet | chart data (§5.2) |
| GET | `/stratege/api/finalscore` | seminarSingleDecisionGet | final score (§5.3) |
| GET | `/stratege/api/company` | seminarSingleDecisionGet | decision/company info (§5.4) |
| GET | `/stratege/api/spending_details` | seminarSingleDecisionGet | budget breakdown (§5.4) |
| GET | `/stratege/api/company/otherinfo` | seminarSingleDecisionGet | capacity/budget aggregates |
| PUT | `/stratege/api/company/decision` | seminarSingleDecisionCUD | **save decision** (§5.4) |
| PUT | `/stratege/api/company/decision/lock` | seminarSingleDecisionCUD | lock decision |
| GET | `/stratege/api/questionnaire` | seminarSingleDecisionGet | get questionnaire |
| PUT | `/stratege/api/questionnaire` | seminarSingleDecisionCUD | submit questionnaire |
| GET | `/stratege/api/faq` | public | FAQ list |
| POST | `/stratege/api/seminar/chat/seminar` | — | send seminar chat (broadcasts via socket) |
| POST | `/stratege/api/seminar/chat/company` | — | send company chat |
| POST | `/stratege/api/glossaries` | glossaryInfoListGet | search glossary by word |

**Disabled in source but referenced by the Angular client** (SKU/brand-level
decisions, product portfolio, future-projection calculator):
`PUT/POST/DELETE /stratege/api/sku/decision`,
`PUT/POST /stratege/api/brand/decision`,
`GET /stratege/api/product_portfolio`,
`GET /stratege/api/future_projection_calculator/:sku_id`.
The live model is **company-level decisions only** — a rewrite should drop the
SKU/brand decision UI unless these endpoints are revived.

### 4.3 Admin / facilitator (`/stratege/api/admin`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/stratege/api/admin/login` | public | admin login |
| GET | `/stratege/api/admin/user` | adminLogin | current admin |
| GET/POST/PUT | `/stratege/api/admin/distributors[/:id]` | distributorInfo* | distributor CRUD |
| GET/POST/PUT | `/stratege/api/admin/facilitators[/:id]` | facilitatorInfo* | facilitator CRUD |
| GET | `/stratege/api/admin/students` | studentInfoListGet | list students |
| GET | `/stratege/api/admin/students/byday` | studentInfoListGet | signups by day |
| POST/PUT/DELETE | `/stratege/api/admin/students[/:student_id]` | studentInfoSingleCUD | student CRUD |
| POST | `/stratege/api/admin/students/reset_password` | studentInfoSingleCUD | reset password |
| GET/POST/PUT/DELETE | `/stratege/api/admin/campaigns[/:id]` | campaign* | campaign CRUD |
| GET | `/stratege/api/admin/campaigns/score` | campaignInfoListGet | team scores |
| GET | `/stratege/api/admin/campaigns/teamcount` | campaignInfoListGet | teams per campaign |
| POST | `/stratege/api/admin/campaigns/seminars[/remove]` | campaignSingleCUD | link seminars |
| POST | `/stratege/api/admin/campaigns/teams[/remove]` | campaignSingleCUD | link teams |
| GET | `/stratege/api/admin/facilitator/seminar` | seminarListOfFacilitatorGet | seminars |
| POST/PUT/DELETE | `/stratege/api/admin/seminar[/:seminar_id]` | seminarSingleCUD | seminar CRUD |
| POST | `/stratege/api/admin/assign_student_to_seminar` | seminarAssignStudentCUD | assign student |
| POST | `/stratege/api/admin/remove_student_from_seminar` | seminarAssignStudentCUD | unassign |
| POST | `/stratege/api/admin/seminar/:seminar_id/init` | seminarInit | **initialize sim** (§5.5) |
| POST | `/stratege/api/admin/seminar/:seminar_id/runsimulation` | seminarRunRound | **run a round** (§5.5) |
| POST | `/stratege/api/admin/seminar/:seminar_id/unlockDecision` | seminarRunRound | unlock decisions |
| GET | `/stratege/api/admin/seminar/:seminar_id/decisions` | seminarListOfFacilitatorGet | all decisions |
| GET | `/stratege/api/admin/report/:report_name` | seminarListOfFacilitatorGet | full (unfiltered) report |
| GET | `/stratege/api/admin/chart/:chart_name` | seminarListOfFacilitatorGet | chart data |
| GET | `/stratege/api/admin/finalscore/:seminarId` | seminarListOfFacilitatorGet | final score |
| GET | `/stratege/api/admin/questionnaire/:seminarId` | seminarListOfFacilitatorGet | questionnaire results |
| PUT | `/stratege/api/admin/company/decision` | seminarDecisionsOfFacilitatorCUD | edit a company's decision |
| POST | `/stratege/api/admin/seminar/chat/seminar` | seminarListOfFacilitatorGet | facilitator chat |
| GET/POST/PUT | `/stratege/api/admin/glossaries` | glossary* | glossary CRUD |
| GET | `/stratege/api/admin/tags` | glossaryInfoListGet | tag list |

### 4.4 Setup / page-render routes (not part of the SPA JSON API)
- Page renders (EJS): `/`, `/e4e/*`, `/stratege`, `/stratege/login`,
  `/stratege/home`, `/stratege/admin`, `/stratege/adminhome`, etc.
- File downloads: `/stratege/download/manualeng|manualchs`, manuals as markdown.
- **Setup routes (remove before any public deploy):**
  `GET /stratege/setup/load_scenario`,
  `GET /stratege/setup/create_admin` — the latter **creates admin/distributor/
  facilitator/student accounts with hardcoded passwords** (`routes/index.ts:417`).
  This is a security liability and should be gated or deleted.

---

## 5. Response shapes (the data contract)

These are document-shaped (Mongoose) — keys are stable, leaf fields vary by
scenario. The **assemblers** (`api/assemblers/*`) are the canonical builders.

### 5.1 `GET /report/:report_name` → `report.reportData`
Valid `:report_name`: `company_status`, `financial_report`,
`profitability_evolution`, `competitor_intelligence`, `segment_distribution`,
`market_trends`, `market_indicators`.
- For **students**, `financial_report` and `profitability_evolution` are
  **filtered** to the student's own company (`isReportNeedFilter()` →
  `extractReportOfOneCompany()`); facilitators get all companies. A rewrite must
  preserve this server-side filtering (do not expose competitor data to
  students).
- Shape: per-report; `financial_report` is indexed by `companyId`. Treat
  `reportData` as opaque tabular data keyed by company/period and render from the
  existing `tablereport*.html` partials as the column spec.

### 5.2 `GET /chart/:chart_name`
Valid `:chart_name` (client uses these; only some are enabled server-side —
see "gaps"): `inventory_report`, `market_share_in_value`,
`market_share_in_volume`, `mind_space_share`, `shelf_space_share`,
`total_investment`, `net_profit_by_companies`, `return_on_investment`,
`investments_versus_budget`, `market_sales_value`, `market_sales_volume`,
`total_inventory_at_factory`, `total_inventory_at_trade`,
`segments_leaders_by_value_{price_sensitive,pretenders,moderate,good_life,ultimate,pragmatic}`,
`perception_map`, `growth_rate_in_volume`, `growth_rate_in_value`,
`net_market_price`, `segment_value_share_total_market`.
- Typical shape:
  ```
  { periods: number[], companyNames: string[], chartData: number[][] }
  ```
  with variants (`perception_map` → `allCompanyData`; some include `exogenous`).
- `inventory_report` is company-filtered for students.

### 5.3 `GET /finalscore` (and admin `/finalscore/:seminarId`)
Array of period objects:
```
[{ period, seminarId,
   scores: [{ companyId, originalSOM, originalProfit, originalBudget,
              scaledSOM, scaledProfit, scaledBudget, finalScore,
              lockStatus, spendHour, lockTime, startTime,
              hours, minutes, seconds, team }] }]
```

### 5.4 Decisions
- `GET /company` → a `CompanyDecision` document:
  ```
  { d_CID, d_CompanyName, period, seminarId, decision: { ...game decision... } }
  ```
- `PUT /company/decision` — request body:
  ```
  { company_data: { decision: {...} },
    companyId,
    periodId, seminarId   // only when a facilitator edits another company
  }
  ```
  → `{ message: "update success." }`
- `PUT /company/decision/lock` → updated seminar doc (records `lockTime`,
  `lockStatus`, `spendHour`).
- `GET /spending_details` → `{ companyData: { investmentInProductionEfficiency,
  investmentInProcessingTechnology, totalInvestment, averageBudgetPerPeriod,
  totalInvestmentBudget, cumulatedPreviousInvestments, availableBudget,
  normalCapacity, acquiredEfficiency, acquiredProductionVolumeFlexibility,
  acquiredTechnologyLevel } }`.
- `GET /company/otherinfo` → `{ totalAvailableBudget, normalCapacity,
  overtimeCapacity, totalAvailableBudgetValue, normalCapacityValue,
  overtimeCapacityValue }` — **currently returns placeholder/hardcoded values**;
  verify before relying on it.
- The `decision` object's full field set is defined by the decision forms
  (`public/app/js/directives/sim/SIM_D_*.js`) and partials
  (`SD_*.html`): production volume, production management, asset management,
  general marketing, market research orders, HR management, finance. These are
  the most complex screens and carry the heaviest client-side validation —
  budget for them explicitly in the rewrite.

### 5.5 Simulation control (admin)
- `POST /seminar/:id/init` → `{ message: "initialize success" }`. Side effects:
  seeds initial results/decisions/charts/financial reports, sets `isInitialized`.
- `POST /seminar/:id/runsimulation` — body
  `{ goingToNewPeriod: boolean, decisionsOverwriteSwitchers: boolean[] }` →
  `{ message: "run simulation success." }`. Runs the engine, advances period when
  `goingToNewPeriod`. After it runs, the server emits
  `marksimosDecisionUpdate` to affected rooms.

---

## 6. Gaps & risks for the rewrite (do these before building UI)

1. **Disabled SKU/brand endpoints** still referenced by the client (§4.2). Decide
   company-level-only vs. reviving them — this changes the whole decision UI.
2. **Charts partly disabled server-side**: the client lists ~25 chart names but
   the chart assembler currently enables a subset. Confirm which charts actually
   return data before porting all of them.
3. **`otherinfo` returns hardcoded values** (§5.4) — verify or fix.
4. **Inconsistent error envelope + 401-as-redirect** (§1). Normalize first; a SPA
   needs JSON 401s and a single error shape.
5. **No request-body validation contract is documented** — `express-validator`
   rules live inline in controllers; extract them so the new client and any typed
   API layer agree on field names/types.
6. **Server-side role filtering of reports/charts** (§5.1–5.2) is a security
   boundary, not a UI nicety. Keep it server-side.
7. **Setup routes** (`/stratege/setup/*`) must be removed/gated (§4.4).
8. **Chat is REST-in / socket-out** (asymmetric). Keep this model or unify on
   sockets, but document the choice.

---

## 7. Suggested target contract (non-binding)

For the rewrite, freeze the above as an **OpenAPI 3** spec (REST) plus a small
**AsyncAPI** doc (the 3 socket events), generated/checked in CI. Recommended
normalizations: one `{ data, error }` envelope, JSON `401` instead of redirect,
real HTTP verbs, and TypeScript types shared between server and client for the
`decision`, `report`, `chart`, and `finalscore` payloads (the four shapes the UI
actually renders). That shared-types package is the natural **step 2** of the
migration.
