# Phase 6 — Design System
> **Теория:** [guides/phase-06-design-system-theory.md](./guides/phase-06-design-system-theory.md) — статус: placeholder  
> **Multi-stack:** Angular + React/Next + Vue — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 13–14 недели (40–50 ч)  
**Предусловия:** Phase 5, Nx workspace  
**Цель:** Publishable UI lib, tokens, Storybook, app fully on DS components.

---

## Результат фазы

- [x] `libs/shared/ui` с Button, Input, Card, Modal, Toast, Checkbox
- [x] Design tokens (CSS variables)
- [x] Light/dark theme
- [x] Storybook 10 (`nx storybook shared-ui`)
- [x] a11y pass на компонентах
- [x] Auth + Todos UI migrated

### React/Next.js (marketing-mfe)

- [ ] shadcn/ui Button, Card, Input в marketing-mfe
- [ ] Import `libs/shared/design-tokens` (CSS variables)
- [ ] Login + todo list на DS components
- [ ] Dark theme via tokens (match Angular)
- [ ] Storybook или Ladle для React primitives (optional)

### Vue 3 (analytics-mfe)

- [ ] Dashboard layout: sidebar + chart grid
- [ ] Shared tokens CSS variables из `libs/shared/design-tokens`
- [ ] `StatCard`, `ChartPanel` components
- [ ] Light/dark theme toggle в analytics shell
- [ ] a11y pass на dashboard route

---

## Неделя 1 — Tokens & theming

### 6.1.1 Token file

**Файл:** `libs/shared/ui/styles/_tokens.css`

- [x] Canonical CSS variables (`--color-primary`, space, radius, font, shadow)
- [x] `[data-theme="dark"]` palette + `--app-*` aliases for existing chrome

### 6.1.2 Theme service

- [x] `ThemeStore` (`light` \| `dark` \| `system`) in `libs/shared/ui`
- [x] `document.documentElement.setAttribute('data-theme', ...)`
- [x] App `ThemeService` facade still publishes `UiEventsService.themeChanged$`

### 6.1.3 SSR no-flash

**Файл:** `apps/web/src/index.html` inline script (minimal):

- [x] Reads `localStorage.theme` + `prefers-color-scheme` before first paint

### 6.1.4 Интеграция твоей DS

Своей внешней DS нет — **in-repo DS** в `libs/shared/ui` (не wrapper над Material).

- [x] [ADR-013](../docs/adr/ADR-013-in-repo-design-system.md) — direct import of in-repo primitives (ADR-008 already used for router-store)

---

## Неделя 2 — Primitives

### 6.2.1 Button

