import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonComponent } from '@anular-ngrx/shared-ui';
import { TodoFilter } from '@anular-ngrx/todos-data-access';

export type { TodoFilter };

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './todo-filter.component.html',
  styleUrl: './todo-filter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFilterComponent {
  readonly filter = input.required<TodoFilter>();
  readonly filterChange = output<TodoFilter>();

  readonly options: readonly { value: TodoFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'done', label: 'Done' },
  ];

  select(filter: TodoFilter): void {
    this.filterChange.emit(filter);
  }
}
