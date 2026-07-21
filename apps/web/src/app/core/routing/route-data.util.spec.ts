import { ActivatedRouteSnapshot } from '@angular/router';
import { getLeafRoutePageData } from './route-data.util';

function buildRouteTree(...levels: Record<string, unknown>[]): ActivatedRouteSnapshot {
  const nodes = levels.map((data) => ({ data, firstChild: null }) as ActivatedRouteSnapshot);

  for (let i = 0; i < nodes.length - 1; i++) {
    Object.defineProperty(nodes[i], 'firstChild', { value: nodes[i + 1] });
  }

  return nodes[0];
}

describe('getLeafRoutePageData', () => {
  it('reads title and breadcrumb from the deepest child route', () => {
    const root = buildRouteTree(
      {},
      { title: 'Ignored' },
      { title: 'My Todos', breadcrumb: 'Todos' },
    );

    expect(getLeafRoutePageData(root)).toEqual({
      title: 'My Todos',
      breadcrumb: 'Todos',
    });
  });

  it('returns null when leaf route has no page data', () => {
    const root = buildRouteTree({});

    expect(getLeafRoutePageData(root)).toBeNull();
  });
});
