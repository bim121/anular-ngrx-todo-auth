import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new ToastService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('success adds a success toast', () => {
    service.success('Saved!');

    expect(service['toastsSubject'].value).toEqual([
      { id: 1, message: 'Saved!', type: 'success' },
    ]);
  });

  it('error adds an error toast', () => {
    service.error('Failed');

    expect(service['toastsSubject'].value[0].type).toBe('error');
  });

  it('dismiss removes toast by id', () => {
    service.success('One');
    service.error('Two');
    service.dismiss(1);

    expect(service['toastsSubject'].value).toHaveLength(1);
    expect(service['toastsSubject'].value[0].id).toBe(2);
  });

  it('auto-dismisses after default duration', () => {
    service.success('Temporary');
    vi.advanceTimersByTime(4000);

    expect(service['toastsSubject'].value).toHaveLength(0);
  });
});
