import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as AuthActions from '@app/features/auth/data-access/auth.actions';
import {
  selectAuthLoading,
  selectAuthError,
} from '@app/features/auth/data-access/auth.selectors';
import { SpinnerComponent } from '@app/shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private store = inject(Store);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading = toSignal(this.store.select(selectAuthLoading), {
    initialValue: false,
  });
  error = toSignal(this.store.select(selectAuthError), { initialValue: null });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.store.dispatch(
      AuthActions.loginUser({ credentials: { email, password } })
    );
  }
}
