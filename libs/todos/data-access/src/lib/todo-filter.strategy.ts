import { InjectionToken, Provider } from '@angular/core';
import { Todo, TodoFilter } from './todo.model';

/** Pure filter used by NgRx selectors and strategy implementations. */
export function applyTodoFilter(
  todos: readonly Todo[],
  filter: TodoFilter
): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'done':
      return todos.filter((todo) => todo.completed);
    case 'all':
    default:
      return [...todos];
  }
}

/** Strategy: swap filter algorithm without changing facade/UI. */
export interface TodoFilterStrategy {
  readonly id: TodoFilter;
  apply(todos: readonly Todo[]): Todo[];
}

export class AllTodoFilter implements TodoFilterStrategy {
  readonly id = 'all' as const;

  apply(todos: readonly Todo[]): Todo[] {
    return applyTodoFilter(todos, 'all');
  }
}

export class ActiveTodoFilter implements TodoFilterStrategy {
  readonly id = 'active' as const;

  apply(todos: readonly Todo[]): Todo[] {
    return applyTodoFilter(todos, 'active');
  }
}

export class DoneTodoFilter implements TodoFilterStrategy {
  readonly id = 'done' as const;

  apply(todos: readonly Todo[]): Todo[] {
    return applyTodoFilter(todos, 'done');
  }
}

export type TodoFilterStrategyMap = Readonly<
  Record<TodoFilter, TodoFilterStrategy>
>;

export const TODO_FILTER_STRATEGIES = new InjectionToken<TodoFilterStrategyMap>(
  'TODO_FILTER_STRATEGIES'
);

export function provideTodoFilterStrategies(): Provider {
  const all = new AllTodoFilter();
  const active = new ActiveTodoFilter();
  const done = new DoneTodoFilter();

  return {
    provide: TODO_FILTER_STRATEGIES,
    useValue: {
      all,
      active,
      done,
    } satisfies TodoFilterStrategyMap,
  };
}
