import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'src/features/**',
      'src/stores/**',
      'src/hooks/**',
      'src/providers/**',
      'src/core/**',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
];

export default eslintConfig;
