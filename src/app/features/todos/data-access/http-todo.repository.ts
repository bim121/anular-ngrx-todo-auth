import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTodoDto, Todo } from './todo.model';
import { TodoRepository } from './todo.repository';

/**
 * Skeleton for the real REST API (Phase 13).
 * Not provided in app.config yet — DI still uses JsonServerTodoRepository.
 *
 * When activated:
 * `{ provide: TodoRepository, useClass: HttpTodoRepository }`
 * and set `apiUrl` from app config / environment.
 */
@Injectable()
export class HttpTodoRepository extends TodoRepository {
  /** Phase 13: inject ConfigService / environment.apiUrl. */
  protected readonly apiUrl = 'https://api.example.com/v1/todos';

  getAll(userId: string): Observable<Todo[]> {
    return this.notReady(`getAll(userId=${userId})`);
  }

  create(dto: CreateTodoDto): Observable<Todo> {
    return this.notReady(`create(task=${dto.task})`);
  }

  update(
    todo: Partial<Todo> & { id: string },
    userId: string
  ): Observable<Todo> {
    return this.notReady(`update(id=${todo.id}, userId=${userId})`);
  }

  delete(id: string, userId: string): Observable<void> {
    return this.notReady(`delete(id=${id}, userId=${userId})`);
  }

  private notReady(method: string): Observable<never> {
    throw new Error(
      `HttpTodoRepository.${method} is a Phase 13 skeleton — use JsonServerTodoRepository until then. apiUrl=${this.apiUrl}`
    );
  }
}
