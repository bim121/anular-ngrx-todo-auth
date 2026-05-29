import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, switchMap, throwError } from "rxjs";
import { Todo } from "./todo.model";
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: "root"
})
export class TodoService {
    private http = inject(HttpClient);

    private todoUrl = 'http://localhost:3000/todos';

    public getTodos(userId: string): Observable<Todo[]> {
        return this.http.get<Todo[]>(`${this.todoUrl}?userId=${userId}`).pipe(
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
            catchError(this.handleError)
        )
    }

    public updateTodo(todoUpdate: Partial<Todo> & {id: string}, userId: string): Observable<Todo> {
        return this.http.get<Todo>(`${this.todoUrl}/${todoUpdate.id}`).pipe(
            map(todo => {
                if(todo.userId !== userId) {
                    throw new Error('Unauthrized to update this Todo')
                }
                return todo;
            }),
            switchMap(() => this.http.patch<Todo>(`${this.todoUrl}/${todoUpdate.id}`, todoUpdate)),
            catchError(this.handleError)
        );
    }

    public deleteTodo(todoId: string, userId: string): Observable<{}> {
        return this.http.get<Todo>(`${this.todoUrl}/${todoId}`).pipe(
            map(todo => {
                if(todo.userId !== userId) {
                    throw new Error('Unauthrized to update this Todo')
                }
                return todo;
            }),
            switchMap(() => this.http.delete<{}>(`${this.todoUrl}/${todoId}`)),
            catchError(this.handleError)
        );
    }

    private handleError(error: any): Observable<never> {
        console.error("TodoService Error:", error);
        return throwError(() => new Error(error.message || 'Todo service error'));
    }
}