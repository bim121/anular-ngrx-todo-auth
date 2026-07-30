import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Todo, TodoTreeNode } from '@anular-ngrx/todos-data-access';
import { CommentsFacade, TodosFacade } from '@anular-ngrx/todos-data-access';
import { buildTodoTree } from '@anular-ngrx/todos-data-access';
import { SpinnerComponent } from '@anular-ngrx/shared-ui/spinner/spinner.component';
import { TodoStatsPanelComponent } from '../../ui/todo-stats-panel/todo-stats-panel.component';
import { TodoTreeItemComponent } from '../../ui/todo-tree-item/todo-tree-item.component';
import { TodoFormComponent } from '../../ui/todo-form/todo-form.component';
import { TodoFilterComponent } from '../../ui/todo-filter/todo-filter.component';
import { ToastService } from '@anular-ngrx/shared-ui/toast/toast.service';
import { TodoListUiStore } from './todo-list-ui.store';

/** Fixed row height for CDK virtual scroll (collapsed root rows). */
export const TODO_VIRTUAL_ITEM_SIZE_PX = 72;

@Component({
  selector: 'app-todo-list-page',
  standalone: true,
  imports: [
    ScrollingModule,
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
  private readonly commentsFacade = inject(CommentsFacade);
  private readonly toast = inject(ToastService);
  readonly uiStore = inject(TodoListUiStore);

  /** Bound in template for cdk-virtual-scroll-viewport itemSize. */
  readonly TODO_VIRTUAL_ITEM_SIZE_PX = TODO_VIRTUAL_ITEM_SIZE_PX;

  readonly todos = this.todosFacade.todos;
  readonly availableTags = this.todosFacade.availableTags;
  readonly loading = this.todosFacade.loading;
  readonly error = this.todosFacade.error;

  /**
   * Comments live in a drawer under the viewport — CDK fixed-size virtual
   * scroll cannot host expanded inline panels (itemSize=72).
   */
  readonly commentsTodoId = signal<string | null>(null);
  commentDraft = '';

  readonly filteredTodoTree = computed(() => {
    let items = this.todosFacade.filteredTodos(this.uiStore.filter());
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

  readonly commentsTodo = computed(() => {
    const id = this.commentsTodoId();
    if (!id) return null;
    return this.todos().find((todo) => todo.id === id) ?? null;
  });

  readonly activeComments = computed(() => {
    const id = this.commentsTodoId();
    return id ? this.commentsFacade.commentsFor(id) : [];
  });

  readonly activeCommentsLoading = computed(() => {
    const id = this.commentsTodoId();
    return id ? this.commentsFacade.isLoading(id) : false;
  });

  readonly todoToggled = output<string>();

  updatedTask = '';

  readonly commentsFor = (todoId: string) =>
    this.commentsFacade.commentsFor(todoId);

  readonly trackByTodoId = (_index: number, node: TodoTreeNode): string =>
    node.id;

  constructor() {
    effect(() => {
      const err = this.error();
      if (err) {
        this.toast.error(err);
      }
    });

    effect(() => {
      const commentErr = this.commentsFacade.error();
      if (commentErr) {
        this.toast.error(commentErr);
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
      if (this.commentsTodoId() === todoId) {
        this.closeComments();
      }
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

  onCommentsToggle(todoId: string): void {
    if (this.commentsTodoId() === todoId) {
      this.closeComments();
      return;
    }

    this.commentsTodoId.set(todoId);
    this.commentDraft = '';
    this.commentsFacade.load(todoId);
  }

  closeComments(): void {
    this.commentsTodoId.set(null);
    this.commentDraft = '';
  }

  submitComment(): void {
    const todoId = this.commentsTodoId();
    const body = this.commentDraft.trim();
    if (!todoId || !body || this.loading()) return;
    this.commentsFacade.add(todoId, body);
    this.commentDraft = '';
  }
}
