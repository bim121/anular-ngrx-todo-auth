import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Todo } from '@anular-ngrx/todos-data-access';

export interface TodoStats {
  total: number;
  active: number;
  done: number;
  avgTaskLength: number;
}

/**
 * Heavy stats widget — ChangeDetectorRef.detach() experiment (Phase 5.2.3).
 * CD is detached; UI updates only via explicit detectChanges() after compute.
 * See docs/perf/detach-experiment.md.
 */
@Component({
  selector: 'app-todo-stats-panel',
  standalone: true,
  templateUrl: './todo-stats-panel.component.html',
  styleUrl: './todo-stats-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoStatsPanelComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly todos = input.required<Todo[]>();
  readonly stats = signal<TodoStats | null>(null);
  readonly computing = signal(true);

  constructor() {
    this.cdr.detach();

    effect((onCleanup) => {
      const items = this.todos();
      this.computing.set(true);
      this.stats.set(null);
      this.cdr.detectChanges();

      // Defer heavy work so list paint is not blocked (same intent as setTimeout before).
      const handle = setTimeout(() => {
        this.stats.set(this.computeStats(items));
        this.computing.set(false);
        this.cdr.detectChanges();
      }, 0);

      onCleanup(() => clearTimeout(handle));
    });
  }

  private computeStats(todos: Todo[]): TodoStats {
    // Artificial CPU load for detach / defer demos (Phase 5 baseline).
    let checksum = 0;
    for (let i = 0; i < 500_000; i++) {
      checksum += i % 13;
    }
    void checksum;

    const total = todos.length;
    const done = todos.filter((todo) => todo.completed).length;
    const active = total - done;
    const avgTaskLength =
      total === 0
        ? 0
        : Math.round(
            todos.reduce((sum, todo) => sum + todo.task.length, 0) / total,
          );

    return { total, active, done, avgTaskLength };
  }
}
