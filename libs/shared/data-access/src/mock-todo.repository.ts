import type { CreateTodoDto, Todo } from './todo.model';
import type { TodoRepository } from './todo.repository';

/** In-memory TodoRepository for Vitest / UI tests without json-server. */
export class MockTodoRepository implements TodoRepository {
  private todos: Todo[];

  constructor(seed: Todo[] = []) {
    this.todos = seed.map((todo) => ({ ...todo }));
  }

  async getAll(userId: string): Promise<Todo[]> {
    return this.todos
      .filter((todo) => todo.userId === userId)
      .map((todo) => ({ ...todo }));
  }

  async create(dto: CreateTodoDto): Promise<Todo> {
    const todo: Todo = {
      id: crypto.randomUUID(),
      userId: dto.userId,
      task: dto.task,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.todos.push(todo);
    return { ...todo };
  }

  async update(todo: Todo): Promise<Todo> {
    const index = this.todos.findIndex((item) => item.id === todo.id);
    if (index < 0) {
      throw new Error(`Todo not found: ${todo.id}`);
    }

    const updated = { ...this.todos[index], ...todo };
    this.todos[index] = updated;
    return { ...updated };
  }

  async delete(id: string): Promise<void> {
    const index = this.todos.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error(`Todo not found: ${id}`);
    }
    this.todos.splice(index, 1);
  }

  /** Test helper — current in-memory snapshot. */
  snapshot(): Todo[] {
    return this.todos.map((todo) => ({ ...todo }));
  }
}
