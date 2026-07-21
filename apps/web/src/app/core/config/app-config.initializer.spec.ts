import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { loadAppConfig } from './app-config.initializer';
import * as AppConfigActions from './app-config.actions';
import { DEFAULT_APP_CONFIG } from './app-config.model';

describe('loadAppConfig initializer', () => {
  let httpMock: HttpTestingController;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideMockStore()],
    });

    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads config from /assets/app-config.json via ConfigService', async () => {
    const promise = TestBed.runInInjectionContext(loadAppConfig);

    const req = httpMock.expectOne('/assets/app-config.json');
    expect(req.request.method).toBe('GET');
    req.flush({
      apiBaseUrl: 'http://localhost:3000',
      features: { analytics: true, betaTodos: false },
    });

    await promise;

    expect(store.dispatch).toHaveBeenCalledWith(
      AppConfigActions.loadAppConfig({
        config: {
          apiBaseUrl: 'http://localhost:3000',
          features: { analytics: true, betaTodos: false },
        },
      }),
    );
  });

  it('dispatches defaults when config load fails', async () => {
    const promise = TestBed.runInInjectionContext(loadAppConfig);

    const req = httpMock.expectOne('/assets/app-config.json');
    req.error(new ProgressEvent('error'));

    await promise;

    expect(store.dispatch).toHaveBeenCalledWith(
      AppConfigActions.loadAppConfig({ config: { ...DEFAULT_APP_CONFIG } }),
    );
  });
});
