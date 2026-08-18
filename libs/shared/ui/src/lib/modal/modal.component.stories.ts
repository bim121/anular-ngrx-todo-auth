import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Meta, StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { ButtonComponent } from '../button/button.component';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal-story-host',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display:flex;flex-direction:column;gap:0.75rem;align-items:flex-start">
      <button app-button variant="danger" type="button" (click)="open()">
        Open confirm
      </button>
      <p style="margin:0;color:var(--color-muted)">Last result: {{ result() }}</p>
    </div>
  `,
})
class ModalStoryHostComponent {
  private readonly modal = inject(ModalService);
  readonly result = signal('—');

  open(): void {
    this.modal
      .confirm({
        title: 'Delete task',
        message: 'Are you sure you want to delete this task?',
        confirmLabel: 'Delete',
        danger: true,
      })
      .subscribe((ok) => this.result.set(ok ? 'confirmed' : 'cancelled'));
  }
}

const meta: Meta = {
  title: 'DS/Modal',
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [ModalService],
    }),
    moduleMetadata({
      imports: [ModalStoryHostComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'CDK Dialog confirm: focus trap, Escape / backdrop close, `role="dialog"` + `aria-modal`. Click Open, then Cancel or Delete (or press Escape).',
      },
    },
  },
  render: () => ({
    template: `<app-modal-story-host />`,
  }),
};

export default meta;
type Story = StoryObj;

export const OpenClose: Story = {};
