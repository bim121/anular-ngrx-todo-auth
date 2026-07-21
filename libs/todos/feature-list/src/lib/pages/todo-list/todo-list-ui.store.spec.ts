import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import * as TodoActions from '@anular-ngrx/todos-data-access/todo.actions';
import { TodoListUiStore } from './todo-list-ui.store';

describe('TodoListUiStore', () => {
  let actions$: Subject<Action>;

  beforeEach(() => {
    actions$ = new Subject<Action>();

    TestBed.configureTestingModule({
      providers: [
        TodoListUiStore,
        provideMockActions(() => actions$ as Observable<Action>),
      ],
    });
  });

  it('starts in viewing with default filter', () => {
    const uiStore = TestBed.inject(TodoListUiStore);

    expect(uiStore.filter()).toBe('all');
    expect(uiStore.editStatus()).toBe('viewing');
    expect(uiStore.editingId()).toBeNull();
  });

  it('setFilter updates filter signal', () => {
    const uiStore = TestBed.inject(TodoListUiStore);

    uiStore.setFilter('active');

    expect(uiStore.filter()).toBe('active');
  });

  it('setTag updates selectedTag signal', () => {
    const uiStore = TestBed.inject(TodoListUiStore);

    expect(uiStore.selectedTag()).toBeNull();

    uiStore.setTag('work');
    expect(uiStore.selectedTag()).toBe('work');

    uiStore.setTag(null);
    expect(uiStore.selectedTag()).toBeNull();
  });

  it('edit machine: viewing → editing → viewing via cancel', () => {
    const uiStore = TestBed.inject(TodoListUiStore);

    uiStore.startEdit('todo-1');
    expect(uiStore.editStatus()).toBe('editing');
    expect(uiStore.editingId()).toBe('todo-1');

    uiStore.cancelEdit();
    expect(uiStore.editStatus()).toBe('viewing');
    expect(uiStore.editingId()).toBeNull();
  });

  it('edit machine: editing → saving → viewing on update success', () => {
    const uiStore = TestBed.inject(TodoListUiStore);
    const todo = {
      id: 'todo-1',
      userId: 'u1',
      task: 'A',
      completed: false,
      tags: [] as string[],
      priority: 'medium' as const,
    };

    uiStore.startEdit('todo-1');
    uiStore.beginSave();
    expect(uiStore.editStatus()).toBe('saving');

    actions$.next(TodoActions.updateTodoSuccess({ todo }));

    expect(uiStore.editStatus()).toBe('viewing');
    expect(uiStore.editingId()).toBeNull();
  });

  it('edit machine: saving → editing on update failure', () => {
    const uiStore = TestBed.inject(TodoListUiStore);

    uiStore.startEdit('todo-1');
    uiStore.beginSave();

    actions$.next(
      TodoActions.updateTodoFailure({ error: new Error('network') })
    );

    expect(uiStore.editStatus()).toBe('editing');
    expect(uiStore.editingId()).toBe('todo-1');
  });
});
