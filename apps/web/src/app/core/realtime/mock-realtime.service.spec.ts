import { MockRealtimeService } from './mock-realtime.service';
import { RealtimeEvent } from './realtime.model';

describe('MockRealtimeService', () => {
  let service: MockRealtimeService;

  beforeEach(() => {
    service = new MockRealtimeService();
  });

  afterEach(() => {
    service.disconnect();
  });

  it('connects and emits a presence event', async () => {
    const events: RealtimeEvent[] = [];
    service.events$.subscribe((e) => events.push(e));

    service.connect('user_1');
    await Promise.resolve();

    expect(events.some((e) => e.type === 'presence')).toBe(true);
  });

  it('disconnect stops further emissions after cleanup', () => {
    service.connect('user_1');
    service.disconnect();
    let status = '';
    service.status$.subscribe((s) => (status = s));
    expect(status).toBe('disconnected');
  });
});
