import { Provider } from '@angular/core';
import { RealtimeService } from './realtime.service';
import { MockRealtimeService } from './mock-realtime.service';

/** Default realtime transport — swap useClass when SignalR hub lands (Phase 5). */
export function provideRealtimeService(): Provider {
  return { provide: RealtimeService, useClass: MockRealtimeService };
}
