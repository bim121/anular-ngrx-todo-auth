import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Todo } from '@app/features/todos/data-access/todo.model';
import * as TodoActions from '@app/features/todos/data-access/todo.actions';
import * as TodoSelectors from '@app/features/todos/data-access/todo.selectors';
import { SpinnerComponent } from '@app/shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [FormsModule, SpinnerComponent],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
})
export class TodoListComponent implements OnInit {
  private store = inject(Store);

  todos = toSignal(this.store.select(TodoSelectors.selectAllTodos), {
    initialValue: [] as Todo[],
  });
  loading = toSignal(this.store.select(TodoSelectors.selectTodosLoading), {
    initialValue: false,
  });
  error = toSignal(this.store.select(TodoSelectors.selectTodosError), {
    initialValue: null,
  });

  newTask = '';
  editingTodo: Todo | null = null;
  updatedTask = '';

  ngOnInit(): void {
    this.store.dispatch(TodoActions.loadTodos());
  }

  addTodo(): void {
    if (!this.newTask.trim() || this.loading()) return;
    this.store.dispatch(TodoActions.addTodo({ task: this.newTask.trim() }));
    this.newTask = '';
  }

  toggleComplete(todo: Todo): void {
    if (this.loading()) return;
    const updatedTodo = { ...todo, completed: !todo.completed };
    this.store.dispatch(TodoActions.updateTodo({ todo: updatedTodo }));
  }

  deleteTodo(todoId: string): void {
    if (this.loading()) return;
    if (confirm('Are you sure you want to delete this task?')) {
      this.store.dispatch(TodoActions.deleteTodo({ todoId }));
    }
  }

  startEdit(todo: Todo): void {
    if (this.loading()) return;
    this.editingTodo = { ...todo };
    this.updatedTask = todo.task;
  }

  cancelEdit(): void {
    this.editingTodo = null;
    this.updatedTask = '';
  }

  saveEdit(): void {
    if (this.loading()) return;
    if (this.editingTodo && this.updatedTask.trim()) {
      const todoToUpdate = {
        ...this.editingTodo,
        task: this.updatedTask.trim(),
      };
      this.store.dispatch(TodoActions.updateTodo({ todo: todoToUpdate }));
      this.cancelEdit();
    }
  }

  trackById(_index: number, item: Todo): string {
    return item.id;
  }
}
