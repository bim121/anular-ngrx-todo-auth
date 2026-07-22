import { createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '@anular-ngrx/auth-data-access/auth.actions';
import { TodoComment, CommentsState } from './comment.model';
import * as CommentActions from './comment.actions';

export const commentsFeatureKey = 'comments';

export const commentsAdapter = createEntityAdapter<TodoComment>({
  selectId: (comment) => comment.id,
  sortComparer: (a, b) => a.createdAt.localeCompare(b.createdAt),
});

export const initialCommentsState: CommentsState =
  commentsAdapter.getInitialState({
    loadingTodoIds: [],
    error: null,
  });

export const commentsReducer = createReducer(
  initialCommentsState,

  on(CommentActions.loadComments, (state, { todoId }) => ({
    ...state,
    error: null,
    loadingTodoIds: state.loadingTodoIds.includes(todoId)
      ? state.loadingTodoIds
      : [...state.loadingTodoIds, todoId],
  })),

  on(CommentActions.loadCommentsSuccess, (state, { todoId, comments }) => {
    const withoutTodo = Object.values(state.entities).filter(
      (c): c is TodoComment => !!c && c.todoId !== todoId
    );
    return commentsAdapter.setAll([...withoutTodo, ...comments], {
      ...state,
      loadingTodoIds: state.loadingTodoIds.filter((id) => id !== todoId),
    });
  }),

  on(CommentActions.loadCommentsFailure, (state, { todoId, error }) => ({
    ...state,
    loadingTodoIds: state.loadingTodoIds.filter((id) => id !== todoId),
    error: error instanceof Error ? error.message : 'Failed to load comments',
  })),

  on(CommentActions.addCommentOptimistic, (state, { comment }) =>
    commentsAdapter.addOne(comment, { ...state, error: null })
  ),

  on(CommentActions.addCommentSuccess, (state, { tempId, comment }) => {
    const withoutTemp = commentsAdapter.removeOne(tempId, state);
    return commentsAdapter.addOne(comment, withoutTemp);
  }),

  on(CommentActions.addCommentFailure, (state, { tempId, error }) =>
    commentsAdapter.removeOne(tempId, {
      ...state,
      error: error instanceof Error ? error.message : 'Failed to add comment',
    })
  ),

  on(AuthActions.logoutUser, () => initialCommentsState)
);

export const {
  selectAll: selectAllComments,
  selectEntities: selectCommentEntities,
} = commentsAdapter.getSelectors();
