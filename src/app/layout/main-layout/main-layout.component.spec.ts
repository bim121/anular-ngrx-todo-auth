import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, of } from 'rxjs';
import { User } from '@app/features/auth/data-access/auth.model';
import { selectUser } from '@app/features/auth/data-access/auth.selectors';
import {
  selectAllNotifications,
  selectUnreadNotificationsCount,
} from '@app/features/notifications/data-access/notification.selectors';
import { RoutePageContextService } from '@app/core/services/route-page-context.service';
import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent (NgRx + zoneless)', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;
  let user$: BehaviorSubject<User | null>;

  beforeEach(async () => {
    user$ = new BehaviorSubject<User | null>(null);

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: Store,
          useValue: {
            select: (selector: unknown) => {
              if (selector === selectUser) {
                return user$.asObservable();
              }
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
            activePage: () => ({ title: 'My Todos', breadcrumb: 'Todos' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    fixture.detectChanges();
  });

  it('renders profile link when store emits user via toSignal', () => {
    user$.next({ id: 'u1', name: 'Alice', email: 'alice@example.com' });
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('.profile-link');
    expect(link?.textContent).toContain('Alice');
    expect(link?.getAttribute('href')).toBe('/profile');
  });

  it('hides profile link when store user is null', () => {
    user$.next(null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.profile-link')).toBeNull();
  });
});
