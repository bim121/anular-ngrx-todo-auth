<script setup lang="ts">
import type { Todo } from '@shared/data-access';

defineProps<{
  todo: Todo;
  disabled: boolean;
}>();

defineEmits<{
  toggle: [id: string];
  delete: [id: string];
}>();
</script>

<template>
  <li class="item" :class="{ 'item--done': todo.completed }">
    <label class="item__label">
      <input
        type="checkbox"
        :checked="todo.completed"
        :disabled="disabled"
        @change="$emit('toggle', todo.id)"
      />
      <span>{{ todo.task }}</span>
    </label>
    <button
      type="button"
      class="item__delete"
      :disabled="disabled"
      @click="$emit('delete', todo.id)"
    >
      Delete
    </button>
  </li>
</template>

<style scoped>
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
}

.item__label {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
}

.item--done span {
  text-decoration: line-through;
  color: #94a3b8;
}

.item__delete {
  padding: 0.35rem 0.65rem;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  background: transparent;
  color: #fca5a5;
  cursor: pointer;
}

.item__delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
