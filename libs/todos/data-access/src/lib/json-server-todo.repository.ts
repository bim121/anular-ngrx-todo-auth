import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import {
  CreateTodoDto,
  DEFAULT_TODO_PRIORITY,
  DEFAULT_TODO_STATUS,
  Todo,
  defaultDueDate,
  normalizeTodo,
} from './todo.model';
import { TodoRepository } from './todo.repository';

const API_TIMEOUT_MS = 15_000;
const JSON_SERVER_TODOS_URL = 'http://localhost:3000/todos';

/** Current impl — json-server until Phase 13 swaps to HttpTodoRepository. */
@Injectable()
export class JsonServerTodoRepository extends TodoRepository {
  private readonly http = inject(HttpClient);

  getAll(userId: string): Observable<Todo[]> {
    return this.http
      .get<Todo[]>(`${JSON_SERVER_TODOS_URL}?userId=${userId}`)
      .pipe(
        timeout(API_TIMEOUT_MS),
        map((todos) => todos.map((todo) => normalizeTodo(todo))),
        catchError(this.handleError)
      );
  }

  create(dto: CreateTodoDto): Observable<Todo> {
    const status = dto.status ?? DEFAULT_TODO_STATUS;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      userId: dto.userId,
      task: dto.task,
      completed: status === 'done',
      status,
      createdAt: new Date().toISOString(),
      dueDate: dto.dueDate ?? defaultDueDate(7),
      tags: dto.tags ?? [],
      priority: dto.priority ?? DEFAULT_TODO_PRIORITY,
      ...(dto.parentId != null ? { parentId: dto.parentId } : {}),
    };

    return this.http.post<Todo>(JSON_SERVER_TODOS_URL, newTodo).pipe(
      timeout(API_TIMEOUT_MS),
      map((todo) => normalizeTodo(todo)),
      catchError(this.handleError)
    );
  }

  update(
    todoUpdate: Partial<Todo> & { id: string },
    userId: string
  ): Observable<Todo> {
    return this.http
      .patch<Todo>(`${JSON_SERVER_TODOS_URL}/${todoUpdate.id}`, todoUpdate)
      .pipe(
        timeout(API_TIMEOUT_MS),
        map((todo) => {
          if (todo.userId !== userId) {
            throw new Error('Unauthorized to update this todo');
          }
          return normalizeTodo(todo);
        }),
        catchError(this.handleError)
      );
  }

  delete(id: string, userId: string): Observable<void> {
    return this.http.delete<Todo>(`${JSON_SERVER_TODOS_URL}/${id}`).pipe(
      timeout(API_TIMEOUT_MS),
      map((todo) => {
        if (todo.userId !== userId) {
          throw new Error('Unauthorized to delete this todo');
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: unknown): Observable<never> {
    console.error('JsonServerTodoRepository Error:', error);
    let message = 'Todo repository error';

    if (error instanceof HttpErrorResponse) {
      const body = error.error as { error?: string } | null;
      message =
        body?.error ?? error.message ?? `Server error: ${error.status}`;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return throwError(() => new Error(message));
  }
}
