import { Route } from '@angular/router';
import { of } from 'rxjs';
import { PRELOAD_ROUTE_KEY, TodosPreloadStrategy } from './todos-preload.strategy';

describe('TodosPreloadStrategy', () => {
  const strategy = new TodosPreloadStrategy();

  it('calls load() when route data.preload is true', () => {
    const load = vi.fn(() => of('todos-chunk'));
    const route = { data: { [PRELOAD_ROUTE_KEY]: true } } as Route;

    strategy.preload(route, load).subscribe();

    expect(load).toHaveBeenCalledOnce();
  });

  it('skips preload when flag is missing', () => {
    const load = vi.fn(() => of('chunk'));
    const route = { data: {} } as Route;

    strategy.preload(route, load).subscribe((value) => {
      expect(value).toBeNull();
    });

    expect(load).not.toHaveBeenCalled();
  });
});
