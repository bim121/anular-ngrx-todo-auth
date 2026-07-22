import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { createSelector } from '@ngrx/store';
import { TodoComment } from './comment.model';
import * as CommentActions from './comment.actions';
import {
  selectComments,
  selectCommentsError,
  selectCommentsState,
} from './comment.selectors';

const selectLoadingTodoIds = createSelector(
  selectCommentsState,
  (state) => state.loadingTodoIds
);

/**
 * Thin API over NgRx comments state for UI layers.
 * Optimistic add; load on demand when a todo thread is expanded.
 */
@Injectable({ providedIn: 'root' })
export class CommentsFacade {
  private readonly store = inject(Store);

  readonly allComments = toSignal(this.store.select(selectComments), {
    initialValue: [] as TodoComment[],
  });
  readonly loadingTodoIds = toSignal(this.store.select(selectLoadingTodoIds), {
    initialValue: [] as string[],
  });
  readonly error = toSignal(this.store.select(selectCommentsError), {
    initialValue: null as string | null,
  });

  commentsFor(todoId: string): TodoComment[] {
    return this.allComments().filter((c) => c.todoId === todoId);
  }

  isLoading(todoId: string): boolean {
    return this.loadingTodoIds().includes(todoId);
  }

  load(todoId: string): void {
    this.store.dispatch(CommentActions.loadComments({ todoId }));
  }

  add(todoId: string, body: string): void {
    const trimmed = body.trim();
    if (!trimmed) return;
    this.store.dispatch(CommentActions.addComment({ todoId, body: trimmed }));
  }
}
