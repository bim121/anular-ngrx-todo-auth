import { ActivatedRouteSnapshot } from '@angular/router';
import { RoutePageData } from './route-page-data.model';

export function getLeafRoutePageData(root: ActivatedRouteSnapshot): RoutePageData | null {
  let route: ActivatedRouteSnapshot | null = root;

  while (route?.firstChild) {
    route = route.firstChild;
  }

  if (!route?.data) {
    return null;
  }

  const { title, breadcrumb, description } = route.data;

  if (
    typeof title === 'string' &&
    typeof breadcrumb === 'string' &&
    typeof description === 'string'
  ) {
    return { title, breadcrumb, description };
  }

  return null;
}
