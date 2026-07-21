import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/** Cancels in-flight HTTP work when auth session ends (logout). */
@Injectable({ providedIn: 'root' })
export class EffectsLifecycleService {
  private readonly cancelPendingRequests$ = new Subject<void>();

  readonly cancelPendingRequests: Observable<void> =
    this.cancelPendingRequests$.asObservable();

  notifyCancelPendingRequests(): void {
    this.cancelPendingRequests$.next();
  }
}
