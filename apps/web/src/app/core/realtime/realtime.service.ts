import { Observable } from 'rxjs';
import { RealtimeConnectionStatus, RealtimeEvent } from './realtime.model';

/**
 * Port for live collaboration. WsRealtimeService is the Phase 5 default;
 * MockRealtimeService remains for unit tests / offline demos.
 */
export abstract class RealtimeService {
  abstract readonly status$: Observable<RealtimeConnectionStatus>;
  abstract readonly events$: Observable<RealtimeEvent>;

  abstract connect(userId: string, userName?: string): void;
  abstract disconnect(): void;
  abstract publishTodoUpdate(todo: {
    id: string;
    task?: string;
    completed?: boolean;
  }): void;
}
