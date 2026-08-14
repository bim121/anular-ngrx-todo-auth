import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ThemeStore } from '@anular-ngrx/shared-ui';
import { ThemeService } from './theme.service';
import { UiEventsService } from './ui-events.service';

describe('ThemeService + UiEventsService', () => {
  beforeEach(() => {
    localStorage.removeItem('theme');
    document.documentElement.removeAttribute('data-theme');

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
      providers: [ThemeStore, ThemeService, UiEventsService],
    });
  });

  it('toggle publishes themeChanged$ and sets data-theme', async () => {
    const theme = TestBed.inject(ThemeService);
    const events = TestBed.inject(UiEventsService);

    theme.setTheme('light');
    const nextTheme = firstValueFrom(events.themeChanged$);
    theme.toggle();

    await expect(nextTheme).resolves.toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(theme.theme()).toBe('dark');
    expect(theme.preference()).toBe('dark');
  });
});
