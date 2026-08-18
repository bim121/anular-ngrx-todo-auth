import { Meta, StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent & { label: string }> = {
  title: 'DS/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent],
    }),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    label: 'Save',
  },
  render: (args) => ({
    props: args,
    template: `
      <button
        app-button
        [variant]="variant"
        [size]="size"
        [disabled]="disabled"
        [loading]="loading"
      >
        {{ label }}
      </button>
    `,
  }),
};

export default meta;
type Story = StoryObj<ButtonComponent & { label: string }>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', label: 'Cancel' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', label: 'Skip' },
};

export const Danger: Story = {
  args: { variant: 'danger', label: 'Delete' },
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Unavailable' },
};

export const Loading: Story = {
  args: { loading: true, label: 'Saving' },
};

/** All variants and sizes on one canvas. */
export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display:grid;gap:1rem">
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center">
          <button app-button variant="primary">Primary</button>
          <button app-button variant="secondary">Secondary</button>
          <button app-button variant="ghost">Ghost</button>
          <button app-button variant="danger">Danger</button>
        </div>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center">
          <button app-button size="sm">Small</button>
          <button app-button size="md">Medium</button>
          <button app-button size="lg">Large</button>
        </div>
      </div>
    `,
  }),
};
