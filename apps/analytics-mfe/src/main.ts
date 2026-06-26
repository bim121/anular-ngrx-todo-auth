import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import App from './App.vue';
import { createAppQueryClient } from './core/query-client';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(VueQueryPlugin, { queryClient: createAppQueryClient() });
app.use(router);
app.mount('#app');
