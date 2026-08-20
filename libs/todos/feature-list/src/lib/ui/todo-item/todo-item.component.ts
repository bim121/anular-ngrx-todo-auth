import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, PriorityBadgeComponent, TagChipComponent } from '@anular-ngrx/shared-ui';
import { CheckboxComponent } from '@anular-ngrx/shared-ui/checkbox/checkbox.component';
import { TodoComment, Todo } from '@anular-ngrx/todos-data-access';
import { highlightTaskParts } from '../highlight-task';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    CheckboxComponent,
    TagChipComponent,
    PriorityBadgeComponent,
  ],
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
  /** Debounced search query for task highlight (PF-2.1). */
  readonly searchQuery = input('');
  readonly toggled = output<void>();
  /** Fired when the Comments button is clicked (parent toggles the drawer). */
  readonly commentsOpened = output<void>();

  readonly highlightParts = highlightTaskParts;

  onToggle(): void {
    if (this.disabled()) return;
    this.toggled.emit();
  }

  toggleComments(): void {
    this.commentsOpened.emit();
  }
}
