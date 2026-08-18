import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@anular-ngrx/shared-ui';
import { InputComponent } from '@anular-ngrx/shared-ui/input/input.component';
import { TodoComment, TodoTreeNode } from '@anular-ngrx/todos-data-access';
import { TodoItemComponent } from '../todo-item/todo-item.component';

@Component({
  selector: 'app-todo-tree-item',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    InputComponent,
    TodoItemComponent,
    TodoTreeItemComponent,
  ],
  templateUrl: './todo-tree-item.component.html',
  styleUrl: './todo-tree-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoTreeItemComponent {
  readonly node = input.required<TodoTreeNode>();
  readonly depth = input(0);
  readonly loading = input(false);
  readonly saving = input(false);
  readonly editingId = input<string | null>(null);
  readonly updatedTask = input('');
  readonly isTogglePending = input<(id: string) => boolean>(() => false);
  readonly commentsFor = input<(id: string) => TodoComment[]>(() => []);
  readonly commentsLoadingFor = input<(id: string) => boolean>(() => false);
  /** Id of the todo whose comments drawer is open (list page owns the panel). */
  readonly commentsOpenId = input<string | null>(null);
  readonly searchQuery = input('');

  readonly toggled = output<string>();
  readonly editStarted = output<TodoTreeNode>();
  readonly deleted = output<string>();
  readonly editSaved = output<void>();
  readonly editCancelled = output<void>();
  readonly updatedTaskChange = output<string>();
  readonly commentsOpened = output<string>();
  readonly commentSubmitted = output<{ todoId: string; body: string }>();

  onToggle(id: string): void {
    this.toggled.emit(id);
  }

  onStartEdit(node: TodoTreeNode): void {
    this.editStarted.emit(node);
  }

  onDelete(id: string): void {
    this.deleted.emit(id);
  }
}
