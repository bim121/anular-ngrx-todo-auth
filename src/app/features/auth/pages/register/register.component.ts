import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  selectAuthLoading,
  selectAuthError,
} from '@app/features/auth/data-access/auth.selectors';
import * as AuthActions from '@app/features/auth/data-access/auth.actions';
import { Store } from '@ngrx/store';
import { SpinnerComponent } from '@app/shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, SpinnerComponent],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private store = inject(Store);

  loading = toSignal(this.store.select(selectAuthLoading), {
    initialValue: false,
  });
  error = toSignal(this.store.select(selectAuthError), { initialValue: null });

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    const { name, email, password } = form.value;
    this.store.dispatch(
      AuthActions.registerUser({ credentials: { name, email, password } })
    );
  }
}
