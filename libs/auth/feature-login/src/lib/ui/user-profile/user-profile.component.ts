import { ChangeDetectionStrategy, Component } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { UserProfile } from '@anular-ngrx/auth-data-access';
import { SpinnerComponent } from '@anular-ngrx/shared-ui';

const PROFILE_URL = 'http://localhost:3000/users/me';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {
  /** Secondary read-only data — local httpResource, not NgRx (see ADR-006). */
  readonly profile = httpResource<UserProfile>(() => PROFILE_URL);
}
