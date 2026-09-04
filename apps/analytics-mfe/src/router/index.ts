import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ensureAnalyticsNoIndex, setDocumentTitle } from '@/core/seo';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/features/home/HomeView.vue'),
      meta: { title: 'Analytics MFE' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/LoginView.vue'),
      meta: { guestOnly: true, title: 'Login — Analytics MFE' },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/features/analytics/AnalyticsView.vue'),
      meta: { requiresAuth: true, title: 'Analytics dashboard' },
    },
    {
      path: '/todos',
      name: 'todos',
      component: () => import('@/features/todos/TodoListView.vue'),
      meta: { requiresAuth: true, title: 'Todos — Analytics MFE' },
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta['requiresAuth'] && !auth.token) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta['guestOnly'] && auth.token) {
    return { name: 'todos' };
  }

  return true;
});

router.afterEach((to) => {
  ensureAnalyticsNoIndex();
  const title = typeof to.meta['title'] === 'string' ? to.meta['title'] : 'Analytics MFE';
  setDocumentTitle(title);
});

export default router;
