import { FormsModule } from '@angular/forms';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent & { checked: boolean; label: string }> = {
  title: 'DS/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CheckboxComponent, FormsModule],
    }),
  ],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    checked: false,
    disabled: false,
    label: 'Mark as done',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-checkbox [(ngModel)]="checked" [disabled]="disabled">
        {{ label }}
      </app-checkbox>
    `,
  }),
};

export default meta;
type Story = StoryObj<CheckboxComponent & { checked: boolean; label: string }>;

export const Unchecked: Story = {
  args: { checked: false },
};

export const Checked: Story = {
  args: { checked: true },
};
