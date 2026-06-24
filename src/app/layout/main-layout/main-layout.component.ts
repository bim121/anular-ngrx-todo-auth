import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { User } from '@app/features/auth/data-access/auth.model';
import { selectUser } from '@app/features/auth/data-access/auth.selectors';
import * as AuthActions from '@app/features/auth/data-access/auth.actions';
import {
  selectAllNotifications,
  selectUnreadNotificationsCount,
} from '@app/features/notifications/data-access/notification.selectors';
import * as NotificationActions from '@app/features/notifications/data-access/notification.actions';
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
  readonly notifications = toSignal(
    this.store.select(selectAllNotifications),
    { initialValue: [] }
  );
  readonly unreadCount = toSignal(
    this.store.select(selectUnreadNotificationsCount),
    { initialValue: 0 }
  );

  readonly notificationsOpen = signal(false);

  logout(): void {
    this.store.dispatch(AuthActions.logoutUser());
  }

  toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);
  }

  markRead(id: string): void {
    this.store.dispatch(NotificationActions.markNotificationRead({ id }));
  }
}
