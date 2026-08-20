<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';

defineProps<{
  userName?: string | null;
  themeLabel: string;
}>();

const emit = defineEmits<{
  logout: [];
  toggleTheme: [];
}>();

const route = useRoute();

const links = [
  { to: '/analytics', label: 'Analytics' },
  { to: '/todos', label: 'Todos' },
] as const;
</script>

<template>
  <div class="dashboard">
    <aside class="sidebar" aria-label="Analytics navigation">
      <div class="sidebar__brand">
        <p class="eyebrow">analytics-mfe</p>
        <strong>Dashboard</strong>
      </div>
      <nav class="sidebar__nav">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="sidebar__link"
          :class="{ active: route.path === link.to }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
      <div class="sidebar__footer">
        <p v-if="userName" class="sidebar__user">{{ userName }}</p>
        <button type="button" class="theme-btn" @click="emit('toggleTheme')">
          Theme: {{ themeLabel }}
        </button>
        <button type="button" class="logout-btn" @click="emit('logout')">Logout</button>
      </div>
    </aside>
    <div class="main">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 14rem 1fr;
  background: var(--color-bg, #f4f6f8);
  color: var(--color-text, #1f2937);
  font-family: var(--font-sans, system-ui, sans-serif);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1rem;
  background: var(--color-surface, #fff);
  border-right: 1px solid var(--color-border, #e5e7eb);
}

.sidebar__brand .eyebrow {
  margin: 0;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted, #6b7280);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.sidebar__link {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  color: var(--color-muted, #6b7280);
  text-decoration: none;
  font-weight: 500;
}

.sidebar__link.active,
.sidebar__link:hover {
  background: var(--color-primary-subtle, #dbeafe);
  color: var(--color-primary, #3b82f6);
}

.sidebar__footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar__user {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-muted, #6b7280);
}

.theme-btn,
.logout-btn {
  padding: 0.45rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-surface, #fff);
  color: var(--color-text, #1f2937);
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;
}

.logout-btn {
  background: var(--color-danger, #ef4444);
  border-color: transparent;
  color: #fff;
}

.main {
  padding: 1.25rem;
  min-width: 0;
}

@media (max-width: 720px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: none;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .sidebar__nav {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
