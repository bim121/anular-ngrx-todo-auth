# Phase 6 — Design System

**Длительность:** 13–14 недели (40–50 ч)  
**Предусловия:** Phase 5, Nx workspace  
**Цель:** Publishable UI lib, tokens, Storybook, app fully on DS components.

---

## Результат фазы

- [ ] `libs/shared/ui` с Button, Input, Card, Modal, Toast, Checkbox
- [ ] Design tokens (CSS variables)
- [ ] Light/dark theme
- [ ] Storybook 8
- [ ] a11y pass на компонентах
- [ ] Auth + Todos UI migrated

---

## Неделя 1 — Tokens & theming

### 6.1.1 Token file

**Файл:** `libs/shared/ui/styles/_tokens.css`

```css
:root {
  --color-primary: #3b82f6;
  --color-danger: #ef4444;
  --space-1: 0.25rem;
  --space-4: 1rem;
  --radius-md: 0.375rem;
  --font-sans: system-ui, sans-serif;
  --shadow-md: 0 4px 6px rgb(0 0 0 / 0.1);
}

[data-theme="dark"] {
  --color-primary: #60a5fa;
  /* ... */
}
```

### 6.1.2 Theme service

- Store slice или SignalStore: `theme: 'light' | 'dark' | 'system'`.
- `document.documentElement.setAttribute('data-theme', ...)`.

### 6.1.3 SSR no-flash

**Файл:** `src/index.html` inline script (minimal):
```html
<script>
  (function(){ /* read localStorage theme */ })();
</script>
```

### 6.1.4 Интеграция твоей DS

- Подключить пакет твоей design system (npm link / workspace path).
- ADR-008: wrapper components vs direct import.

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

### PF-3.4 Calendar view (V3)

- [ ] Month grid + todos with `dueDate`
- [ ] `TagChip`, `PriorityBadge` components

---

## Следующая фаза

→ [phase-07-seo-ssr-i18n.md](./phase-07-seo-ssr-i18n.md)
