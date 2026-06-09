import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/features/home/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/features/analytics/AnalyticsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta['requiresAuth'] && !auth.token) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta['guestOnly'] && auth.token) {
    return { name: 'analytics' };
  }

  return true;
});

export default router;
