import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form } from '@angular/forms/signals';
import { AuthFacade } from '@anular-ngrx/auth-data-access';
import {
  applyLoginFieldRules,
  LoginFormModel,
  markLoginFieldsTouched,
} from '@anular-ngrx/auth-data-access/auth-signal-form.schema';
import { ButtonComponent, CardComponent } from '@anular-ngrx/shared-ui';
import { FormFieldComponent } from '@anular-ngrx/shared-ui/form-field/form-field.component';
import { SpinnerComponent } from '@anular-ngrx/shared-ui/spinner/spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    SpinnerComponent,
    FormFieldComponent,
    ButtonComponent,
    CardComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(AuthFacade);

  private readonly model = signal<LoginFormModel>({ email: '', password: '' });

  readonly loading = this.auth.loading;
  readonly error = this.auth.error;

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
    this.auth.login({ email, password });
  }
}
