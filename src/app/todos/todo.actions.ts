import { createAction, props } from "@ngrx/store";
import { Todo } from "./todo.model";

export const loadTodos = createAction(
    '[To do page] load to dods'
);

export const loadTodosSuccess = createAction(
    '[To do API] to do list success',
    props<{todos: Todo[]}>()
);

export const loadTodosFailure = createAction(
    '[To do API] to do list failed',
    props<{error: any}>()
);

export const addTodo = createAction(
    '[To-Do Page] Add to-do',
    props<{task: string}>()
);

export const addTodoSuccess = createAction(
    '[To-Do Page] Add to-do Success',
    props<{todo: Todo}>()
);

export const addTodoFailure = createAction(
    '[To-Do Page] Add to-do Failure',
    props<{error: any}>()
);

export const updateTodo = createAction(
    '[To-Do Page] Update to-do',
    props<{todo: Partial<Todo> & {id: string}}>()
);

export const updateTodoSuccess = createAction(
    '[To-Do Page] Update to-do Success',
    props<{todo: Todo}>()
);

export const updateTodoFailure = createAction(
    '[To-Do Page] Update to-do Failure',
    props<{error: any}>()
);

export const deleteTodo = createAction(
    '[To-Do Page] Delete to-do',
    props<{todoId: string}>()
);

export const deleteTodoSuccess = createAction(
    '[To-Do Page] Delete to-do Success',
    props<{todoId: string}>()
);

export const deleteTodoFailure = createAction(
    '[To-Do Page] Delete to-do Failure',
    props<{error: any}>()
);