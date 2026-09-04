import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
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
    data: {
      title: 'My Todos',
      breadcrumb: 'Todos',
      description: 'View and manage your personal todo list.',
    },
  },
  {
    path: 'login',
    component: DummyPageComponent,
    data: {
      title: 'Login',
      breadcrumb: 'Login',
      description: 'Sign in to manage your tasks securely.',
    },
  },
];

describe('RoutePageContextService (zoneless + router navigation)', () => {
  let router: Router;
  let service: RoutePageContextService;
  let title: Title;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });

    router = TestBed.inject(Router);
    service = TestBed.inject(RoutePageContextService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
  });

  it('exposes activePage signal from initial route', async () => {
    await router.navigateByUrl('/todos');

    expect(service.activePage()).toEqual({
      title: 'My Todos',
      breadcrumb: 'Todos',
      description: 'View and manage your personal todo list.',
    });
  });

  it('updates activePage signal after NavigationEnd', async () => {
    await router.navigateByUrl('/todos');
    await router.navigateByUrl('/login');

    expect(service.activePage()).toEqual({
      title: 'Login',
      breadcrumb: 'Login',
      description: 'Sign in to manage your tasks securely.',
    });
  });

  it('syncs document title and SEO meta tags on navigation', async () => {
    await router.navigateByUrl('/login');
    await TestBed.flushEffects();

    expect(title.getTitle()).toBe('Login | Todo App');
    expect(meta.getTag('name="description"')?.content).toBe(
      'Sign in to manage your tasks securely.',
    );
    expect(meta.getTag('property="og:title"')?.content).toBe('Login | Todo App');
    expect(meta.getTag('property="og:description"')?.content).toBe(
      'Sign in to manage your tasks securely.',
    );
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('http://localhost:4200/login');
    expect(document.querySelector('link[hreflang="en"]')).toBeTruthy();
    expect(document.querySelector('link[hreflang="ru"]')).toBeTruthy();
    expect(document.querySelector('#app-json-ld')?.textContent).toContain(
      'WebApplication',
    );
  });

  it('removes JSON-LD on non-public routes', async () => {
    await router.navigateByUrl('/login');
    await router.navigateByUrl('/todos');

    expect(document.querySelector('#app-json-ld')).toBeNull();
  });
});
