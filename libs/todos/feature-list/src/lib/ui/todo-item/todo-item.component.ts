import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoComment, Todo } from '@anular-ngrx/todos-data-access';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoItemComponent {
  readonly todo = input.required<Todo>();
  readonly disabled = input(false);
  readonly comments = input<TodoComment[]>([]);
  readonly commentsLoading = input(false);
  readonly toggled = output<void>();
  /** Fired the first time the comments panel is opened for this item. */
  readonly commentsOpened = output<void>();
  readonly commentSubmitted = output<string>();

  readonly commentsExpanded = signal(false);
  draft = '';
  private hasRequestedComments = false;

  onToggle(): void {
    if (this.disabled()) return;
    this.toggled.emit();
  }

  toggleComments(): void {
    const next = !this.commentsExpanded();
    this.commentsExpanded.set(next);
    if (next && !this.hasRequestedComments) {
      this.hasRequestedComments = true;
      this.commentsOpened.emit();
    }
  }

  submitComment(): void {
    const body = this.draft.trim();
    if (!body || this.disabled()) return;
    this.commentSubmitted.emit(body);
    this.draft = '';
  }
}
