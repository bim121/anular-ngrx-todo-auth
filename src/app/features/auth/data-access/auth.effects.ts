import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map, of, tap } from "rxjs";
import { ToastService } from "@app/shared/ui/toast/toast.service";
import * as fromAuth from './auth.actions';

@Injectable()
export class AuthEffects {
    private actions$ = inject(Actions);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toast = inject(ToastService);

    registerUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromAuth.registerUser),
            exhaustMap(action =>
                this.authService.register(action.credentials).pipe(
                    map(user => fromAuth.registerSuccess({user})),
                    catchError(error => of(fromAuth.registerFailure({error})))
                )
            )
        )
    );

    registerSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(fromAuth.registerSuccess),
                tap(() => {
                    this.toast.success(
                        'Registration successful! Please log in.'
                    );
                })
            ),
        { dispatch: false }
    );

    loginUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromAuth.loginUser),
            exhaustMap(action =>
                this.authService.login(action.credentials).pipe(
                    map(authResponse => fromAuth.loginSuccess({authResponse})),
                    catchError(error => of(fromAuth.loginFailure({error})))
                )
            )
        )
    );

    loginSuccess$ = createEffect(() => 
        this.actions$.pipe(
            ofType(fromAuth.loginSuccess),
            tap(() => {
                this.router.navigate(['/todos']);
            })
        ), {dispatch: false}
    );

    logoutUser$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(fromAuth.logoutUser),
                tap(() => {
                    this.router.navigate(['/login']);
                })
            ),
        { dispatch: false }
    );
}