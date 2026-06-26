<script setup lang="ts">
import { RouterView } from 'vue-router';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';

const isDev = import.meta.env.DEV;
</script>

<template>
  <RouterView />
  <VueQueryDevtools v-if="isDev" button-position="bottom-left" />
</template>
