import { Injectable, effect, inject } from '@angular/core';
import { ThemePreference, ThemeStore } from '@anular-ngrx/shared-ui';
import { UiEventsService } from './ui-events.service';

export type { ThemePreference };
export type Theme = 'light' | 'dark';

/**
 * App facade over DS ThemeStore — publishes resolved theme on UiEventsService
 * so header and features stay decoupled (Phase 4.5.4 / 6.1.2).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly store = inject(ThemeStore);
  private readonly events = inject(UiEventsService);

  readonly preference = this.store.preference;
  /** Resolved light/dark applied to the document. */
  readonly theme = this.store.resolved;

  constructor() {
    effect(() => {
      this.events.publishTheme(this.store.resolved());
    });
  }

  setTheme(theme: ThemePreference): void {
    this.store.setPreference(theme);
  }

  /** light → dark → system → light */
  toggle(): void {
    this.store.cycle();
  }
}
