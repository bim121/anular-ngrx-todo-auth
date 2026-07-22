import { createAction, props } from '@ngrx/store';
import { TodoComment } from './comment.model';

export const loadComments = createAction(
  '[Comments] Load',
  props<{ todoId: string }>()
);

export const loadCommentsSuccess = createAction(
  '[Comments API] Load Success',
  props<{ todoId: string; comments: TodoComment[] }>()
);

export const loadCommentsFailure = createAction(
  '[Comments API] Load Failure',
  props<{ todoId: string; error: unknown }>()
);

export const addComment = createAction(
  '[Comments] Add',
  props<{ todoId: string; body: string }>()
);

export const addCommentOptimistic = createAction(
  '[Comments] Add Optimistic',
  props<{ comment: TodoComment }>()
);

export const addCommentSuccess = createAction(
  '[Comments API] Add Success',
  props<{ tempId: string; comment: TodoComment }>()
);

export const addCommentFailure = createAction(
  '[Comments API] Add Failure',
  props<{ tempId: string; error: unknown }>()
);
