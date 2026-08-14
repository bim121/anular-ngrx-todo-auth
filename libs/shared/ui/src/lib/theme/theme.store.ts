import {
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  ResolvedTheme,
  THEME_STORAGE_KEY,
  ThemePreference,
} from './theme.model';

export interface ThemeState {
  preference: ThemePreference;
  systemDark: boolean;
}

const PREFERENCE_CYCLE: ThemePreference[] = ['light', 'dark', 'system'];

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function resolveTheme(
  preference: ThemePreference,
  systemDark: boolean
): ResolvedTheme {
  if (preference === 'system') {
    return systemDark ? 'dark' : 'light';
  }
  return preference;
}

function readStoredPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

function prefersDark(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

function applyToDocument(
  preference: ThemePreference,
  systemDark: boolean
): void {
  if (typeof document === 'undefined') {
    return;
  }
  const resolved = resolveTheme(preference, systemDark);
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.setAttribute('data-theme-preference', preference);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Design-system theme state (Phase 6.1.2).
 * Writes `data-theme` on <html>; `system` follows prefers-color-scheme.
 */
export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState<ThemeState>({
    preference: 'system',
    systemDark: false,
  }),
  withComputed(({ preference, systemDark }) => ({
    resolved: computed(() => resolveTheme(preference(), systemDark())),
  })),
  withMethods((store) => ({
    setPreference(preference: ThemePreference): void {
      patchState(store, { preference });
      applyToDocument(preference, store.systemDark());
    },
    cycle(): void {
      const index = PREFERENCE_CYCLE.indexOf(store.preference());
      const next = PREFERENCE_CYCLE[(index + 1) % PREFERENCE_CYCLE.length];
      patchState(store, { preference: next });
      applyToDocument(next, store.systemDark());
    },
  })),
  withHooks({
    onInit(store) {
      const platformId = inject(PLATFORM_ID);
      if (!isPlatformBrowser(platformId)) {
        return;
      }

      const preference = readStoredPreference();
      const systemDark = prefersDark();
      patchState(store, { preference, systemDark });
      applyToDocument(preference, systemDark);

      if (typeof window.matchMedia === 'function') {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (event: MediaQueryListEvent) => {
          patchState(store, { systemDark: event.matches });
          applyToDocument(store.preference(), event.matches);
        };
        media.addEventListener('change', onChange);
        inject(DestroyRef).onDestroy(() => {
          media.removeEventListener('change', onChange);
        });
      }
    },
  })
);
