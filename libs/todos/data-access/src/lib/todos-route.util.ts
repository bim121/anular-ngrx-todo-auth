import { ActivatedRouteSnapshot } from '@angular/router';
import { Todo } from './todo.model';
import { TODOS_RESOLVE_KEY } from './todos-transfer.state';

export function isTodoDataRoute(url: string): boolean {
  return (
    url.includes('/todos') ||
    url.includes('/kanban') ||
    url.includes('/calendar')
  );
}

export function getLeafRouteResolvedTodos(
  root: ActivatedRouteSnapshot
): Todo[] | null {
  let route: ActivatedRouteSnapshot | null = root;

  while (route?.firstChild) {
    route = route.firstChild;
  }

  const todos = route?.data?.[TODOS_RESOLVE_KEY];
  return Array.isArray(todos) ? (todos as Todo[]) : null;
}
