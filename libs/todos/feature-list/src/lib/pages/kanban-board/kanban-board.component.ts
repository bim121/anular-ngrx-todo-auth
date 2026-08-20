import {
  CdkDragDrop,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import {
  TODO_STATUSES,
  Todo,
  TodoStatus,
  TodosFacade,
} from '@anular-ngrx/todos-data-access';
import {
  CardComponent,
  PriorityBadgeComponent,
  SpinnerComponent,
  TagChipComponent,
} from '@anular-ngrx/shared-ui';

const COLUMN_LABELS: Record<TodoStatus, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
};

/**
 * PF-3.3 Kanban — CDK drag-drop between columns.
 *
 * GraphQL prep: this view currently loads the full todo list via REST
 * (`GET /todos?userId=…`) then filters client-side — classic over-fetching.
 * Phase 13 will replace with one `KanbanBoard` query returning columns + cards.
 * See plans/phase-13-graphql-client.md §13g.7.
 */
@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    DragDropModule,
    CardComponent,
    SpinnerComponent,
    TagChipComponent,
    PriorityBadgeComponent,
  ],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent {
  private readonly todosFacade = inject(TodosFacade);

  readonly loading = this.todosFacade.loading;
  readonly error = this.todosFacade.error;
  readonly statuses = TODO_STATUSES;
  readonly labels = COLUMN_LABELS;

  readonly columns = computed(() =>
    TODO_STATUSES.map((status) => ({
      status,
      label: COLUMN_LABELS[status],
      todos: this.todosFacade.todosByKanbanStatus(status),
    }))
  );

  dropListIds = TODO_STATUSES.map((s) => `kanban-${s}`);

  connectedTo(status: TodoStatus): string[] {
    return this.dropListIds.filter((id) => id !== `kanban-${status}`);
  }

  onDrop(event: CdkDragDrop<Todo[]>, targetStatus: TodoStatus): void {
    if (event.previousContainer === event.container) {
      return;
    }

    const todo = event.item.data as Todo | undefined;
    if (!todo || todo.status === targetStatus) {
      return;
    }

    // Do not mutate NgRx selector arrays — optimistic update refreshes columns.
    this.todosFacade.moveToStatus(todo.id, targetStatus);
  }

  trackById(_index: number, todo: Todo): string {
    return todo.id;
  }
}
