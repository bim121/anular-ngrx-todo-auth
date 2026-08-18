import { Meta, StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { CardComponent } from './card.component';

const meta: Meta<CardComponent> = {
  title: 'DS/Card',
  component: CardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CardComponent],
    }),
  ],
  args: {
    title: 'Empty state',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-card [title]="title" style="width:min(22rem,90vw)">
        <p style="margin:0;color:var(--color-muted)">No todos yet. Add one to get started.</p>
      </app-card>
    `,
  }),
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = {};
