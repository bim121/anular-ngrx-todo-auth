import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Todo, TodosFacade } from '@anular-ngrx/todos-data-access';
import {
  ButtonComponent,
  CardComponent,
  PriorityBadgeComponent,
  SpinnerComponent,
  TagChipComponent,
} from '@anular-ngrx/shared-ui';

export interface CalendarDayCell {
  date: Date;
  iso: string;
  inMonth: boolean;
  isToday: boolean;
  todos: Todo[];
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1));
}

/** Build a 6×7 UTC grid starting Monday for the given month. */
export function buildMonthGrid(
  year: number,
  month: number,
  todosByDue: ReadonlyMap<string, Todo[]>
): CalendarDayCell[] {
  const first = startOfMonth(year, month);
  const weekday = first.getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const gridStart = new Date(first);
  gridStart.setUTCDate(first.getUTCDate() + mondayOffset);

  const todayIso = toIsoDate(new Date());
  const cells: CalendarDayCell[] = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + i);
    const iso = toIsoDate(date);
    cells.push({
      date,
      iso,
      inMonth: date.getUTCMonth() === month,
      isToday: iso === todayIso,
      todos: todosByDue.get(iso) ?? [],
    });
  }

  return cells;
}

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    DatePipe,
    CardComponent,
    SpinnerComponent,
    TagChipComponent,
    PriorityBadgeComponent,
    ButtonComponent,
  ],
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarViewComponent {
  private readonly todosFacade = inject(TodosFacade);

  readonly loading = this.todosFacade.loading;
  readonly error = this.todosFacade.error;

  readonly view = signal({
    year: new Date().getUTCFullYear(),
    month: new Date().getUTCMonth(),
  });

  readonly weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  readonly monthLabel = computed(() => {
    const { year, month } = this.view();
    return new Date(Date.UTC(year, month, 1));
  });

  readonly days = computed(() => {
    const { year, month } = this.view();
    const map = new Map<string, Todo[]>();
    for (const todo of this.todosFacade.todosWithDueDate()) {
      const key = todo.dueDate!;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(todo);
    }
    return buildMonthGrid(year, month, map);
  });

  readonly overdueCount = computed(() => {
    const today = toIsoDate(new Date());
    return this.todosFacade
      .todosWithDueDate()
      .filter((t) => !!t.dueDate && t.dueDate < today && t.status !== 'done')
      .length;
  });

  prevMonth(): void {
    const { year, month } = this.view();
    if (month === 0) {
      this.view.set({ year: year - 1, month: 11 });
    } else {
      this.view.set({ year, month: month - 1 });
    }
  }

  nextMonth(): void {
    const { year, month } = this.view();
    if (month === 11) {
      this.view.set({ year: year + 1, month: 0 });
    } else {
      this.view.set({ year, month: month + 1 });
    }
  }

  goToday(): void {
    const now = new Date();
    this.view.set({ year: now.getUTCFullYear(), month: now.getUTCMonth() });
  }
}
