import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { correlationIdInterceptor } from './correlation-id.interceptor';
import { retryInterceptor } from './retry.interceptor';

describe('HTTP interceptors', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([correlationIdInterceptor, retryInterceptor])
        ),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('correlationIdInterceptor sets X-Correlation-Id header', () => {
    http.get('/api/ping').subscribe();

    const req = httpMock.expectOne('/api/ping');
    expect(req.request.headers.get('X-Correlation-Id')).toMatch(
      /^[0-9a-f-]{36}$/i
    );
    req.flush({});
  });

  it('retryInterceptor retries failed GET requests', () => {
    http.get('/api/retry-me').subscribe({
      next: () => undefined,
      error: () => undefined,
    });

    const first = httpMock.expectOne('/api/retry-me');
    first.flush('fail', { status: 500, statusText: 'Server Error' });

    const second = httpMock.expectOne('/api/retry-me');
    second.flush('fail', { status: 500, statusText: 'Server Error' });

    const third = httpMock.expectOne('/api/retry-me');
    third.flush({ ok: true });
  });

  it('retryInterceptor does not retry POST', () => {
    http.post('/api/create', {}).subscribe({
      next: () => undefined,
      error: () => undefined,
    });

    const req = httpMock.expectOne('/api/create');
    req.flush('fail', { status: 500, statusText: 'Server Error' });
    httpMock.expectNone('/api/create');
  });
});
