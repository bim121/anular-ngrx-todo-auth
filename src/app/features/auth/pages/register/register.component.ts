import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { form } from '@angular/forms/signals';
import { Store } from '@ngrx/store';
import {
  selectAuthLoading,
  selectAuthError,
} from '@app/features/auth/data-access/auth.selectors';
import * as AuthActions from '@app/features/auth/data-access/auth.actions';
import {
  applyRegisterFieldRules,
  markRegisterFieldsTouched,
  RegisterFormModel,
} from '@app/features/auth/data-access/auth-signal-form.schema';
import { FormFieldComponent } from '@app/shared/ui/form-field/form-field.component';
import { SpinnerComponent } from '@app/shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-register',
  imports: [RouterLink, SpinnerComponent, FormFieldComponent],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly store = inject(Store);

  private readonly model = signal<RegisterFormModel>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  readonly loading = toSignal(this.store.select(selectAuthLoading), {
    initialValue: false,
  });
  readonly error = toSignal(this.store.select(selectAuthError), {
    initialValue: null,
  });

  readonly registerForm = form(this.model, (fields) => {
    applyRegisterFieldRules(fields, () => this.loading());
  });

  submit(event: Event): void {
    event.preventDefault();

    if (this.registerForm().invalid()) {
      markRegisterFieldsTouched(this.registerForm);
      return;
    }

    const { name, email, password } = this.registerForm().value();
    this.store.dispatch(
      AuthActions.registerUser({ credentials: { name, email, password } })
    );
  }
}
