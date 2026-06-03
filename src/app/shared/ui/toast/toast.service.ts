import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Toast, ToastType } from './toast.model';

const DEFAULT_DURATION_MS = 4000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<Toast[]>([]);
  private idCounter = 0;

  readonly toasts$ = this.toastsSubject.asObservable();

  success(message: string, durationMs = DEFAULT_DURATION_MS): void {
    this.show('success', message, durationMs);
  }

  error(message: string, durationMs = DEFAULT_DURATION_MS): void {
    this.show('error', message, durationMs);
  }

  dismiss(id: number): void {
    this.toastsSubject.next(
      this.toastsSubject.value.filter((t) => t.id !== id)
    );
  }

  private show(type: ToastType, message: string, durationMs: number): void {
    const toast: Toast = { id: ++this.idCounter, message, type };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(toast.id), durationMs);
    }
  }
}
