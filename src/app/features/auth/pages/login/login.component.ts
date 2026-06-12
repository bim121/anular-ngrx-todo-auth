import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { form } from '@angular/forms/signals';
import { Store } from '@ngrx/store';
import * as AuthActions from '@app/features/auth/data-access/auth.actions';
import {
  applyLoginFieldRules,
  LoginFormModel,
  markLoginFieldsTouched,
} from '@app/features/auth/data-access/auth-signal-form.schema';
import {
  selectAuthLoading,
  selectAuthError,
} from '@app/features/auth/data-access/auth.selectors';
import { FormFieldComponent } from '@app/shared/ui/form-field/form-field.component';
import { SpinnerComponent } from '@app/shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, FormFieldComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly store = inject(Store);

  private readonly model = signal<LoginFormModel>({ email: '', password: '' });

  readonly loading = toSignal(this.store.select(selectAuthLoading), {
    initialValue: false,
  });
  readonly error = toSignal(this.store.select(selectAuthError), {
    initialValue: null,
  });

  readonly loginForm = form(this.model, (fields) => {
    applyLoginFieldRules(fields, () => this.loading());
  });

  submit(event: Event): void {
    event.preventDefault();

    if (this.loginForm().invalid()) {
      markLoginFieldsTouched(this.loginForm);
      return;
    }

    const { email, password } = this.loginForm().value();
    this.store.dispatch(
      AuthActions.loginUser({ credentials: { email, password } })
    );
  }
}
