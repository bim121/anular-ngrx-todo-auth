import { ActivatedRouteSnapshot } from '@angular/router';
import { titleResolver } from './title.resolver';

describe('titleResolver', () => {
  it('returns route data title when present', () => {
    const route = {
      data: { title: 'My Todos' },
    } as unknown as ActivatedRouteSnapshot;

    expect(titleResolver(route, {} as never)).toBe('My Todos');
  });

  it('falls back to app name when title is missing', () => {
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    expect(titleResolver(route, {} as never)).toBe('Todo App');
  });
});
