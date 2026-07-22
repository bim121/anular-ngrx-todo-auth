import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, concatMap, map, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import * as AuthSelectors from '@anular-ngrx/auth-data-access/auth.selectors';
import { CommentRepository } from './comment.repository';
import * as CommentActions from './comment.actions';

@Injectable()
export class CommentEffects {
  private readonly actions$ = inject(Actions);
  private readonly comments = inject(CommentRepository);
  private readonly store = inject(Store);

  loadComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.loadComments),
      concatMap(({ todoId }) =>
        this.comments.getByTodoId(todoId).pipe(
          map((items) =>
            CommentActions.loadCommentsSuccess({ todoId, comments: items })
          ),
          catchError((error) =>
            of(CommentActions.loadCommentsFailure({ todoId, error }))
          )
        )
      )
    )
  );

  addComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.addComment),
      concatLatestFrom(() => [
        this.store.select(AuthSelectors.selectUserId),
        this.store.select(AuthSelectors.selectUser),
      ]),
      concatMap(([{ todoId, body }, userId, user]) => {
        if (userId == null || user == null) {
          return of(
            CommentActions.addCommentFailure({
              tempId: '',
              error: new Error('Not logged in'),
            })
          );
        }

        const tempId = `temp_${uuidv4()}`;
        const optimistic = {
          id: tempId,
          todoId,
          userId,
          authorName: user.name,
          body,
          createdAt: new Date().toISOString(),
        };

        return of(
          CommentActions.addCommentOptimistic({ comment: optimistic })
        ).pipe(
          concatMap(() =>
            this.comments
              .create({
                todoId,
                userId,
                authorName: user.name,
                body,
              })
              .pipe(
                map((comment) =>
                  CommentActions.addCommentSuccess({ tempId, comment })
                ),
                catchError((error) =>
                  of(CommentActions.addCommentFailure({ tempId, error }))
                )
              )
          )
        );
      })
    )
  );
}
