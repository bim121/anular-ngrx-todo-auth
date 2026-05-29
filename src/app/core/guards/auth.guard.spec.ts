import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, firstValueFrom, isObservable, of } from 'rxjs';
import { authGuard } from './auth.guard';
import { selectIsLoggedIn } from '../../features/auth/data-access/auth.selectors';

const runGuard = () =>
  TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

const toPromise = (result: ReturnType<typeof runGuard>) =>
  isObservable(result) ? firstValueFrom(result) : Promise.resolve(result);

describe('authGuard', () => {
  let isLoggedIn$: BehaviorSubject<boolean>;
  let createUrlTreeSpy: ReturnType<typeof vi.fn>;
  const fakeUrlTree = {} as UrlTree;

  beforeEach(() => {
    isLoggedIn$ = new BehaviorSubject<boolean>(false);
    createUrlTreeSpy = vi.fn().mockReturnValue(fakeUrlTree);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Store,
          useValue: {
            select: (selector: unknown) =>
              selector === selectIsLoggedIn ? isLoggedIn$ : of(undefined),
          },
        },
        {
          provide: Router,
          useValue: { createUrlTree: createUrlTreeSpy },
        },
      ],
    });
  });

  it('allows activation when user is logged in', async () => {
    isLoggedIn$.next(true);
    const result = await toPromise(runGuard());

    expect(result).toBe(true);
    expect(createUrlTreeSpy).not.toHaveBeenCalled();
  });

  it('redirects to /login when user is not logged in', async () => {
    isLoggedIn$.next(false);
    const result = await toPromise(runGuard());

    expect(createUrlTreeSpy).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(fakeUrlTree);
  });
});
