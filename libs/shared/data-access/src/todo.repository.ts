import type { CreateTodoDto, Todo } from './todo.model';

/**
 * Persistence port for todos (React / Vue).
 * Swap JsonServerTodoRepository ↔ MockTodoRepository without changing UI hooks.
 */
export interface TodoRepository {
  getAll(userId: string): Promise<Todo[]>;
  create(dto: CreateTodoDto): Promise<Todo>;
  update(todo: Todo): Promise<Todo>;
  delete(id: string): Promise<void>;
}
