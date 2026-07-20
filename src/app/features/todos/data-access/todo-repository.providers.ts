import { Provider } from '@angular/core';
import { TodoRepository } from './todo.repository';
import { JsonServerTodoRepository } from './json-server-todo.repository';

/** Default todos persistence — swap useClass to HttpTodoRepository in Phase 13. */
export function provideTodoRepository(): Provider {
  return { provide: TodoRepository, useClass: JsonServerTodoRepository };
}
