import { Observable } from 'rxjs';
import { RealtimeConnectionStatus, RealtimeEvent } from './realtime.model';

/**
 * Port for live collaboration. MockRealtimeService for Phase 4;
 * swap to SignalR / native WebSocket in Phase 5 (B-13).
 */
export abstract class RealtimeService {
  abstract readonly status$: Observable<RealtimeConnectionStatus>;
  abstract readonly events$: Observable<RealtimeEvent>;

  abstract connect(userId: string): void;
  abstract disconnect(): void;
}
