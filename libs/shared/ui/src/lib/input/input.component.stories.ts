import { Meta, StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { FormFieldComponent } from '../form-field/form-field.component';
import { InputComponent } from './input.component';

const meta: Meta<InputComponent> = {
  title: 'DS/Input',
  component: InputComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [InputComponent, FormFieldComponent],
    }),
  ],
  argTypes: {
    placeholder: { control: 'text' },
    type: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: 'you@example.com',
    type: 'email',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-form-field label="Email" controlId="story-email" hint="Used to sign in">
        <app-input
          inputId="story-email"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
        />
      </app-form-field>
    `,
  }),
};

export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Locked field' },
};

export const ErrorState: Story = {
  render: () => ({
    template: `
      <app-form-field label="Email" controlId="story-email-error">
        <app-input inputId="story-email-error" type="email" placeholder="you@example.com" />
        <span dsError>Enter a valid email</span>
      </app-form-field>
    `,
  }),
};
