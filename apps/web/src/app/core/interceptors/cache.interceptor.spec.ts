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
import { firstValueFrom } from 'rxjs';
import {
  HTTP_CACHE_TTL_MS,
  HttpCacheService,
} from '@app/core/http/http-cache.service';
import {
  cacheInterceptor,
  resetHttpCacheInflightForTests,
} from './cache.interceptor';

const TODOS_URL = 'http://localhost:3000/todos?userId=u1';

describe('cacheInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let cache: HttpCacheService;

  beforeEach(() => {
    resetHttpCacheInflightForTests();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    cache = TestBed.inject(HttpCacheService);
    cache.clear();
  });

  afterEach(() => {
    httpMock.verify();
    resetHttpCacheInflightForTests();
    cache.clear();
  });

  it('caches GET /todos and serves a fresh hit without a second network call', async () => {
    const first = firstValueFrom(http.get<unknown[]>(TODOS_URL));
    const req1 = httpMock.expectOne(TODOS_URL);
    req1.flush([{ id: '1', task: 'A' }]);
    await first;

    const second = await firstValueFrom(http.get<unknown[]>(TODOS_URL));
    httpMock.expectNone(TODOS_URL);
    expect(second).toEqual([{ id: '1', task: 'A' }]);
  });

  it('invalidates cache after POST /todos', async () => {
    const primed = firstValueFrom(http.get<unknown[]>(TODOS_URL));
    httpMock.expectOne(TODOS_URL).flush([{ id: '1' }]);
    await primed;

    const posted = firstValueFrom(http.post(TODOS_URL.split('?')[0], { task: 'B' }));
    httpMock.expectOne('http://localhost:3000/todos').flush({ id: '2' });
    await posted;

    expect(cache.size()).toBe(0);

    const reloaded = firstValueFrom(http.get<unknown[]>(TODOS_URL));
    httpMock.expectOne(TODOS_URL).flush([{ id: '1' }, { id: '2' }]);
    expect(await reloaded).toHaveLength(2);
  });

  it('stale-while-revalidate emits cache then network body', async () => {
    cache.set(
      `GET:${TODOS_URL}`,
      [{ id: 'stale' }],
      -1 // already expired
    );

    const values: unknown[] = [];
    await new Promise<void>((resolve, reject) => {
      http.get<unknown[]>(TODOS_URL).subscribe({
        next: (body) => values.push(body),
        error: reject,
        complete: () => resolve(),
      });
      const req = httpMock.expectOne(TODOS_URL);
      req.flush([{ id: 'fresh' }]);
    });

    expect(values).toEqual([[{ id: 'stale' }], [{ id: 'fresh' }]]);
  });

  it('deduplicates concurrent GETs into one network request', async () => {
    const a = firstValueFrom(http.get<unknown[]>(TODOS_URL));
    const b = firstValueFrom(http.get<unknown[]>(TODOS_URL));

    const reqs = httpMock.match(TODOS_URL);
    expect(reqs).toHaveLength(1);
    reqs[0].flush([{ id: '1' }]);

    expect(await a).toEqual([{ id: '1' }]);
    expect(await b).toEqual([{ id: '1' }]);
  });

  it('exposes TTL constant of 30s', () => {
    expect(HTTP_CACHE_TTL_MS).toBe(30_000);
  });
});
