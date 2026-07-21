import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import { Theme } from './theme.model';
import { UiEventsService } from './ui-events.service';

export type { Theme };

/**
 * Applies theme to the document and publishes via UiEventsService
 * so header and features stay decoupled.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly events = inject(UiEventsService);
  private readonly themeSubject = new BehaviorSubject<Theme>(this.readInitialTheme());

  readonly themeChanged$ = this.themeSubject.asObservable();
  readonly theme = toSignal(this.themeChanged$, {
    initialValue: 'light' as Theme,
  });

  constructor() {
    this.apply(this.themeSubject.value);
    this.events.publishTheme(this.themeSubject.value);
  }

  setTheme(theme: Theme): void {
    if (theme === this.themeSubject.value) {
      return;
    }
    this.themeSubject.next(theme);
    this.apply(theme);
    this.events.publishTheme(theme);
  }

  toggle(): void {
    this.setTheme(this.themeSubject.value === 'light' ? 'dark' : 'light');
  }

  private apply(theme: Theme): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore quota / private mode */
    }
  }

  private readInitialTheme(): Theme {
    if (typeof localStorage === 'undefined') {
      return 'light';
    }
    try {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
}
