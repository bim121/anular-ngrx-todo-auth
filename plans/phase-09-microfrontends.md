# Phase 9 — Microfrontends
> **Теория:** [guides/phase-09-microfrontends-theory.md](./guides/phase-09-microfrontends-theory.md) — статус: placeholder


**Длительность:** 19–21 недели (50–60 ч)  
**Предусловия:** Phase 8, Nx workspace  
**Цель:** Shell host + todos remote, Module Federation, independent deploy story.

---

## Результат фазы

- [ ] `apps/shell` + `apps/todos-mfe`
- [ ] Native Federation or Webpack MF working locally
- [ ] Shared dependency rules documented
- [ ] Fallback when remote fails
- [ ] ADR-005 cross-MFE communication
- [ ] Comparison doc: single-spa vs MF

---

## Неделя 1 — Workspace split

### 9.1.1 Apps layout

```
apps/
  shell/          # routing, auth, layout, loads remote
  todos-mfe/      # todo feature only
libs/
  shared/auth/    # token types, auth guard contract
  shared/config/
```

### 9.1.2 Move code

| From | To |
|------|-----|
| auth feature | shell + libs/auth/* |
| todos feature | todos-mfe |

### 9.1.3 Shell routes

```typescript
{
  path: 'todos',
  loadChildren: () => loadRemoteModule('todos', './Routes'),
}
```

---

## Неделя 2 — Module Federation setup

### 9.2.1 Native Federation (recommended Angular 17+)

```bash
npm i @angular-architects/native-federation -D
```

**todos-mfe federation.config.js:**
```javascript
module.exports = withNativeFederation({
  name: 'todos',
  exposes: {
    './Routes': './apps/todos-mfe/src/app/remote.routes.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true }),
  },
});
```

### 9.2.2 Version alignment

- Lock `@angular/core`, `@ngrx/store` same version shell vs remote.
- `package.json` resolutions if needed.

### 9.2.3 Dev workflow

```bash
nx serve todos-mfe
nx serve shell
```

Shell manifest points to `http://localhost:4201/remoteEntry.json`.

---

## Неделя 3 — State ownership (ADR-005)

### 9.3.1 Rule

**Shell owns:** auth store, router, theme, tenant config.  
**Remote owns:** todos UI state (SignalStore).  
**Remote reads:** `userId` via injected token service from shell.

### 9.3.2 Token bridge

```typescript
// libs/shared/auth/src/lib/session.service.ts
@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly userId = signal<string | null>(null);
}
```

Shell sets after login; remote injects.

### 9.3.3 Anti-pattern

Remote importing shell's NgRx store directly — **forbidden**.

### 9.3.4 Custom events alternative

```typescript
window.dispatchEvent(new CustomEvent('auth:logout'));
```

For loose coupling analytics only.

---

## Неделя 4 — Deployment model

### 9.4.1 Independent builds

```bash
nx build todos-mfe --configuration production
nx build shell --configuration production
```

### 9.4.2 Version manifest

**Файл:** `shell/assets/mf-manifest.json`

```json
{
  "todos": { "remoteEntry": "https://cdn.example.com/todos/1.2.0/remoteEntry.json" }
}
```

Shell loads manifest at runtime — blue-green ready (Phase 15).

### 9.4.3 Error boundary

```typescript
@Component({
  template: `
    @if (loadError()) {
      <p>Todos unavailable. <button (click)="retry()">Retry</button>
    } @else {
      <ng-container *ngComponentOutlet="remoteComponent()" />
    }
  `,
})
```

### 9.4.4 E2E

Playwright: shell loads, remote todos visible.

---

## Неделя 5 — Spike & docs

### 9.5.1 single-spa comparison (1 day)

**Файл:** `docs/mfe-comparison.md`

| Criteria | Module Federation | single-spa |
|----------|-------------------|------------|
| Angular support | | |
| Independent deploy | | |
| Shared deps | | |

### 9.5.2 Performance

- Measure: shell only vs shell+remote initial load.
- Lazy load remote only on `/todos` route.

---

## Критерии готовности

- [ ] `nx run-many -t build` green for shell + remote
- [ ] Logout in shell clears remote state
- [ ] Remote v2 deploy without shell rebuild (manifest change only)
- [ ] ADR-005 approved

---

## Следующая фаза

→ [phase-10-electron.md](./phase-10-electron.md)


