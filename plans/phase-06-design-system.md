# Phase 6 — Design System
> **Теория:** [guides/phase-06-design-system-theory.md](./guides/phase-06-design-system-theory.md) — статус: placeholder  
> **Multi-stack:** Angular + React/Next + Vue — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md)

**Длительность:** 13–14 недели (40–50 ч)  
**Предусловия:** Phase 5, Nx workspace  
**Цель:** Publishable UI lib, tokens, Storybook, app fully on DS components.

---

## Результат фазы

- [ ] `libs/shared/ui` с Button, Input, Card, Modal, Toast, Checkbox
- [x] Design tokens (CSS variables)
- [x] Light/dark theme
- [ ] Storybook 8
- [ ] a11y pass на компонентах
- [ ] Auth + Todos UI migrated

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

### 6.2.2 Input / FormField

- `FormFieldComponent`: label + hint + error slot.
- Works with reactive + signal forms (ControlValueAccessor).

### 6.2.3 Card, Checkbox, Spinner

- Checkbox: keyboard Space, aria-checked.

---

## Неделя 3 — Overlay components

### 6.3.1 Toast

- Already from Phase 1 — migrate to DS Toast in lib.

### 6.3.2 Modal

- `cdk-dialog` or custom focus trap.
- `role="dialog"`, `aria-modal="true"`.
- Escape closes.

### 6.3.3 a11y checklist per component

**Файл:** `libs/shared/ui/A11Y.md`

- [ ] Color contrast 4.5:1
- [ ] Focus order
- [ ] Screen reader labels

---

## Неделя 4 — Storybook

### 6.4.1 Setup

```bash
npx storybook@latest init --type angular
```

Target: `libs/shared/ui`.

### 6.4.2 Stories (minimum)

| Component | Stories |
|-----------|---------|
| Button | all variants, disabled, loading |
| Input | error state, disabled |
| Card | default |
| Modal | open/close |
| Checkbox | checked/unchecked |

### 6.4.3 Docs addon

- Autodocs from JSDoc on inputs.
- Composition examples.

---

## Неделя 5 — App migration

### 6.5.1 Auth pages

Replace raw `<button>`, `<input>` with DS.

### 6.5.2 Todo list

- `TodoItem` uses DS Checkbox + Button.
- Empty state Card.

### 6.5.3 Visual regression (optional)

Chromatic/Percy — 5 stories on PR.

---

## Критерии готовности

- [ ] `nx storybook ui` runs
- [ ] No raw form controls in feature templates
- [ ] axe DevTools 0 critical on login/todos
- [ ] Theme persists + SSR no flash

---

## Product features

### PF-3.3 Kanban board (V3)

- [ ] CDK drag-drop + DS cards
- [ ] Columns: todo / in-progress / done
- [ ] **Подготовка к GraphQL:** Kanban over-fetching → [Phase 13-GraphQL](./phase-13-graphql-client.md)
- [ ] **Vue analytics layout:** dashboard sidebar + chart grid в `analytics-mfe` — см. [multi-stack-roadmap.md](./multi-stack-roadmap.md) Phase 6

### PF-3.4 Calendar view (V3)

- [ ] Month grid + todos with `dueDate`
- [ ] `TagChip`, `PriorityBadge` components

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

### V.6.3 — Theme + a11y

- Theme toggle in sidebar footer — `data-theme` on `<html>`.
- ChartPanel: `aria-label` on canvas wrapper.
- Focus order: sidebar links → main content.

**Критерий:** dashboard matches design token spec; charts readable in dark mode.

---

## Следующая фаза

→ [phase-07-seo-ssr-i18n.md](./phase-07-seo-ssr-i18n.md)


