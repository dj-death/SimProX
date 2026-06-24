# @simprox/client

React + Vite + TypeScript frontend for SimProX — the **migration target** that
will replace the AngularJS app (`public/app`). This is **migration step 3**: the
app skeleton plus the first vertical slice (**auth / login**).

It consumes [`@simprox/api-types`](../packages/api-types) as the API contract, so
the client and server can't drift on request/response shapes.

## Run

```bash
# 1) build the shared types the client depends on
cd ../packages/api-types && npm install && npm run build

# 2) install + run the client
cd ../../client && npm install
cp .env.example .env          # point VITE_API_TARGET at your running Express server
npm run dev                   # http://localhost:5173
```

The Vite dev server proxies `/stratege/api`, `/e4e/api` and `/socket.io` to the
Express backend (`VITE_API_TARGET`), so there's no CORS to configure.

## What's here (the auth slice)

| Path | Role |
|------|------|
| `src/api/client.ts` | fetch wrapper: attaches `x-access-token`, normalizes the 3 error bodies into `ApiRequestError`, token storage |
| `src/api/auth.ts` | typed login/logout/getCurrentUser calls |
| `src/api/queryClient.ts` | React Query client (no retry on 401/403) |
| `src/auth/AuthContext.tsx` | token + user state, session restore on boot, login/logout |
| `src/auth/LoginPage.tsx` | login form |
| `src/auth/ProtectedRoute.tsx` | gate for authenticated routes |
| `src/HomePage.tsx` | placeholder landing behind auth |

Login flow mirrors the backend: `POST /stratege/api/login` → `{ token }` →
store → `GET /stratege/api/user` to load the user document.

## Next slices (per REVIEW.md §7)

1. **Reports** (read-only) — render `:report_name` tables; reuse server-side
   student filtering. Types already in `@simprox/api-types` (`ReportName`).
2. **Charts** — `SeriesChart`; confirm which chart names actually return data.
3. **Decision forms** — the heaviest screens (`Decision` type); port the
   `SIM_D_*` validation. Save via `PUT /stratege/api/company/decision`.
4. **Realtime** — socket.io client for `marksimosDecisionUpdate` + chat.
