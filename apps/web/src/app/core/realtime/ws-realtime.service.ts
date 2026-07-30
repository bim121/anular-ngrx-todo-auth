import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
} from 'rxjs';
import {
  RealtimeConnectionStatus,
  RealtimeEvent,
  TodoUpdatedRealtimeEvent,
} from './realtime.model';
import { RealtimeService } from './realtime.service';

const WS_URL =
  (typeof globalThis !== 'undefined' &&
    (globalThis as { __REALTIME_WS_URL__?: string }).__REALTIME_WS_URL__) ||
  'ws://localhost:3001';

const MAX_BACKOFF_MS = 30_000;

/**
 * Native WebSocket transport with exponential backoff reconnect (PF-1.1).
 */
@Injectable()
export class WsRealtimeService extends RealtimeService {
  private readonly statusSubject =
    new BehaviorSubject<RealtimeConnectionStatus>('idle');
  private readonly eventsSubject = new Subject<RealtimeEvent>();
  private socket: WebSocket | null = null;
  private userId: string | null = null;
  private userName = 'Someone';
  private intentionalClose = false;
  private attempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  readonly status$: Observable<RealtimeConnectionStatus> =
    this.statusSubject.asObservable();
  readonly events$: Observable<RealtimeEvent> =
    this.eventsSubject.asObservable();

  connect(userId: string, userName = 'You'): void {
    this.userId = userId;
    this.userName = userName;
    this.intentionalClose = false;
    this.attempt = 0;
    this.openSocket();
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.clearReconnect();
    this.socket?.close();
    this.socket = null;
    this.userId = null;
    this.statusSubject.next('disconnected');
  }

  /** Broadcast a local mutation to other browsers. */
  publishTodoUpdate(todo: {
    id: string;
    task?: string;
    completed?: boolean;
  }): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const event: TodoUpdatedRealtimeEvent = {
      type: 'todo.updated',
      todo,
      byUserName: this.userName,
      at: new Date().toISOString(),
    };
    this.socket.send(JSON.stringify(event));
  }

  private openSocket(): void {
    if (!this.userId) return;

    this.clearReconnect();
    this.statusSubject.next('connecting');

    const socket = new WebSocket(
      `${WS_URL}?userId=${encodeURIComponent(this.userId)}`
    );
    this.socket = socket;

    socket.onopen = () => {
      this.attempt = 0;
      this.statusSubject.next('connected');
    };

    socket.onmessage = (message) => {
      try {
        const event = JSON.parse(String(message.data)) as RealtimeEvent;
        this.eventsSubject.next(event);
      } catch {
        // ignore malformed
      }
    };

    socket.onerror = () => {
      this.statusSubject.next('error');
    };

    this.socket.onclose = () => {
      this.socket = null;
      if (this.intentionalClose) {
        this.statusSubject.next('disconnected');
        return;
      }
      this.statusSubject.next('disconnected');
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    this.clearReconnect();
    const delay = Math.min(1000 * 2 ** this.attempt, MAX_BACKOFF_MS);
    this.attempt += 1;
    this.reconnectTimer = setTimeout(() => this.openSocket(), delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer != null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
