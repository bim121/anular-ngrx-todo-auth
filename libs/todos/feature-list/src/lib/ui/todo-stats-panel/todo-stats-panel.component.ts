import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
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

@Component({
  selector: 'app-todo-stats-panel',
  standalone: true,
  templateUrl: './todo-stats-panel.component.html',
  styleUrl: './todo-stats-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoStatsPanelComponent implements OnInit {
  readonly todos = input.required<Todo[]>();
  readonly stats = signal<TodoStats | null>(null);
  readonly computing = signal(true);

  ngOnInit(): void {
    const items = this.todos();
    setTimeout(() => {
      this.stats.set(this.computeStats(items));
      this.computing.set(false);
    }, 100);
  }

  private computeStats(todos: Todo[]): TodoStats {
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
