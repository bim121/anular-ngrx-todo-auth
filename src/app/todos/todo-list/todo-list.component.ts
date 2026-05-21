import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Todo } from '../todo.model';
import * as TodoActions from '../todo.actions';
import * as TodoSelectors from '../todo.selectors';
import * as AuthActions from '../../auth/auth.actions';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {
  private store = inject(Store);

  todos$: Observable<Todo[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  newTask: string = '';
  editingTodo: Todo | null = null;
  updatedTask: string = '';


  constructor() {
    this.todos$ = this.store.select(TodoSelectors.selectAllTodos);
    this.isLoading$ = this.store.select(TodoSelectors.selectTodosLoading);
    this.error$ = this.store.select(TodoSelectors.selectTodosError);
  }

  ngOnInit(): void {
    this.store.dispatch(TodoActions.loadTodos());
  }

  addTodo(): void {
    if (!this.newTask.trim()) return;
    this.store.dispatch(TodoActions.addTodo({ task: this.newTask.trim() }));
    this.newTask = ''; 
  }

  toggleComplete(todo: Todo): void {
    const updatedTodo = { ...todo, completed: !todo.completed };
    this.store.dispatch(TodoActions.updateTodo({ todo: updatedTodo }));
  }

  deleteTodo(todoId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
        this.store.dispatch(TodoActions.deleteTodo({ todoId }));
    }
  }

  startEdit(todo: Todo): void {
    this.editingTodo = { ...todo }; 
    this.updatedTask = todo.task;
  }

  cancelEdit(): void {
    this.editingTodo = null;
    this.updatedTask = '';
  }

  saveEdit(): void {
    if (this.editingTodo && this.updatedTask.trim()) {
      const todoToUpdate = { ...this.editingTodo, task: this.updatedTask.trim() };
      this.store.dispatch(TodoActions.updateTodo({ todo: todoToUpdate }));
      this.cancelEdit();
    }
  }

  logout(): void {
    this.store.dispatch(AuthActions.logoutUser());
  }

  trackById(index: number, item: Todo): string {
    return item.id;
  }
}