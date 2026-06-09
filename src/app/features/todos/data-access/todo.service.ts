import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, throwError, timeout } from "rxjs";
import { Todo } from "./todo.model";
import { v4 as uuidv4 } from 'uuid';

const API_TIMEOUT_MS = 15_000;

@Injectable({
    providedIn: "root"
})
export class TodoService {
    private http = inject(HttpClient);

    private todoUrl = 'http://localhost:3000/todos';

    public getTodos(userId: string): Observable<Todo[]> {
        return this.http.get<Todo[]>(`${this.todoUrl}?userId=${userId}`).pipe(
            timeout(API_TIMEOUT_MS),
            catchError(this.handleError)
        );
    }

    public addTodo(task: string, userId: string): Observable<Todo> {
        const newTodo: Todo = {
            id: uuidv4(),
            userId,
            task,
            completed: false,
            createdAt: new Date().toISOString()
        };

        return this.http.post<Todo>(this.todoUrl, newTodo).pipe(
            timeout(API_TIMEOUT_MS),
            catchError(this.handleError)
        );
    }

    public updateTodo(todoUpdate: Partial<Todo> & {id: string}, userId: string): Observable<Todo> {
        return this.http.patch<Todo>(`${this.todoUrl}/${todoUpdate.id}`, todoUpdate).pipe(
            timeout(API_TIMEOUT_MS),
            map((todo) => {
                if (todo.userId !== userId) {
                    throw new Error('Unauthorized to update this todo');
                }
                return todo;
            }),
            catchError(this.handleError)
        );
    }

    public deleteTodo(todoId: string, userId: string): Observable<void> {
        return this.http.delete<Todo>(`${this.todoUrl}/${todoId}`).pipe(
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
        console.error("TodoService Error:", error);
        let message = 'Todo service error';

        if (error instanceof HttpErrorResponse) {
            const body = error.error as { error?: string } | null;
            message =
                body?.error ??
                error.message ??
                `Server error: ${error.status}`;
        } else if (error instanceof Error) {
            message = error.message;
        }

        return throwError(() => new Error(message));
    }
}