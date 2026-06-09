# Phase 10 — Electron
> **Теория:** [guides/phase-10-electron-theory.md](./guides/phase-10-electron-theory.md) — статус: placeholder  
> **Multi-stack:** Angular (primary desktop); React/Vue — doc-only. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 22–23 недели (40–50 ч)  
**Предусловия:** Phase 9 (или shell-only if MFE deferred)  
**Цель:** Secure desktop app, offline queue, auto-update mock.

---

## Результат фазы

- [ ] `apps/desktop-electron` packages Angular dist
- [ ] Secure preload bridge
- [ ] Offline IndexedDB + sync queue
- [ ] electron-builder artifacts (win)
- [ ] ADR-009 conflict resolution

### React/Next.js (marketing-mfe) — doc-only

- [ ] `docs/multi-stack/10-desktop-alternatives.md` — Tauri vs Electron для marketing
- [ ] Embed web view: Next static export в Electron shell (spike, не production)

### Vue 3 (analytics-mfe) — doc-only

- [ ] `docs/multi-stack/10-vue-desktop-embed.md` — WebView2 / Tauri + Vite dist
- [ ] Offline analytics: doc-only, не реализуем в Phase 10

---

## Неделя 1 — Scaffold

### 10.1.1 Nx Electron plugin or manual

```bash
npm i -D electron electron-builder nx-electron
```

**Structure:**
```
apps/desktop-electron/
  src/
    main.ts
    preload.ts
  electron-builder.yml
```

### 10.1.2 Main process

```typescript
const win = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
  },
});
win.loadFile('dist/apps/web/browser/index.html');
// dev: loadURL('http://localhost:4200')
```

### 10.1.3 Build pipeline

```bash
nx build web --configuration production
nx run desktop-electron:package
```

---

## Неделя 2 — Security

### 10.2.1 Preload API

```typescript
// preload.ts
contextBridge.exposeInMainWorld('electronApi', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  storeToken: (token: string) => ipcRenderer.invoke('auth:storeToken', token),
});
```

### 10.2.2 TypeScript types

```typescript
// libs/shared/electron/src/lib/electron-api.d.ts
interface Window {
  electronApi?: ElectronApi;
}
```

### 10.2.3 CSP in Electron

```typescript
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'"],
    },
  });
});
```

### 10.2.4 No remote module in renderer

Disable `nodeIntegration`, `enableRemoteModule`.

---

## Неделя 3 — Native UX

### 10.3.1 Application menu

File → Logout, Edit → ...

### 10.3.2 Tray icon (optional)

Minimize to tray, double-click restore.

### 10.3.3 Global shortcut

`Ctrl+Shift+L` → logout.

### 10.3.4 electron-store

Encrypted token storage (use `safeStorage` API on supported OS).

---

## Неделя 4 — Offline-first

### 10.4.1 IndexedDB layer

**Lib:** `libs/shared/offline`

```typescript
interface OfflineMutation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: unknown;
  createdAt: number;
}
```

### 10.4.2 Network detection

```typescript
fromEvent(window, 'online').pipe(...)
fromEvent(window, 'offline').pipe(...)
```

### 10.4.3 Queue processor

On `online`:
1. Read queue FIFO.
2. Replay to API.
3. On success remove; on failure backoff.

### 10.4.4 UI indicator

Banner: "Offline — changes will sync".

### 10.4.5 ADR-009

Conflict: last-write-wins vs prompt user.

---

## Неделя 5 — Auto-update (mock)

### 10.5.1 electron-updater

Dev: mock `checkForUpdates` returns fake version.

### 10.5.2 Code signing note

Document: real deploy needs cert (Windows/mac).

---

## Критерии готовности

- [ ] Installable `.exe` or portable build runs
- [ ] Airplane mode: add todo → goes to queue → sync on online
- [ ] Security audit checklist passed (contextIsolation, no nodeIntegration)
- [ ] DevTools not open in production build

---

## Стек React / Next.js (marketing-mfe)

> **Doc-only:** desktop — зона ответственности Angular Electron. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.10.1 — Tauri comparison doc

**Файл:** `docs/multi-stack/10-desktop-alternatives.md`

| | Electron | Tauri |
|---|----------|-------|
| Bundle size | ~150 MB | ~10 MB |
| Web stack | Chromium embed | System WebView |
| Next.js fit | `loadURL` dev server | static export + webview |

**Шаги:**
1. Spike 1 ч: Tauri hello-world — не в monorepo.
2. Зафиксировать: production desktop = Angular only; marketing desktop — out of scope.
3. Interview story: когда Tauri vs Electron.

**Критерий:** ADR или doc section в `docs/adr/`.

### R.10.2 — Embed web view (spike)

**Шаги:**
1. Document: `BrowserWindow.loadURL('http://localhost:3001')` для Next dev.
2. Production: `next export` или standalone → `loadFile` — limitations noted.
3. Не блокирует Phase 10 критерии.

---

## Стек Vue 3 (analytics-mfe)

> **Doc-only:** analytics в desktop — через Angular shell webview, не отдельный Vue binary.

### V.10.1 — Vue embed documentation

**Файл:** `docs/multi-stack/10-vue-desktop-embed.md`

**Шаги:**
1. Описать: analytics-mfe как federated remote внутри Electron Angular shell.
2. Tauri + Vue dist — alternative path для портфолио.
3. Offline queue (Phase 10.4) — только Angular NgRx path.

**Критерий:** doc linked from README multi-stack section.

---

## Следующая фаза

→ [phase-11-testing-quality.md](./phase-11-testing-quality.md)


