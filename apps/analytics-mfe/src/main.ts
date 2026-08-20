import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import {
  TODO_REPOSITORY,
  createJsonServerTodoRepository,
} from './services/json-server-todo.repository';
import '../../../libs/shared/ui/styles/_tokens.css';
import './styles.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.provide(TODO_REPOSITORY, createJsonServerTodoRepository());
app.use(router);
app.mount('#app');
