import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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
  imports: [FormsModule, RouterLink, SpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private store = inject(Store);

  loading = toSignal(this.store.select(selectAuthLoading), {
    initialValue: false,
  });
  error = toSignal(this.store.select(selectAuthError), { initialValue: null });

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    const { email, password } = form.value;
    this.store.dispatch(
      AuthActions.loginUser({ credentials: { email, password } })
    );
  }
}
