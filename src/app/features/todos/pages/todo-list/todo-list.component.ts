import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
} from '@angular/core';
import { Todo, TodoTreeNode } from '@app/features/todos/data-access/todo.model';
import { TodosFacade } from '@app/features/todos/data-access/todos.facade';
import { buildTodoTree } from '@app/features/todos/data-access/todo.selectors';
import { SpinnerComponent } from '@app/shared/ui/spinner/spinner.component';
import { TodoStatsPanelComponent } from '@app/features/todos/ui/todo-stats-panel/todo-stats-panel.component';
import { TodoTreeItemComponent } from '@app/features/todos/ui/todo-tree-item/todo-tree-item.component';
import { TodoFormComponent } from '@app/features/todos/ui/todo-form/todo-form.component';
import { TodoFilterComponent } from '@app/features/todos/ui/todo-filter/todo-filter.component';
import { ToastService } from '@app/shared/ui/toast/toast.service';
import { TodoListUiStore } from './todo-list-ui.store';

@Component({
  selector: 'app-todo-list-page',
  standalone: true,
  imports: [
    SpinnerComponent,
    TodoStatsPanelComponent,
    TodoTreeItemComponent,
    TodoFormComponent,
    TodoFilterComponent,
  ],
  providers: [TodoListUiStore],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListPageComponent {
  private readonly todosFacade = inject(TodosFacade);
  private readonly toast = inject(ToastService);
  readonly uiStore = inject(TodoListUiStore);

  readonly todos = this.todosFacade.todos;
  readonly availableTags = this.todosFacade.availableTags;
  readonly loading = this.todosFacade.loading;
  readonly error = this.todosFacade.error;

  readonly filteredTodoTree = computed(() => {
    let items = this.todosFacade.filterTodos(this.uiStore.filter());
    const tag = this.uiStore.selectedTag();

    if (tag) {
      items = items.filter((todo) => todo.tags.includes(tag));
    }

    return buildTodoTree(items);
  });

  readonly visibleTodoCount = computed(() => {
    const countNodes = (nodes: TodoTreeNode[]): number =>
      nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0);
    return countNodes(this.filteredTodoTree());
  });

  readonly todoToggled = output<string>();

  updatedTask = '';

  constructor() {
    effect(() => {
      const err = this.error();
      if (err) {
        this.toast.error(err);
      }
    });

    effect(() => {
      if (this.uiStore.editStatus() === 'viewing') {
        this.updatedTask = '';
      }
    });
  }

  addTodo(task: string): void {
    this.todosFacade.add(task);
  }

  isTogglePending = (todoId: string): boolean =>
    this.todosFacade.isTogglePending(todoId);

  onTodoToggled(todoId: string): void {
    if (this.loading()) return;
    if (this.todosFacade.isTogglePending(todoId)) return;

    this.todosFacade.toggle(todoId);
    this.todoToggled.emit(todoId);
  }

  deleteTodo(todoId: string): void {
    if (this.loading()) return;
    if (confirm('Are you sure you want to delete this task?')) {
      this.todosFacade.remove(todoId);
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
    if (this.uiStore.editStatus() === 'saving') return;

    const editingId = this.uiStore.editingId();
    if (editingId && this.updatedTask.trim()) {
      const todo = this.todos().find((item) => item.id === editingId);
      if (!todo) {
        this.cancelEdit();
        return;
      }

      this.uiStore.beginSave();
      this.todosFacade.update({
        ...todo,
        task: this.updatedTask.trim(),
      });
    }
  }
}
