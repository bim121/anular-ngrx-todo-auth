import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AppLocale,
  SUPPORTED_LOCALES,
} from '@app/core/i18n/locale.constants';
import { LocaleService } from '@app/core/i18n/locale.service';
import { swapLocaleInPath } from '@app/core/i18n/locale.util';

@Component({
  selector: 'app-locale-switcher',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="locale-switcher" aria-label="Language">
      @for (locale of locales; track locale) {
        <a
          [routerLink]="switchPath(locale)"
          [class.locale-switcher__active]="current() === locale"
          [attr.lang]="locale"
        >
          {{ locale === 'en' ? 'EN' : 'RU' }}
        </a>
      }
    </nav>
  `,
  styles: `
    .locale-switcher {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .locale-switcher a {
      font-size: 0.875rem;
      text-decoration: none;
      opacity: 0.7;
    }

    .locale-switcher__active {
      font-weight: 600;
      opacity: 1;
      text-decoration: underline;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocaleSwitcherComponent {
  private readonly router = inject(Router);
  private readonly localeService = inject(LocaleService);

  readonly locales = SUPPORTED_LOCALES;
  readonly current = this.localeService.locale;

  switchPath(locale: AppLocale): string {
    const path = this.router.url.split('?')[0] ?? '/';
    return swapLocaleInPath(path, locale);
  }
}
