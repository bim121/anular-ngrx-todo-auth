import { TodosState } from './todo.model';
import * as TodoActions from './todo.actions';
import * as AuthActions from '@app/features/auth/data-access/auth.actions';
import { createReducer, on } from '@ngrx/store';

export const todosFeatureKey = 'todos';

export const initialTodoState: TodosState = {
    items: [],
    loading: false,
    error: null
}

export const todosReducer = createReducer(
    initialTodoState,
    
    on(TodoActions.loadTodos, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(TodoActions.loadTodosSuccess, (state, {todos}) => ({
        ...state,
        items: todos,
        loading: false
    })),

    on(TodoActions.loadTodosFailure, (state, {error}) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to load messages',
        loading: false
    })),

    on(TodoActions.addTodo, (state) => ({
        ...state,
        error: null,
    })),

    on(TodoActions.addTodoSuccess, (state, {todo}) => ({
        ...state,
        items: [...state.items, todo],
    })),

    on(TodoActions.addTodoFailure, (state, {error}) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to add messages',
    })),

    on(TodoActions.updateTodo, (state, { todo }) => ({
        ...state,
        error: null,
        items: state.items.map((item) =>
            item.id === todo.id ? { ...item, ...todo } : item
        ),
    })),

    on(TodoActions.updateTodoSuccess, (state, {todo}) => ({
        ...state,
        items: state.items.map((item) =>
            item.id === todo.id ? todo : item
        ),
    })),

    on(TodoActions.updateTodoFailure, (state, {error}) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to update messages',
    })),

    on(TodoActions.deleteTodo, (state) => ({
        ...state,
        error: null,
    })),

    on(TodoActions.deleteTodoSuccess, (state, {todoId}) => ({
        ...state,
        items: state.items.filter(item => item.id !== todoId),
    })),

    on(TodoActions.deleteTodoFailure, (state, {error}) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to delete messages',
    })),

    on(AuthActions.logoutUser, () => initialTodoState)
)