import { FormsModule } from '@angular/forms';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { ButtonComponent } from './button/button.component';
import { CardComponent } from './card/card.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { InputComponent } from './input/input.component';

const meta: Meta = {
  title: 'DS/Composition',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        CardComponent,
        FormFieldComponent,
        InputComponent,
        CheckboxComponent,
        ButtonComponent,
        FormsModule,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Card + FormField/Input + Checkbox + Buttons — the same primitives used on auth/todos after Phase 6.5.',
      },
    },
  },
  render: () => ({
    props: { notify: true },
    template: `
      <app-card title="New task" style="width:min(24rem,90vw)">
        <app-form-field label="Title" controlId="comp-title" hint="Keep it short">
          <app-input inputId="comp-title" placeholder="Buy milk" />
        </app-form-field>
        <div style="margin:0 0 1rem">
          <app-checkbox [(ngModel)]="notify">Notify me</app-checkbox>
        </div>
        <div style="display:flex;gap:0.75rem;justify-content:flex-end">
          <button app-button type="button" variant="secondary">Cancel</button>
          <button app-button type="button">Add task</button>
        </div>
      </app-card>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const TaskForm: Story = {};
