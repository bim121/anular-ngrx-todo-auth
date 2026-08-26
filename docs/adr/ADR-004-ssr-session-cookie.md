# ADR-004: SSR session auth — httpOnly cookie vs localStorage

**Status:** Accepted  
**Date:** 2026-08-26  
**Phase:** 7.2.4

## Context

The Angular app persists auth in **localStorage** via NgRx meta-reducers (Phase 3.5). That works for CSR reloads but **not on the server**:

- Node SSR has no `localStorage`
- `authGuard` and `todosResolver` need `userId` during server render
- Tokens in localStorage are readable by any XSS script

## Decision

Use a **hybrid model**:

| Layer | Storage | Purpose |
|-------|---------|---------|
| Browser SPA | `localStorage` (`auth` key) | Fast client reload, existing guards |
| SSR | **httpOnly cookie** `session` | Server reads `userId` + token from request |

Flow:

1. **Login success** → client POST `/api/session` → Express sets `session` cookie (`httpOnly`, `SameSite=Lax`, `Secure` in prod).
2. **SSR request** → `provideSsrAuthRestore()` reads cookie → dispatches `restoreAuthFromSession`.
3. **Logout** → DELETE `/api/session` + clear localStorage via existing meta-reducer.

Cookie payload (base64url JSON): `{ user, token }`.

## Security notes

- **httpOnly:** JavaScript cannot read the cookie (mitigates XSS token theft).
- **SameSite=Lax:** CSRF protection for cross-site POST; session still sent on top-level navigations.
- **Secure (production):** Cookie only over HTTPS.
- **Not a replacement for real auth server:** mock Express endpoint for learning; production should set cookie from auth API response headers.

## Consequences

- Authenticated SSR routes (`/todos`, `/kanban`, `/calendar`) can run resolvers with `userId`.
- `TransferState` can ship prefetched todos without double HTTP after hydration.
- Dev workflow: login once in browser → cookie set → SSR requests include session.

## Alternatives considered

| Option | Rejected because |
|--------|------------------|
| localStorage only | Unavailable on server |
| TransferState for auth only | Still need cookie on subsequent SSR requests |
| Bearer token in NgRx only | Not sent automatically on SSR HTTP |
