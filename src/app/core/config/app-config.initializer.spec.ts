import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { loadAppConfig } from './app-config.initializer';
import * as AppConfigActions from './app-config.actions';

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

  it('loads features from /assets/config.json', async () => {
    const promise = TestBed.runInInjectionContext(loadAppConfig);

    const req = httpMock.expectOne('/assets/config.json');
    expect(req.request.method).toBe('GET');
    req.flush({ features: { analytics: true, betaTodos: false } });

    await promise;

    expect(store.dispatch).toHaveBeenCalledWith(
      AppConfigActions.loadAppConfig({
        features: { analytics: true, betaTodos: false },
      })
    );
  });

  it('dispatches empty features when config load fails', async () => {
    const promise = TestBed.runInInjectionContext(loadAppConfig);

    const req = httpMock.expectOne('/assets/config.json');
    req.error(new ProgressEvent('error'));

    await promise;

    expect(store.dispatch).toHaveBeenCalledWith(
      AppConfigActions.loadAppConfig({ features: {} })
    );
  });
});
