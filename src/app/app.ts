import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoutePageContextService } from '@app/core/services/route-page-context.service';
import { GlobalErrorBannerComponent } from '@app/shared/ui/global-error-banner/global-error-banner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalErrorBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  /** Eager init: syncs `document.title` from route `data` on every navigation. */
  private readonly _routePageContext = inject(RoutePageContextService);
}
