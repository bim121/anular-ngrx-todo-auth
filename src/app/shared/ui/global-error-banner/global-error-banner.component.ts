import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { GlobalErrorService } from '@app/core/services/global-error.service';

@Component({
  selector: 'app-global-error-banner',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './global-error-banner.component.html',
  styleUrl: './global-error-banner.component.css',
})
export class GlobalErrorBannerComponent {
  private readonly globalErrors = inject(GlobalErrorService);

  error$ = this.globalErrors.error$.pipe(map((state) => state?.message ?? null));

  dismiss(): void {
    this.globalErrors.clear();
  }
}
