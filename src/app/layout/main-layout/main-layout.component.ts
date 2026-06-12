import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { User } from '@app/features/auth/data-access/auth.model';
import { selectUser } from '@app/features/auth/data-access/auth.selectors';
import * as AuthActions from '@app/features/auth/data-access/auth.actions';
import { RoutePageContextService } from '@app/core/services/route-page-context.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly store = inject(Store);
  readonly pageContext = inject(RoutePageContextService);

  readonly user = toSignal(this.store.select(selectUser), {
    initialValue: null as User | null,
  });

  logout(): void {
    this.store.dispatch(AuthActions.logoutUser());
  }
}
