import { makeStateKey, TransferState } from '@angular/core';
import { Todo } from './todo.model';

/** Route resolve key + TransferState key (Phase 7.2). */
export const TODOS_RESOLVE_KEY = 'todos';

export const TODOS_TRANSFER_STATE_KEY = makeStateKey<Todo[]>('todos');

/** Consumes SSR-hydrated todos before a redundant client HTTP call. */
export function consumeTransferredTodos(transferState: TransferState): Todo[] | null {
  if (!transferState.hasKey(TODOS_TRANSFER_STATE_KEY)) {
    return null;
  }

  const todos = transferState.get(TODOS_TRANSFER_STATE_KEY, []);
  transferState.remove(TODOS_TRANSFER_STATE_KEY);
  return todos;
}
