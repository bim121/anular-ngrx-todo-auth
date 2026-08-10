import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { Todo } from '@shared/data-access';
import TodoRow from './TodoRow.vue';

const COUNT = 1000;
/** Soft CI bar — local machines are usually well under this. */
const RENDER_BUDGET_MS = 1500;

function makeTodos(count: number): Todo[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `perf_${index + 1}`,
    userId: 'user-1',
    task: `Stress todo #${index + 1}`,
    completed: index % 7 === 0,
    tags: ['perf'],
  }));
}

const ListHarness = {
  components: { TodoRow },
  props: {
    todos: { type: Array as () => Todo[], required: true },
  },
  template: `
    <ul>
      <TodoRow
        v-for="todo in todos"
        :key="todo.id"
        v-memo="[todo.id, todo.completed, todo.task, false]"
        :todo="todo"
        :disabled="false"
      />
    </ul>
  `,
};

describe('TodoRow v-memo perf smoke (V.5.3)', () => {
  it(`renders ${COUNT} rows under ${RENDER_BUDGET_MS}ms`, () => {
    const todos = makeTodos(COUNT);
    const started = performance.now();
    const wrapper = mount(ListHarness, { props: { todos } });
    const elapsed = performance.now() - started;

    expect(wrapper.findAllComponents(TodoRow)).toHaveLength(COUNT);
    expect(elapsed).toBeLessThan(RENDER_BUDGET_MS);
  });
});
