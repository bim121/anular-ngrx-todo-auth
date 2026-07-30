import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { TodoComment, Todo } from '@anular-ngrx/todos-data-access';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoItemComponent {
  readonly todo = input.required<Todo>();
  readonly disabled = input(false);
  readonly comments = input<TodoComment[]>([]);
  /** Whether this row's comments drawer is open (owned by list page for virtual scroll). */
  readonly commentsOpen = input(false);
  readonly toggled = output<void>();
  /** Fired when the Comments button is clicked (parent toggles the drawer). */
  readonly commentsOpened = output<void>();

  onToggle(): void {
    if (this.disabled()) return;
    this.toggled.emit();
  }

  toggleComments(): void {
    this.commentsOpened.emit();
  }
}
