import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '@app/features/auth/data-access/auth.model';
import { selectUser } from '@app/features/auth/data-access/auth.selectors';
import * as AuthActions from '@app/features/auth/data-access/auth.actions';
import { RoutePageContextService } from '@app/core/services/route-page-context.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AsyncPipe],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  private store = inject(Store);
  readonly pageContext = inject(RoutePageContextService);

  user$: Observable<User | null> = this.store.select(selectUser);

  logout(): void {
    this.store.dispatch(AuthActions.logoutUser());
  }
}