| Input | Type |
|-------|------|
| variant | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` |
| size | `'sm' \| 'md' \| 'lg'` |
| disabled | boolean |
| loading | boolean |

- `host` bindings для class.
- Focus visible styles.

- [x] `button[app-button]` — host classes, `:focus-visible`, spinner when `loading`

### 6.2.2 Input / FormField

- `FormFieldComponent`: label + hint + error slot.
- Works with reactive + signal forms (ControlValueAccessor).

- [x] Signal-forms `[field]` path kept; CVA `app-input` + `[dsError]` slot when `field` omitted

### 6.2.3 Card, Checkbox, Spinner

- Checkbox: keyboard Space, aria-checked.

- [x] `app-card`, `app-checkbox` (CVA + Space + `aria-checked`), Spinner `sm|md|lg`

---

## Неделя 3 — Overlay components

### 6.3.1 Toast

- Already from Phase 1 — migrate to DS Toast in lib.

- [x] `app-toast` on tokens; error `role="alert"`; dismiss via DS Button

### 6.3.2 Modal

- `cdk-dialog` or custom focus trap.
- `role="dialog"`, `aria-modal="true"`.
- Escape closes.

- [x] `ModalService` + confirm dialog (focus trap, Escape, backdrop)
- [x] Todo delete uses confirm modal

### 6.3.3 a11y checklist per component

**Файл:** `libs/shared/ui/A11Y.md`

- [x] Color contrast 4.5:1
- [x] Focus order
- [x] Screen reader labels

---

## Неделя 4 — Storybook

### 6.4.1 Setup

```bash
nx storybook shared-ui
# or: npm run storybook:ui
```

Target: `libs/shared/ui` (Nx 21 + Angular 21 → Storybook **10** + `@storybook/angular-vite`; webpack Storybook 8/9 cannot load Angular 21). Port **6006** (analytics-mfe already uses 4400).

- [x] `.storybook/main.ts` + `preview.ts` (tokens, theme toolbar, autodocs)
- [x] Targets `storybook` / `build-storybook` on `shared-ui`

### 6.4.2 Stories (minimum)

| Component | Stories |
|-----------|---------|
| Button | all variants, disabled, loading |
| Input | error state, disabled |
| Card | default |
| Modal | open/close |
| Checkbox | checked/unchecked |

- [x] `*.stories.ts` next to primitives + `composition.stories.ts`

### 6.4.3 Docs addon

- Autodocs from JSDoc on inputs.
- Composition examples.

- [x] `tags: ['autodocs']` + JSDoc on Button/Input/Card/Checkbox inputs
- [x] Composition: Card + FormField + Checkbox + Buttons

---

## Неделя 5 — App migration

### 6.5.1 Auth pages

Replace raw `<button>`, `<input>` with DS.

- [x] Login / Register: `app-card` + `app-form-field` + `button[app-button]` (`loading` while submitting)

### 6.5.2 Todo list

- `TodoItem` uses DS Checkbox + Button.
- Empty state Card.

- [x] `app-checkbox` + DS buttons on `TodoItem`; Edit/Delete/Save/Cancel on tree item
- [x] Add-task `app-input` + `app-button`; search/comment via FormField + Input
- [x] Empty list `app-card title="No todos"`

### 6.5.3 Visual regression (optional)

Chromatic/Percy — 5 stories on PR.

- [ ] Skipped (optional)

---

## Критерии готовности

- [x] `nx storybook shared-ui` runs
- [x] No raw form controls in feature templates
- [x] axe DevTools 0 critical on login/todos
- [x] Theme persists + SSR no flash

---

## Product features

### PF-3.3 Kanban board (V3)

- [x] CDK drag-drop + DS cards
- [x] Columns: todo / in-progress / done
- [x] **Подготовка к GraphQL:** Kanban over-fetching → [Phase 13-GraphQL](./phase-13-graphql-client.md) (documented in `KanbanBoardComponent` JSDoc + UI hint)
- [x] **Vue analytics layout:** dashboard sidebar + chart grid в `analytics-mfe` — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md) Phase 6

### PF-3.4 Calendar view (V3)

- [x] Month grid + todos with `dueDate`
- [x] `TagChip`, `PriorityBadge` components

---

## Стек React / Next.js (marketing-mfe)

> shadcn/ui + shared tokens. См. [multi-stack-roadmap.md](./multi-stack-roadmap.md).

### R.6.1 — shadcn/ui init

```bash
cd apps/marketing-mfe
npx shadcn@latest init
npx shadcn@latest add button card input
```

**Шаги:**
1. Tailwind config extends shared token CSS variables.
2. Import `@shared/design-tokens/styles/tokens.css` в global styles.
3. Replace raw HTML buttons/inputs in login + todo features.

**Проверка:** visual parity with Angular DS Button/Input (same `--color-primary`).

### R.6.2 — Token integration

**Файл:** `libs/shared/design-tokens/styles/tokens.css`

```css
:root {
  --color-primary: #3b82f6;
  /* shared with Angular libs/shared/ui */
}
```

marketing-mfe `globals.css`:
```css
@import '@shared/design-tokens/styles/tokens.css';
```

**Критерий:** toggle dark theme — shadcn components update via `[data-theme="dark"]`.

### R.6.3 — Component migration checklist

| Screen | Components |
|--------|------------|
| Login | Button, Input, Card |
| Todo list | Checkbox (shadcn), Card empty state |
| Header | Button ghost variant |

**Критерий:** no raw `<button>` / `<input>` in feature templates.

---

## Стек Vue 3 (analytics-mfe)

### V.6.1 — Dashboard layout

**Файл:** `apps/analytics-mfe/src/layouts/DashboardLayout.vue`

```
┌──────────┬─────────────────────────────┐
│ Sidebar  │  StatCard  StatCard  StatCard │
│ nav      ├─────────────────────────────┤
│          │  ChartPanel (full width)    │
│          ├──────────────┬──────────────┤
│          │ ChartPanel   │ Todo summary │
└──────────┴──────────────┴──────────────┘
```

**Шаги:**
1. CSS Grid responsive: sidebar collapses on mobile.
2. Route `/analytics` uses `DashboardLayout`.
3. Integrate Phase 5 `StatsChart` into `ChartPanel`.

- [x] `DashboardLayout` + `/analytics` grid
- [x] `StatCard` / `ChartPanel` on shared tokens (`_tokens.css`)

**Проверка:** axe DevTools 0 critical on dashboard.

### V.6.2 — StatCard & ChartPanel

```vue
<!-- components/StatCard.vue -->
<template>
  <article class="stat-card" :style="{ borderColor: 'var(--color-primary)' }">
    <h3>{{ title }}</h3>
    <p class="stat-value">{{ value }}</p>
  </article>
</template>
```

**Tokens:** import shared CSS variables; no hardcoded hex in components.

- [x] StatCard / ChartPanel use CSS variables

### V.6.3 — Theme + a11y

- Theme toggle in sidebar footer — `data-theme` on `<html>`.
- ChartPanel: `aria-label` on canvas wrapper.
- Focus order: sidebar links → main content.

- [x] Theme toggle + aria-labels on chart panels

**Критерий:** dashboard matches design token spec; charts readable in dark mode.

---

## Следующая фаза

→ [phase-07-seo-ssr-i18n.md](./phase-07-seo-ssr-i18n.md)


