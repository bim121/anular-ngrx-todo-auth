import { TestBed } from '@angular/core/testing';
import { TodoListUiStore } from './todo-list-ui.store';

describe('TodoListUiStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodoListUiStore],
    });
  });

  it('starts with default filter and no edit row', () => {
    const uiStore = TestBed.inject(TodoListUiStore);

    expect(uiStore.filter()).toBe('all');
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

  it('startEdit and cancelEdit manage editingId', () => {
    const uiStore = TestBed.inject(TodoListUiStore);

    uiStore.startEdit('todo-1');
    expect(uiStore.editingId()).toBe('todo-1');

    uiStore.cancelEdit();
    expect(uiStore.editingId()).toBeNull();
  });
});
