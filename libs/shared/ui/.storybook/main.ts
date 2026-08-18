import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  stories: ['../src/lib/**/*.stories.ts'],
  addons: [],
  framework: {
    name: '@storybook/angular-vite',
    options: {
      jit: true,
      tsconfig: 'libs/shared/ui/.storybook/tsconfig.json',
      compodoc: false,
    },
  },
};

export default config;
