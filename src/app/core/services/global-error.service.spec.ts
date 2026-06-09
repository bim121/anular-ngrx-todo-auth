import { firstValueFrom } from 'rxjs';
import { GlobalErrorService } from './global-error.service';

describe('GlobalErrorService', () => {
  let service: GlobalErrorService;

  beforeEach(() => {
    service = new GlobalErrorService();
  });

  it('raise emits message and timestamp', async () => {
    service.raise('Something broke');

    const state = await firstValueFrom(service.error$);
    expect(state?.message).toBe('Something broke');
    expect(state?.raisedAt).toEqual(expect.any(Number));
  });

  it('clear resets to null', async () => {
    service.raise('Oops');
    service.clear();

    const state = await firstValueFrom(service.error$);
    expect(state).toBeNull();
  });
});
