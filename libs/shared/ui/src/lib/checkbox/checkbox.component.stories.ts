import { FormsModule } from '@angular/forms';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { CheckboxComponent } from './checkbox.component';

type CheckboxStoryArgs = {
  modelChecked: boolean;
  label: string;
  disabled: boolean;
};

const meta: Meta<CheckboxStoryArgs> = {
  title: 'DS/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CheckboxComponent, FormsModule],
    }),
  ],
  argTypes: {
    modelChecked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    modelChecked: false,
    disabled: false,
    label: 'Mark as done',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-checkbox [(ngModel)]="modelChecked" [disabled]="disabled">
        {{ label }}
      </app-checkbox>
    `,
  }),
};

export default meta;
type Story = StoryObj<CheckboxStoryArgs>;

export const Unchecked: Story = {
  args: { modelChecked: false },
};

export const Checked: Story = {
  args: { modelChecked: true },
};
