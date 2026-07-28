// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const nx = require('@nx/eslint-plugin');

module.exports = defineConfig([
  ...nx.configs['flat/base'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/node_modules'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            // App-local path aliases resolve inside `web` — keep `@app/*` ergonomics.
            '^@app/',
          ],
          depConstraints: [
            {
              sourceTag: 'scope:auth',
              onlyDependOnLibsWithTags: ['scope:auth', 'scope:shared'],
            },
            {
              sourceTag: 'scope:todos',
              onlyDependOnLibsWithTags: [
                'scope:todos',
                'scope:auth',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:data-access',
                'type:ui',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: [
                'type:data-access',
                'type:ui',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'scope:shared'],
            },
            {
              sourceTag: 'scope:web',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      // Phase 5.3.4 — ban legacy / internal RxJS entry points (works without type-aware lint).
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'rxjs/Rx',
              message: 'Use named imports from "rxjs" (RxJS 7+).',
            },
            {
              name: 'rxjs/internal',
              message: 'Do not import RxJS internals.',
            },
          ],
          patterns: [
            {
              group: ['rxjs/internal/*'],
              message: 'Do not import RxJS internals.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/pages/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@ngrx/store',
              importNames: ['Store'],
              message:
                'Pages must inject facades (AuthFacade / TodosFacade), not Store directly (phase 4.2.3).',
            },
            {
              name: 'rxjs/Rx',
              message: 'Use named imports from "rxjs" (RxJS 7+).',
            },
            {
              name: 'rxjs/internal',
              message: 'Do not import RxJS internals.',
            },
          ],
          patterns: [
            {
              group: ['rxjs/internal/*'],
              message: 'Do not import RxJS internals.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
]);
