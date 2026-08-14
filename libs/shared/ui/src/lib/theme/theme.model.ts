/** User-selected mode, persisted in localStorage (`theme`). */
export type ThemePreference = 'light' | 'dark' | 'system';

/** Resolved palette applied as `data-theme` on <html>. */
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
