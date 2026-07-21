const fs = require('fs');
const path = require('path');

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.angular'].includes(e.name)) continue;
      walk(f, a);
    } else if (f.endsWith('.ts')) a.push(f);
  }
  return a;
}

const map = [
  [
    /import \* as AuthActions from '@anular-ngrx\/auth-data-access';/g,
    "import * as AuthActions from '@anular-ngrx/auth-data-access/auth.actions';",
  ],
  [
    /import \* as AuthSelectors from '@anular-ngrx\/auth-data-access';/g,
    "import * as AuthSelectors from '@anular-ngrx/auth-data-access/auth.selectors';",
  ],
  [
    /import \* as TodoActions from '@anular-ngrx\/todos-data-access';/g,
    "import * as TodoActions from '@anular-ngrx/todos-data-access/todo.actions';",
  ],
  [
    /import \* as TodoSelectors from '@anular-ngrx\/todos-data-access';/g,
    "import * as TodoSelectors from './todo.selectors';",
  ],
  [
    /import \{ TodoItemComponent \} from '@anular-ngrx\/todos-feature-list';/g,
    "import { TodoItemComponent } from '../todo-item/todo-item.component';",
  ],
  [
    /import \{ TodoStatsPanelComponent \} from '@anular-ngrx\/todos-feature-list';/g,
    "import { TodoStatsPanelComponent } from '../../ui/todo-stats-panel/todo-stats-panel.component';",
  ],
  [
    /import \{ TodoTreeItemComponent \} from '@anular-ngrx\/todos-feature-list';/g,
    "import { TodoTreeItemComponent } from '../../ui/todo-tree-item/todo-tree-item.component';",
  ],
  [
    /import \{ TodoFormComponent \} from '@anular-ngrx\/todos-feature-list';/g,
    "import { TodoFormComponent } from '../../ui/todo-form/todo-form.component';",
  ],
  [
    /import \{ TodoFilterComponent \} from '@anular-ngrx\/todos-feature-list';/g,
    "import { TodoFilterComponent } from '../../ui/todo-filter/todo-filter.component';",
  ],
  [
    /import \{ selectTodoEntities \} from '@anular-ngrx\/todos-data-access';/g,
    "import { selectTodoEntities } from './todo.selectors';",
  ],
];

let n = 0;
for (const file of [...walk('libs'), ...walk('src')]) {
  let c = fs.readFileSync(file, 'utf8');
  const b = c;
  for (const [re, to] of map) c = c.replace(re, to);
  if (c !== b) {
    fs.writeFileSync(file, c);
    n++;
    console.log(file);
  }
}
console.log('files', n);
