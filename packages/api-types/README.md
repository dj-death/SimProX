# @simprox/api-types

Shared TypeScript types for the SimProX REST + socket API — the **single source
of truth** for the request/response shapes exchanged between the server and any
client (the current AngularJS app, and the React / React Native target).

This is **migration step 2** (see `REVIEW.md` §7 and `docs/API_CONTRACT.md`).
Step 1 inventoried the API; this package turns the four shapes the UI actually
renders into checkable types so the server and a new client can't drift.

## What's here

| File | Covers |
|------|--------|
| `src/common.ts` | auth header, roles, error envelopes, `MessageResponse`, id aliases |
| `src/decision.ts` | `CompanyDecision` + nested `Decision` (the save/load payload) |
| `src/report.ts` | `:report_name` enum, student-filtered reports |
| `src/chart.ts` | `:chart_name` enum, `SeriesChart` / `PerceptionMapChart` |
| `src/finalscore.ts` | `FinalScoreResponse`, `CompanyScore` |
| `src/spending.ts` | spending details + otherinfo (⚠️ placeholder data on server) |
| `src/simulation.ts` | init/run requests + the 3 socket events |

A matching machine-readable spec lives at [`docs/openapi.yaml`](../../docs/openapi.yaml)
(REST) — the socket events are typed in `src/simulation.ts` (`ServerToClientEvents`).

## Provenance

Types are derived from the implementation, not invented:

- `decision.ts` ← `api/models/decision/CompanyDecSchema.ts`
- `chart.ts` ← `api/assemblers/chart.ts`
- `finalscore.ts` ← `api/controllers/simulation/report.ts` (`getStudentFinalScore`)
- `spending.ts` ← `api/assemblers/spendingDetails.ts`, `decision.ts` (`getOtherinfo`)
- sockets ← `api/utils/socketio.ts`

When the source schema changes, update the matching type here in the same PR.

## Build

```bash
cd packages/api-types
npm run typecheck   # tsc --noEmit
npm run build       # emit dist/
```

## Known gaps (carried from the contract)

- `report.ts` payloads are still `Record<string, unknown>` rows — extracting one
  interface per report name is the natural next increment.
- Several chart names are disabled/stubbed server-side; the enum lists what the
  client *requests*, not what currently returns data.
- `spending.ts` shapes are real but the server returns hardcoded placeholders.
