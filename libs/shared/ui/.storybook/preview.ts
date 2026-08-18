import type { Preview } from '@storybook/angular-vite';
import '../styles/_tokens.css';
import '../styles/_overlay.css';

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'In-repo DS theme (`data-theme` on <html>)',
      toolbar: {
        title: 'Theme',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'JSDoc on `input()` fields is shown in Autodocs Controls / Args tables.',
      },
    },
  },
  decorators: [
    (story, context) => {
      const theme = (context.globals['theme'] as string) || 'light';
      document.documentElement.setAttribute('data-theme', theme);
      document.body.style.background = 'var(--color-bg)';
      document.body.style.color = 'var(--color-text)';
      document.body.style.fontFamily = 'var(--font-sans)';
      return story();
    },
  ],
};

export default preview;
