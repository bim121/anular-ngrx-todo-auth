# ADR-006: Local httpResource vs global NgRx store

**Status:** Accepted  
**Date:** 2026-06-15  
**Context:** Phase 2 — httpResource spike (`GET /users/me` profile). Todos remain in NgRx; profile is read-only secondary data fetched in `UserProfileComponent`.

## Decision

| Data | Strategy | Rationale |
|------|----------|-----------|
| **Todos** | NgRx feature store (`todos`) | Shared across routes, mutated by many actions/effects, needs DevTools and cross-feature reactions (e.g. clear on logout). |
| **Auth session** | NgRx feature store (`auth`) | Global: guards, interceptors, layout header, and effects depend on `user` / `token`. |
| **User profile** (`/users/me`) | Component-local `httpResource` | Read-only, used on one screen, no other feature reads or writes it; refetch when login state changes is enough. |

Use **NgRx** when data is:

- Written from multiple places or drives side effects (effects, other reducers).
- Read by multiple unrelated features or shell components.
- Part of the app’s core domain model (todos, session).
- Needed for time-travel debugging, middleware, or persistence plugins.

Use **`httpResource` (or local signals)** when data is:

- **Read-only** or owned by a single screen/widget.
- **Secondary** — enriches UX but is not the source of truth for app flow.
- Fetched with a stable URL keyed off a small set of reactive inputs (e.g. `isLoggedIn`).
- Safe to drop when the component is destroyed (no global consumers).

Do **not** mirror the same entity in both NgRx and `httpResource`. The spike keeps `User` in the auth store (id, name, email from login) and loads **extended profile** (bio, stats, avatar) only via `httpResource`.

## Rationale

- **Less boilerplate** for one-off GETs: no actions, reducer slice, selectors, or effects for profile.
- **Automatic request lifecycle** — loading / error / value signals; refetch when `isLoggedIn()` flips without manual `subscribe` / `unsubscribe`.
- **Interceptors still apply** — `authInterceptor` attaches Bearer token; same security model as `HttpClient`.
- **Clear boundary** — todos stay the reference implementation for global client state; profile documents the alternative.

## Consequences

- Profile is not in Redux DevTools or `localStorage` sync; acceptable for display-only metadata.
- Other features must not `inject` profile from a store; if profile is needed in header later, either lift to NgRx or expose a small shared service — revisit with a new ADR.
- `httpResource` is experimental; API may change in future Angular versions.

## Alternatives considered

- **NgRx entity for profiles** — consistent with todos but heavy for a single read-only panel.
- **Auth effect loads profile on login** — couples login flow to optional UI data; rejected for spike scope.
- **Plain `HttpClient` + `toSignal`** — works but duplicates loading/error handling that `httpResource` provides.

## Reference implementation

- Mock API: `profiles` in `db.json`, `GET /users/me` in `server/middleware.js`.
- UI: `src/app/features/auth/ui/user-profile/user-profile.component.ts`.
