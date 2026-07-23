import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { AuthFacade } from '@anular-ngrx/auth-data-access';
import {
  selectAllNotifications,
  selectUnreadNotificationsCount,
} from '@app/features/notifications/data-access/notification.selectors';
import * as NotificationActions from '@app/features/notifications/data-access/notification.actions';
import { RoutePageContextService } from '@app/core/services/route-page-context.service';
import { ThemeService } from '@app/core/ui/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgOptimizedImage],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly store = inject(Store);
  private readonly auth = inject(AuthFacade);
  private readonly themeService = inject(ThemeService);
  readonly pageContext = inject(RoutePageContextService);

  readonly user = this.auth.user;
  readonly theme = this.themeService.theme;
  readonly notifications = toSignal(this.store.select(selectAllNotifications), {
    initialValue: [],
  });
  readonly unreadCount = toSignal(this.store.select(selectUnreadNotificationsCount), {
    initialValue: 0,
  });

  /** Above-fold header avatar — NgOptimizedImage + priority. */
  readonly avatarUrl = computed(() => {
    const user = this.user();
    if (!user) {
      return null;
    }
    const seed = encodeURIComponent(user.name || user.id);
    return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}`;
  });

  readonly notificationsOpen = signal(false);

  logout(): void {
    this.auth.logout();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleNotifications(): void {
    this.notificationsOpen.update((open) => !open);
  }

  markRead(id: string): void {
    this.store.dispatch(NotificationActions.markNotificationRead({ id }));
  }
}
