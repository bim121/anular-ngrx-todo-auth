import { Component, inject, OnInit } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  selectAuthLoading,
  selectAuthError,
} from '@app/features/auth/data-access/auth.selectors';
import * as AuthActions from '@app/features/auth/data-access/auth.actions';
import { Store } from '@ngrx/store';
import { SpinnerComponent } from '@app/shared/ui/spinner/spinner.component';
import { passwordMatchValidator } from '@app/shared/validators/password-match.validator';
import { emailUniqueValidator } from '@app/shared/validators/email-unique.validator';
import { emailFormatValidator } from '@app/shared/validators/email-format.validator';
import { AUTH_VALIDATION_MESSAGES } from '@shared/validators/email';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(NonNullableFormBuilder);

  readonly messages = AUTH_VALIDATION_MESSAGES;

  form = this.fb.group(
    {
      name: [''],
      email: [
        '',
        [Validators.required, emailFormatValidator()],
        { asyncValidators: [emailUniqueValidator()], updateOn: 'blur' },
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator() }
  );

  loading = toSignal(this.store.select(selectAuthLoading), {
    initialValue: false,
  });
  error = toSignal(this.store.select(selectAuthError), { initialValue: null });

  ngOnInit(): void {
    this.form.get('password')?.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity();
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.getRawValue();
    this.store.dispatch(
      AuthActions.registerUser({ credentials: { name, email, password } })
    );
  }
}
