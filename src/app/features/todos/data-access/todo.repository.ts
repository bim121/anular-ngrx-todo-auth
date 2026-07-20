import { Observable } from 'rxjs';
import { CreateTodoDto, Todo } from './todo.model';

/**
 * Persistence port for todos. Effects depend on this abstraction —
 * swap JsonServerTodoRepository ↔ HttpTodoRepository via DI.
 */
export abstract class TodoRepository {
  abstract getAll(userId: string): Observable<Todo[]>;
  abstract create(dto: CreateTodoDto): Observable<Todo>;
  abstract update(
    todo: Partial<Todo> & { id: string },
    userId: string
  ): Observable<Todo>;
  abstract delete(id: string, userId: string): Observable<void>;
}
