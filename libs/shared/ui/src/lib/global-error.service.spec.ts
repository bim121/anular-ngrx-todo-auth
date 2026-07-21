import { GlobalErrorService } from './global-error.service';

describe('GlobalErrorService', () => {
  let service: GlobalErrorService;

  beforeEach(() => {
    service = new GlobalErrorService();
  });

  it('starts with null error', () => {
    let current: unknown = 'unset';
    service.error$.subscribe((v) => (current = v));
    expect(current).toBeNull();
  });

  it('raise then clear', () => {
    const values: unknown[] = [];
    service.error$.subscribe((v) => values.push(v));

    service.raise('boom');
    service.clear();

    expect(values[1]).toMatchObject({ message: 'boom' });
    expect(values[2]).toBeNull();
  });
});
