import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY } from './theme.model';
import { resolveTheme, ThemeStore } from './theme.store';

describe('ThemeStore', () => {
  beforeEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-theme-preference');
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
    TestBed.configureTestingModule({
      providers: [ThemeStore],
    });
  });

  it('resolveTheme maps system to OS preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('cycle walks light → dark → system and writes data-theme', () => {
    const store = TestBed.inject(ThemeStore);
    store.setPreference('light');

    store.cycle();
    expect(store.preference()).toBe('dark');
    expect(store.resolved()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    store.cycle();
    expect(store.preference()).toBe('system');
    expect(document.documentElement.getAttribute('data-theme-preference')).toBe(
      'system'
    );
  });
});
