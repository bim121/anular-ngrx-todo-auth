import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form } from '@angular/forms/signals';
import { AuthFacade } from '@app/features/auth/data-access/auth.facade';
import {
  applyLoginFieldRules,
  LoginFormModel,
  markLoginFieldsTouched,
} from '@app/features/auth/data-access/auth-signal-form.schema';
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
