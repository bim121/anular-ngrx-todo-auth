import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  interval,
  map,
  take,
} from 'rxjs';
import {
  RealtimeConnectionStatus,
  RealtimeEvent,
} from './realtime.model';
import { RealtimeService } from './realtime.service';

/**
 * In-memory mock of a WebSocket hub.
 * Emits a presence ping and a fake todo.updated every few seconds while connected.
 * Replace with real WS/SignalR without changing effects (same RealtimeService port).
 */
@Injectable()
export class MockRealtimeService extends RealtimeService {
  private readonly statusSubject =
    new BehaviorSubject<RealtimeConnectionStatus>('idle');
  private readonly eventsSubject = new Subject<RealtimeEvent>();
  private streamSub: Subscription | null = null;
  private connectedUserId: string | null = null;

  readonly status$: Observable<RealtimeConnectionStatus> =
    this.statusSubject.asObservable();
  readonly events$: Observable<RealtimeEvent> =
    this.eventsSubject.asObservable();

  connect(userId: string, _userName?: string): void {
    if (this.connectedUserId === userId && this.statusSubject.value === 'connected') {
      return;
    }

    this.disconnect();
    this.connectedUserId = userId;
    this.statusSubject.next('connecting');

    // Simulate async handshake
    queueMicrotask(() => {
      if (this.connectedUserId !== userId) return;
      this.statusSubject.next('connected');
      this.eventsSubject.next({
        type: 'presence',
        message: 'Realtime mock connected (Phase 4 prep)',
        at: new Date().toISOString(),
      });

      this.streamSub = interval(8_000)
        .pipe(
          take(3),
          map((i) => this.buildDemoEvent(i))
        )
        .subscribe((event) => this.eventsSubject.next(event));
    });
  }

  disconnect(): void {
    this.streamSub?.unsubscribe();
    this.streamSub = null;
    this.connectedUserId = null;
    if (this.statusSubject.value !== 'idle') {
      this.statusSubject.next('disconnected');
    }
  }

  publishTodoUpdate(_todo: {
    id: string;
    task?: string;
    completed?: boolean;
  }): void {
    // Mock hub is local-only — no peers.
  }

  private buildDemoEvent(index: number): RealtimeEvent {
    if (index % 2 === 0) {
      return {
        type: 'presence',
        message: `Other User is viewing todos (${index + 1})`,
        at: new Date().toISOString(),
      };
    }

    return {
      type: 'todo.updated',
      todo: {
        id: 'todo_1',
        task: `Learn NgRx Effects (synced #${index + 1})`,
      },
      byUserName: 'Other User',
      at: new Date().toISOString(),
    };
  }
}
