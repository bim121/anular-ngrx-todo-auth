import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { TodoComment, CreateCommentDto } from './comment.model';
import { CommentRepository } from './comment.repository';

const API_TIMEOUT_MS = 15_000;
const JSON_SERVER_COMMENTS_URL = 'http://localhost:3000/comments';

@Injectable()
export class JsonServerCommentRepository extends CommentRepository {
  private readonly http = inject(HttpClient);

  getByTodoId(todoId: string): Observable<TodoComment[]> {
    return this.http
      .get<TodoComment[]>(`${JSON_SERVER_COMMENTS_URL}?todoId=${todoId}`)
      .pipe(
        timeout(API_TIMEOUT_MS),
        map((comments) =>
          [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        ),
        catchError(this.handleError)
      );
  }

  create(dto: CreateCommentDto): Observable<TodoComment> {
    const comment: TodoComment = {
      id: uuidv4(),
      todoId: dto.todoId,
      userId: dto.userId,
      authorName: dto.authorName,
      body: dto.body,
      createdAt: new Date().toISOString(),
    };

    return this.http.post<TodoComment>(JSON_SERVER_COMMENTS_URL, comment).pipe(
      timeout(API_TIMEOUT_MS),
      catchError(this.handleError)
    );
  }

  private handleError(error: unknown): Observable<never> {
    console.error('JsonServerCommentRepository Error:', error);
    let message = 'Comment repository error';

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
