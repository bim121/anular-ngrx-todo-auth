import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectGlobalError } from '@app/features/ui/data-access/ui.selectors';
import { globalErrorCleared } from '@app/features/ui/data-access/ui.actions';

@Component({
  selector: 'app-global-error-banner',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './global-error-banner.component.html',
  styleUrl: './global-error-banner.component.css',
})
export class GlobalErrorBannerComponent {
  private store = inject(Store);

  error$ = this.store.select(selectGlobalError);

  dismiss(): void {
    this.store.dispatch(globalErrorCleared());
  }
}
