import { Provider } from '@angular/core';
import { RealtimeService } from './realtime.service';
import { WsRealtimeService } from './ws-realtime.service';

/** Default realtime transport — native WebSocket hub on :3001 (PF-1.1). */
export function provideRealtimeService(): Provider {
  return { provide: RealtimeService, useClass: WsRealtimeService };
}
