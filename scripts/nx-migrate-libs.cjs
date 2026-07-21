/**
 * Phase 4.6 Nx migration helper — move feature code into libs and rewrite imports.
 * Run: node scripts/nx-migrate-libs.mjs
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function write(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
}

// Remove scaffold placeholder components
const scaffolds = [
  'libs/auth/data-access/src/lib/auth-data-access',
  'libs/auth/feature-login/src/lib/auth-feature-login',
  'libs/todos/data-access/src/lib/todos-data-access',
  'libs/todos/feature-list/src/lib/todos-feature-list',
  'libs/shared/ui/src/lib/shared-ui',
];
for (const s of scaffolds) rmrf(path.join(root, s));

// Copy source trees into libs
const moves = [
  ['src/app/features/auth/data-access', 'libs/auth/data-access/src/lib'],
  ['src/app/features/auth/pages', 'libs/auth/feature-login/src/lib/pages'],
  ['src/app/features/auth/auth.routes.ts', 'libs/auth/feature-login/src/lib/auth.routes.ts'],
  ['src/app/features/auth/ui', 'libs/auth/feature-login/src/lib/ui'],
  ['src/app/features/todos/data-access', 'libs/todos/data-access/src/lib'],
  ['src/app/features/todos/pages', 'libs/todos/feature-list/src/lib/pages'],
  ['src/app/features/todos/ui', 'libs/todos/feature-list/src/lib/ui'],
  ['src/app/features/todos/todos.routes.ts', 'libs/todos/feature-list/src/lib/todos.routes.ts'],
  ['src/app/shared/ui', 'libs/shared/ui/src/lib'],
];

for (const [fromRel, toRel] of moves) {
  const from = path.join(root, fromRel);
  const to = path.join(root, toRel);
  if (!fs.existsSync(from)) {
    console.warn('skip missing', fromRel);
    continue;
  }
  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    copyDir(from, to);
  } else {
    ensureDir(path.dirname(to));
    fs.copyFileSync(from, to);
  }
  console.log('copied', fromRel, '->', toRel);
}

// Barrel exports
write(
  path.join(root, 'libs/auth/data-access/src/index.ts'),
  `export * from './lib/auth.actions';
export * from './lib/auth.model';
export * from './lib/auth.reducer';
export * from './lib/auth.selectors';
export * from './lib/auth.feature';
export * from './lib/auth.facade';
export * from './lib/auth.service';
export * from './lib/auth.effects';
export * from './lib/auth-signal-form.schema';
export * from './lib/user-profile.model';
`
);

write(
  path.join(root, 'libs/auth/feature-login/src/index.ts'),
  `export * from './lib/pages/login/login.component';
export * from './lib/pages/register/register.component';
export * from './lib/ui/user-profile/user-profile.component';
export { AUTH_ROUTES } from './lib/auth.routes';
`
);

write(
  path.join(root, 'libs/todos/data-access/src/index.ts'),
  `export * from './lib/todo.model';
export * from './lib/todo.actions';
export * from './lib/todo.reducer';
export * from './lib/todo.selectors';
export * from './lib/todo.effects';
export * from './lib/todo.repository';
export * from './lib/json-server-todo.repository';
export * from './lib/http-todo.repository';
export * from './lib/todo-repository.providers';
export * from './lib/todo-filter.strategy';
export * from './lib/todos.facade';
`
);

write(
  path.join(root, 'libs/todos/feature-list/src/index.ts'),
  `export * from './lib/pages/todo-list/todo-list.component';
export * from './lib/pages/todo-list/todo-list-ui.store';
export * from './lib/ui/todo-item/todo-item.component';
export * from './lib/ui/todo-form/todo-form.component';
export * from './lib/ui/todo-filter/todo-filter.component';
export * from './lib/ui/todo-tree-item/todo-tree-item.component';
export * from './lib/ui/todo-stats-panel/todo-stats-panel.component';
export { TODOS_ROUTES } from './lib/todos.routes';
`
);

write(
  path.join(root, 'libs/shared/ui/src/index.ts'),
  `export * from './lib/spinner/spinner.component';
export * from './lib/form-field/form-field.component';
export * from './lib/toast/toast.service';
export * from './lib/toast/toast.model';
export * from './lib/toast/toast-container.component';
export * from './lib/global-error-banner/global-error-banner.component';
`
);

// Fix auth.routes export name if needed
const authRoutesPath = path.join(root, 'libs/auth/feature-login/src/lib/auth.routes.ts');
if (fs.existsSync(authRoutesPath)) {
  let content = fs.readFileSync(authRoutesPath, 'utf8');
  // ensure named export AUTH_ROUTES exists or alias
  if (content.includes('export const AUTH_ROUTES')) {
    // ok
  } else if (content.match(/export const \w+_ROUTES/)) {
    // keep as-is, index will be fixed below after reading
  }
  console.log('auth.routes preview:', content.slice(0, 200));
}

console.log('done copy + barrels');
