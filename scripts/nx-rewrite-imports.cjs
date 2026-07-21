/**
 * Rewrite imports after Nx lib extraction.
 * Run: node scripts/nx-rewrite-imports.cjs
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.angular') continue;
      walk(full, files);
    } else if (/\.(ts|html)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const replacements = [
  // Auth data-access
  [/@app\/features\/auth\/data-access\/auth\.facade/g, '@anular-ngrx/auth-data-access'],
  [/@app\/features\/auth\/data-access\/auth\.actions/g, '@anular-ngrx/auth-data-access'],
  [/@app\/features\/auth\/data-access\/auth\.selectors/g, '@anular-ngrx/auth-data-access'],
  [/@app\/features\/auth\/data-access\/auth\.model/g, '@anular-ngrx/auth-data-access'],
  [/@app\/features\/auth\/data-access\/auth\.feature/g, '@anular-ngrx/auth-data-access'],
  [/@app\/features\/auth\/data-access\/auth\.reducer/g, '@anular-ngrx/auth-data-access'],
  [/@app\/features\/auth\/data-access\/auth\.effects/g, '@anular-ngrx/auth-data-access'],
  [/@app\/features\/auth\/data-access\/auth\.service/g, '@anular-ngrx/auth-data-access'],
  [/@app\/features\/auth\/data-access\/auth-signal-form\.schema/g, '@anular-ngrx/auth-data-access'],
  [/@app\/features\/auth\/data-access\/user-profile\.model/g, '@anular-ngrx/auth-data-access'],
  [/@app\/features\/auth\/data-access\/([^'"]+)/g, '@anular-ngrx/auth-data-access'],

  // Auth feature
  [/@app\/features\/auth\/pages\/login\/login\.component/g, '@anular-ngrx/auth-feature-login'],
  [/@app\/features\/auth\/pages\/register\/register\.component/g, '@anular-ngrx/auth-feature-login'],
  [/@app\/features\/auth\/ui\/user-profile\/user-profile\.component/g, '@anular-ngrx/auth-feature-login'],
  [/@app\/features\/auth\/auth\.routes/g, '@anular-ngrx/auth-feature-login'],

  // Todos data-access
  [/@app\/features\/todos\/data-access\/todos\.facade/g, '@anular-ngrx/todos-data-access'],
  [/@app\/features\/todos\/data-access\/todo\.model/g, '@anular-ngrx/todos-data-access'],
  [/@app\/features\/todos\/data-access\/todo\.actions/g, '@anular-ngrx/todos-data-access'],
  [/@app\/features\/todos\/data-access\/todo\.selectors/g, '@anular-ngrx/todos-data-access'],
  [/@app\/features\/todos\/data-access\/todo\.reducer/g, '@anular-ngrx/todos-data-access'],
  [/@app\/features\/todos\/data-access\/todo\.effects/g, '@anular-ngrx/todos-data-access'],
  [/@app\/features\/todos\/data-access\/todo\.repository/g, '@anular-ngrx/todos-data-access'],
  [/@app\/features\/todos\/data-access\/todo-repository\.providers/g, '@anular-ngrx/todos-data-access'],
  [/@app\/features\/todos\/data-access\/todo-filter\.strategy/g, '@anular-ngrx/todos-data-access'],
  [/@app\/features\/todos\/data-access\/json-server-todo\.repository/g, '@anular-ngrx/todos-data-access'],
  [/@app\/features\/todos\/data-access\/http-todo\.repository/g, '@anular-ngrx/todos-data-access'],
  [/@app\/features\/todos\/data-access\/([^'"]+)/g, '@anular-ngrx/todos-data-access'],

  // Todos feature
  [/@app\/features\/todos\/pages\/todo-list\/todo-list\.component/g, '@anular-ngrx/todos-feature-list'],
  [/@app\/features\/todos\/pages\/todo-list\/todo-list-ui\.store/g, '@anular-ngrx/todos-feature-list'],
  [/@app\/features\/todos\/ui\/todo-item\/todo-item\.component/g, '@anular-ngrx/todos-feature-list'],
  [/@app\/features\/todos\/ui\/todo-form\/todo-form\.component/g, '@anular-ngrx/todos-feature-list'],
  [/@app\/features\/todos\/ui\/todo-filter\/todo-filter\.component/g, '@anular-ngrx/todos-feature-list'],
  [/@app\/features\/todos\/ui\/todo-tree-item\/todo-tree-item\.component/g, '@anular-ngrx/todos-feature-list'],
  [/@app\/features\/todos\/ui\/todo-stats-panel\/todo-stats-panel\.component/g, '@anular-ngrx/todos-feature-list'],
  [/@app\/features\/todos\/todos\.routes/g, '@anular-ngrx/todos-feature-list'],

  // Shared UI
  [/@app\/shared\/ui\/spinner\/spinner\.component/g, '@anular-ngrx/shared-ui'],
  [/@app\/shared\/ui\/form-field\/form-field\.component/g, '@anular-ngrx/shared-ui'],
  [/@app\/shared\/ui\/toast\/toast\.service/g, '@anular-ngrx/shared-ui'],
  [/@app\/shared\/ui\/toast\/toast\.model/g, '@anular-ngrx/shared-ui'],
  [/@app\/shared\/ui\/toast\/toast-container\.component/g, '@anular-ngrx/shared-ui'],
  [/@app\/shared\/ui\/global-error-banner\/global-error-banner\.component/g, '@anular-ngrx/shared-ui'],
  [/@app\/shared\/ui\/([^'"]+)/g, '@anular-ngrx/shared-ui'],
];

const dirs = [
  path.join(root, 'libs'),
  path.join(root, 'src'),
];

let changed = 0;
for (const dir of dirs) {
  for (const file of walk(dir)) {
    let content = fs.readFileSync(file, 'utf8');
    const before = content;
    for (const [re, to] of replacements) {
      content = content.replace(re, to);
    }
    if (content !== before) {
      fs.writeFileSync(file, content);
      changed++;
    }
  }
}

console.log('updated files:', changed);

// Remove old feature source that was copied (keep notifications)
const toRemove = [
  'src/app/features/auth',
  'src/app/features/todos',
  'src/app/shared/ui',
];
for (const rel of toRemove) {
  const p = path.join(root, rel);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log('removed', rel);
  }
}
