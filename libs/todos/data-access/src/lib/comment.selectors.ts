import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CommentsState } from './comment.model';
import {
  commentsFeatureKey,
  selectAllComments,
} from './comment.reducer';

export const selectCommentsState =
  createFeatureSelector<CommentsState>(commentsFeatureKey);

export const selectComments = createSelector(
  selectCommentsState,
  selectAllComments
);

export const selectCommentsByTodoId = (todoId: string) =>
  createSelector(selectComments, (comments) =>
    comments.filter((c) => c.todoId === todoId)
  );

export const selectCommentsLoadingForTodo = (todoId: string) =>
  createSelector(selectCommentsState, (state) =>
    state.loadingTodoIds.includes(todoId)
  );

export const selectCommentsError = createSelector(
  selectCommentsState,
  (state) => state.error
);
