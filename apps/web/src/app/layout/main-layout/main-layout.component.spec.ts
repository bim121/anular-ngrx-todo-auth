import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { User } from '@anular-ngrx/auth-data-access';
import { AuthFacade } from '@anular-ngrx/auth-data-access';
import {
  selectAllNotifications,
  selectUnreadNotificationsCount,
} from '@app/features/notifications/data-access/notification.selectors';
import { RoutePageContextService } from '@app/core/services/route-page-context.service';
import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent (NgRx + zoneless)', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;
  let user: ReturnType<typeof signal<User | null>>;

  beforeEach(async () => {
    user = signal<User | null>(null);

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthFacade,
          useValue: {
            user,
            logout: vi.fn(),
          },
        },
        {
          provide: Store,
          useValue: {
            select: (selector: unknown) => {
              if (selector === selectAllNotifications) {
                return of([]);
              }
              if (selector === selectUnreadNotificationsCount) {
                return of(0);
              }
              return of(undefined);
            },
            dispatch: vi.fn(),
          },
        },
        {
          provide: RoutePageContextService,
          useValue: {
            activePage: () => ({
              title: 'My Todos',
              breadcrumb: 'Todos',
              description: 'View and manage your personal todo list.',
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    fixture.detectChanges();
  });

  it('renders profile link when auth facade user is set', () => {
    user.set({ id: 'u1', name: 'Alice', email: 'alice@example.com' });
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('.profile-link');
    expect(link?.textContent).toContain('Alice');
    expect(link?.getAttribute('href')).toBe('/profile');
    const avatar = link?.querySelector('img.profile-avatar');
    expect(avatar).toBeTruthy();
    expect(avatar?.getAttribute('width')).toBe('36');
  });

  it('hides profile link when auth facade user is null', () => {
    user.set(null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.profile-link')).toBeNull();
  });
});
