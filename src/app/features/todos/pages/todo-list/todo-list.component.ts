import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Todo } from '@app/features/todos/data-access/todo.model';
import * as TodoActions from '@app/features/todos/data-access/todo.actions';
import * as TodoSelectors from '@app/features/todos/data-access/todo.selectors';
import { SpinnerComponent } from '@app/shared/ui/spinner/spinner.component';
import { TodoItemComponent } from '@app/features/todos/ui/todo-item/todo-item.component';
import { TodoStatsPanelComponent } from '@app/features/todos/ui/todo-stats-panel/todo-stats-panel.component';
import { ToastService } from '@app/shared/ui/toast/toast.service';
import { TodoListUiStore } from './todo-list-ui.store';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [FormsModule, SpinnerComponent, TodoItemComponent, TodoStatsPanelComponent],
  providers: [TodoListUiStore],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent {
  private readonly store = inject(Store);
  private readonly toast = inject(ToastService);
  readonly uiStore = inject(TodoListUiStore);

  readonly todos = toSignal(this.store.select(TodoSelectors.selectAllTodos), {
    initialValue: [] as Todo[],
  });
  readonly loading = toSignal(this.store.select(TodoSelectors.selectTodosLoading), {
    initialValue: false,
  });
  readonly error = toSignal(this.store.select(TodoSelectors.selectTodosError), {
    initialValue: null,
  });
  readonly pendingToggleIds = toSignal(
    this.store.select(TodoSelectors.selectPendingToggleIds),
    { initialValue: [] as string[] }
  );
  readonly filteredTodos = computed(() => {
    const items = this.todos();
    const f = this.uiStore.filter();

    switch (f) {
      case 'active':
        return items.filter((todo) => !todo.completed);
      case 'done':
        return items.filter((todo) => todo.completed);
      default:
        return items;
    }
  });
  readonly todoToggled = output<string>();

  newTask = '';
  updatedTask = '';

  constructor() {
    effect(() => {
      const err = this.error();
      if (err) {
        this.toast.error(err);
      }
    });
  }

  addTodo(): void {
    if (!this.newTask.trim()) return;
    const task = this.newTask.trim();
    this.store.dispatch(TodoActions.addTodo({ task }));
    this.newTask = '';
  }

  isTogglePending(todoId: string): boolean {
    return this.pendingToggleIds().includes(todoId);
  }

  onTodoToggled(todoId: string): void {
    if (this.loading()) return;
    if (this.pendingToggleIds().includes(todoId)) return;

    this.store.dispatch(TodoActions.toggleTodoOptimistic({ id: todoId }));
    this.store.dispatch(TodoActions.toggleTodo({ id: todoId }));
    this.todoToggled.emit(todoId);
  }

  deleteTodo(todoId: string): void {
    if (this.loading()) return;
    if (confirm('Are you sure you want to delete this task?')) {
      this.store.dispatch(TodoActions.deleteTodo({ todoId }));
    }
  }

  startEdit(todo: Todo): void {
    if (this.loading()) return;
    this.uiStore.startEdit(todo.id);
    this.updatedTask = todo.task;
  }

  cancelEdit(): void {
    this.uiStore.cancelEdit();
    this.updatedTask = '';
  }

  saveEdit(): void {
    if (this.loading()) return;
    const editingId = this.uiStore.editingId();
    if (editingId && this.updatedTask.trim()) {
      const todo = this.todos().find((item) => item.id === editingId);
      if (!todo) {
        this.cancelEdit();
        return;
      }

      const todoToUpdate = {
        ...todo,
        task: this.updatedTask.trim(),
      };
      this.store.dispatch(TodoActions.updateTodo({ todo: todoToUpdate }));
      this.cancelEdit();
    }
  }
}
