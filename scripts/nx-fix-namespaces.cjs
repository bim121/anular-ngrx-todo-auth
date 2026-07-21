/**
 * Fix namespace imports and intra-lib relative imports after barrel rewrite.
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();

const fileFixes = [
  {
    file: 'libs/todos/data-access/src/lib/todo.effects.ts',
    replacements: [
      [
        "import * as AuthSelectors from '@anular-ngrx/auth-data-access';",
        "import { selectUserId } from '@anular-ngrx/auth-data-access';",
      ],
      [
        "import * as TodoSelectors from '@anular-ngrx/todos-data-access';",
        "import * as TodoSelectors from './todo.selectors';",
      ],
    ],
    // also replace AuthSelectors.selectUserId with selectUserId
    extras: [
      [/AuthSelectors\.selectUserId/g, 'selectUserId'],
    ],
  },
  {
    file: 'libs/todos/data-access/src/lib/todo.reducer.ts',
    replacements: [
      [
        "import * as AuthActions from '@anular-ngrx/auth-data-access';",
        "import { logoutUser } from '@anular-ngrx/auth-data-access';",
      ],
    ],
    extras: [[/AuthActions\.logoutUser/g, 'logoutUser']],
  },
  {
    file: 'libs/todos/data-access/src/lib/todo.reducer.spec.ts',
    replacements: [
      [
        "import * as AuthActions from '@anular-ngrx/auth-data-access';",
        "import { logoutUser } from '@anular-ngrx/auth-data-access';",
      ],
    ],
    extras: [[/AuthActions\.logoutUser/g, 'logoutUser']],
  },
  {
    file: 'libs/todos/data-access/src/lib/todo.effects.spec.ts',
    replacements: [
      [
        "import { selectTodoEntities } from '@anular-ngrx/todos-data-access';",
        "import { selectTodoEntities } from './todo.selectors';",
      ],
    ],
  },
  {
    file: 'libs/todos/feature-list/src/lib/ui/todo-tree-item/todo-tree-item.component.ts',
    replacements: [
      [
        "import { TodoItemComponent } from '@anular-ngrx/todos-feature-list';",
        "import { TodoItemComponent } from '../todo-item/todo-item.component';",
      ],
    ],
  },
  {
    file: 'libs/todos/feature-list/src/lib/pages/todo-list/todo-list.component.ts',
    replacements: [
      [
        "import { TodoStatsPanelComponent } from '@anular-ngrx/todos-feature-list';",
        "import { TodoStatsPanelComponent } from '../../ui/todo-stats-panel/todo-stats-panel.component';",
      ],
      [
        "import { TodoTreeItemComponent } from '@anular-ngrx/todos-feature-list';",
        "import { TodoTreeItemComponent } from '../../ui/todo-tree-item/todo-tree-item.component';",
      ],
      [
        "import { TodoFormComponent } from '@anular-ngrx/todos-feature-list';",
        "import { TodoFormComponent } from '../../ui/todo-form/todo-form.component';",
      ],
      [
        "import { TodoFilterComponent } from '@anular-ngrx/todos-feature-list';",
        "import { TodoFilterComponent } from '../../ui/todo-filter/todo-filter.component';",
      ],
    ],
  },
  {
    file: 'libs/todos/feature-list/src/lib/pages/todo-list/todo-list-ui.store.ts',
    replacements: [
      [
        "import * as TodoActions from '@anular-ngrx/todos-data-access';",
        "import { updateTodoSuccess, updateTodoFailure } from '@anular-ngrx/todos-data-access';",
      ],
    ],
    extras: [
      [/TodoActions\.updateTodoSuccess/g, 'updateTodoSuccess'],
      [/TodoActions\.updateTodoFailure/g, 'updateTodoFailure'],
    ],
  },
  {
    file: 'libs/todos/feature-list/src/lib/pages/todo-list/todo-list-ui.store.spec.ts',
    replacements: [
      [
        "import * as TodoActions from '@anular-ngrx/todos-data-access';",
        "import { updateTodoSuccess, updateTodoFailure } from '@anular-ngrx/todos-data-access';",
      ],
    ],
    extras: [
      [/TodoActions\.updateTodoSuccess/g, 'updateTodoSuccess'],
      [/TodoActions\.updateTodoFailure/g, 'updateTodoFailure'],
    ],
  },
  {
    file: 'src/app/features/notifications/data-access/notification.effects.ts',
    replacements: [
      [
        "import * as TodoActions from '@anular-ngrx/todos-data-access';",
        "import { addTodoSuccess, updateTodoSuccess, deleteTodoSuccess, toggleTodoSuccess } from '@anular-ngrx/todos-data-access';",
      ],
    ],
  },
  {
    file: 'src/app/features/notifications/data-access/notification.effects.spec.ts',
    replacements: [
      [
        "import * as TodoActions from '@anular-ngrx/todos-data-access';",
        "import { addTodoSuccess, updateTodoSuccess, deleteTodoSuccess, toggleTodoSuccess } from '@anular-ngrx/todos-data-access';",
      ],
    ],
  },
  {
    file: 'src/app/core/store/store.meta-reducers.spec.ts',
    replacements: [
      [
        "import * as TodoActions from '@anular-ngrx/todos-data-access';",
        "import { loadTodosSuccess, initialTodoState, todosReducer } from '@anular-ngrx/todos-data-access';",
      ],
    ],
  },
  {
    file: 'src/app/core/store/devtools-config.spec.ts',
    replacements: [
      [
        "import * as AuthActions from '@anular-ngrx/auth-data-access';",
        "import { loginSuccess, logoutUser } from '@anular-ngrx/auth-data-access';",
      ],
    ],
  },
];

for (const fix of fileFixes) {
  const full = path.join(root, fix.file);
  if (!fs.existsSync(full)) {
    console.warn('missing', fix.file);
    continue;
  }
  let content = fs.readFileSync(full, 'utf8');
  for (const [from, to] of fix.replacements || []) {
    content = content.replace(from, to);
  }
  for (const [re, to] of fix.extras || []) {
    content = content.replace(re, to);
  }
  fs.writeFileSync(full, content);
  console.log('fixed', fix.file);
}
