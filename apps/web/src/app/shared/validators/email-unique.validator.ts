import { inject } from '@angular/core';
import { AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { AuthService } from '@anular-ngrx/auth-data-access';
import { catchError, map, of, switchMap, timer } from 'rxjs';

/** Debounced async check against GET `/users?email=` (json-server). */
export function emailUniqueValidator(): AsyncValidatorFn {
  const authService = inject(AuthService);

  return (control) => {
    const email = (control.value as string)?.trim()?.toLowerCase();

    if (!email) {
      return of(null);
    }

    return timer(400).pipe(
      switchMap(() =>
        authService.checkEmailAvailable(email).pipe(
          map((users) => (users.length > 0 ? ({ emailTaken: true } as ValidationErrors) : null)),
          catchError(() => of(null)),
        ),
      ),
    );
  };
}
