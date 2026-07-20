import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoTreeNode } from '@app/features/todos/data-access/todo.model';
import { TodoItemComponent } from '@app/features/todos/ui/todo-item/todo-item.component';

@Component({
  selector: 'app-todo-tree-item',
  standalone: true,
  imports: [FormsModule, TodoItemComponent, TodoTreeItemComponent],
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

  readonly toggled = output<string>();
  readonly editStarted = output<TodoTreeNode>();
  readonly deleted = output<string>();
  readonly editSaved = output<void>();
  readonly editCancelled = output<void>();
  readonly updatedTaskChange = output<string>();

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
