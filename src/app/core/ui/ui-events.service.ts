import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Theme } from './theme.model';

/**
 * Lightweight UI event bus — features subscribe without knowing the publisher.
 * Phase 4.5.4: themeChanged$ is the first (and currently only) channel.
 */
@Injectable({ providedIn: 'root' })
export class UiEventsService {
  private readonly themeChangedSubject = new Subject<Theme>();

  readonly themeChanged$: Observable<Theme> =
    this.themeChangedSubject.asObservable();

  publishTheme(theme: Theme): void {
    this.themeChangedSubject.next(theme);
  }
}
