import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GlobalErrorState {
  message: string;
  raisedAt: number;
}

@Injectable({ providedIn: 'root' })
export class GlobalErrorService {
  private readonly errorSubject = new BehaviorSubject<GlobalErrorState | null>(
    null
  );

  readonly error$ = this.errorSubject.asObservable();

  raise(message: string): void {
    this.errorSubject.next({ message, raisedAt: Date.now() });
  }

  clear(): void {
    this.errorSubject.next(null);
  }
}
