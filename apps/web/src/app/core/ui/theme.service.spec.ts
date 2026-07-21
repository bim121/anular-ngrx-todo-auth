import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ThemeService } from './theme.service';
import { UiEventsService } from './ui-events.service';

describe('ThemeService + UiEventsService', () => {
  beforeEach(() => {
    localStorage.removeItem('theme');
    document.documentElement.removeAttribute('data-theme');

    TestBed.configureTestingModule({
      providers: [ThemeService, UiEventsService],
    });
  });

  it('toggle publishes themeChanged$ and sets data-theme', async () => {
    const theme = TestBed.inject(ThemeService);
    const events = TestBed.inject(UiEventsService);

    const nextTheme = firstValueFrom(events.themeChanged$);
    theme.toggle();

    await expect(nextTheme).resolves.toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(theme.theme()).toBe('dark');
  });
});
