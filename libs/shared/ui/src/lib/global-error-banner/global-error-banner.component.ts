import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { GlobalErrorService } from '../global-error.service';

@Component({
  selector: 'app-global-error-banner',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './global-error-banner.component.html',
  styleUrl: './global-error-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalErrorBannerComponent {
  private readonly globalErrors = inject(GlobalErrorService);

  error$ = this.globalErrors.error$.pipe(map((state) => state?.message ?? null));

  dismiss(): void {
    this.globalErrors.clear();
  }
}
