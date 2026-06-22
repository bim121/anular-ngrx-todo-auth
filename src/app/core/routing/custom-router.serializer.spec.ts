import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CustomRouterSerializer } from './custom-router.serializer';

describe('CustomRouterSerializer', () => {
  const serializer = new CustomRouterSerializer();

  function createSnapshot(
    url: string,
    leafParams: Record<string, string>,
    queryParams: Record<string, string>
  ): RouterStateSnapshot {
    const leaf = {
      params: leafParams,
      queryParams,
      firstChild: null,
    } as unknown as ActivatedRouteSnapshot;

    const root = {
      firstChild: leaf,
    } as unknown as ActivatedRouteSnapshot;

    return { url, root } as RouterStateSnapshot;
  }

  it('serializes url, leaf params, and queryParams only', () => {
    const snapshot = createSnapshot(
      '/todos?filter=active',
      { id: '42' },
      { filter: 'active' }
    );

    expect(serializer.serialize(snapshot)).toEqual({
      url: '/todos?filter=active',
      params: { id: '42' },
      queryParams: { filter: 'active' },
    });
  });

  it('walks to the deepest child route', () => {
    const deepest = {
      params: { todoId: '1' },
      queryParams: {},
      firstChild: null,
    } as unknown as ActivatedRouteSnapshot;

    const middle = {
      params: {},
      queryParams: {},
      firstChild: deepest,
    } as unknown as ActivatedRouteSnapshot;

    const root = {
      firstChild: middle,
    } as unknown as ActivatedRouteSnapshot;

    const snapshot = { url: '/todos/1', root } as RouterStateSnapshot;

    expect(serializer.serialize(snapshot).params).toEqual({ todoId: '1' });
  });
});
