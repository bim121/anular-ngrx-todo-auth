import * as CommentActions from './comment.actions';
import {
  commentsReducer,
  initialCommentsState,
} from './comment.reducer';
import { TodoComment } from './comment.model';

describe('commentsReducer', () => {
  const sample: TodoComment = {
    id: 'c1',
    todoId: 't1',
    userId: 'u1',
    authorName: 'Ada',
    body: 'Hello',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('loadCommentsSuccess replaces comments for todo', () => {
    const withOther = commentsReducer(
      initialCommentsState,
      CommentActions.addCommentOptimistic({
        comment: { ...sample, id: 'other', todoId: 't2' },
      })
    );

    const state = commentsReducer(
      withOther,
      CommentActions.loadCommentsSuccess({
        todoId: 't1',
        comments: [sample],
      })
    );

    expect(state.ids).toContain('c1');
    expect(state.ids).toContain('other');
    expect(state.loadingTodoIds).toEqual([]);
  });

  it('addCommentOptimistic then failure removes temp', () => {
    const optimistic = commentsReducer(
      initialCommentsState,
      CommentActions.addCommentOptimistic({ comment: sample })
    );
    const failed = commentsReducer(
      optimistic,
      CommentActions.addCommentFailure({
        tempId: 'c1',
        error: new Error('boom'),
      })
    );

    expect(failed.entities['c1']).toBeUndefined();
    expect(failed.error).toBe('boom');
  });
});
