import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { RoutePageContextService } from './route-page-context.service';

@Component({
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DummyPageComponent {}

const routes: Routes = [
  {
    path: 'todos',
    component: DummyPageComponent,
    data: { title: 'My Todos', breadcrumb: 'Todos' },
  },
  {
    path: 'login',
    component: DummyPageComponent,
    data: { title: 'Sign In', breadcrumb: 'Login' },
  },
];

describe('RoutePageContextService (zoneless + router navigation)', () => {
  let router: Router;
  let service: RoutePageContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });

    router = TestBed.inject(Router);
    service = TestBed.inject(RoutePageContextService);
  });

  it('exposes activePage signal from initial route', async () => {
    await router.navigateByUrl('/todos');

    expect(service.activePage()).toEqual({
      title: 'My Todos',
      breadcrumb: 'Todos',
    });
  });

  it('updates activePage signal after NavigationEnd', async () => {
    await router.navigateByUrl('/todos');
    await router.navigateByUrl('/login');

    expect(service.activePage()).toEqual({
      title: 'Sign In',
      breadcrumb: 'Login',
    });
  });
});
