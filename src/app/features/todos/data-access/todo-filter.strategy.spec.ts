import {
  ActiveTodoFilter,
  AllTodoFilter,
  DoneTodoFilter,
} from './todo-filter.strategy';
import { Todo } from './todo.model';

describe('TodoFilterStrategy', () => {
  const todos: Todo[] = [
    {
      id: '1',
      userId: 'u1',
      task: 'Active',
      completed: false,
      tags: [],
      priority: 'medium',
    },
    {
      id: '2',
      userId: 'u1',
      task: 'Done',
      completed: true,
      tags: [],
      priority: 'low',
    },
  ];

  it('AllTodoFilter returns a shallow copy of all todos', () => {
    const result = new AllTodoFilter().apply(todos);
    expect(result).toEqual(todos);
    expect(result).not.toBe(todos);
  });

  it('ActiveTodoFilter keeps incomplete todos', () => {
    expect(new ActiveTodoFilter().apply(todos).map((t) => t.id)).toEqual(['1']);
  });

  it('DoneTodoFilter keeps completed todos', () => {
    expect(new DoneTodoFilter().apply(todos).map((t) => t.id)).toEqual(['2']);
  });
});
