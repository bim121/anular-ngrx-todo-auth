import { makeStateKey, TransferState } from '@angular/core';
import {
  consumeTransferredTodos,
  TODOS_TRANSFER_STATE_KEY,
} from './todos-transfer.state';

describe('todos-transfer.state', () => {
  it('consumes transferred todos and removes the key', () => {
    const transferState = {
      hasKey: vi.fn((key: unknown) => key === TODOS_TRANSFER_STATE_KEY),
      get: vi.fn(() => [{ id: '1' }]),
      remove: vi.fn(),
    } as unknown as TransferState;

    const todos = consumeTransferredTodos(transferState);

    expect(todos).toEqual([{ id: '1' }]);
    expect(transferState.remove).toHaveBeenCalledWith(TODOS_TRANSFER_STATE_KEY);
  });

  it('returns null when transfer key is missing', () => {
    const transferState = {
      hasKey: () => false,
      get: vi.fn(),
      remove: vi.fn(),
    } as unknown as TransferState;

    expect(consumeTransferredTodos(transferState)).toBeNull();
  });
});

describe('TODOS_TRANSFER_STATE_KEY', () => {
  it('uses stable state key id', () => {
    expect(TODOS_TRANSFER_STATE_KEY).toEqual(makeStateKey('todos'));
  });
});
