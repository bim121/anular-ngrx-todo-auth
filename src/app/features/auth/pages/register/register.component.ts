import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form } from '@angular/forms/signals';
import { AuthFacade } from '@app/features/auth/data-access/auth.facade';
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
  private readonly auth = inject(AuthFacade);

  private readonly model = signal<RegisterFormModel>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  readonly loading = this.auth.loading;
  readonly error = this.auth.error;

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
    this.auth.register({ name, email, password });
  }
}
