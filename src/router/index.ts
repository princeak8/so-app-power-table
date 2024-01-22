import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue';
import Settings from '../views/Settings.vue';
import Reports from "@/views/Reports.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/settings',
      name: 'settings',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: Settings
    },
    {
      path: '/reports',
      name: 'reports',
      component: Reports
    },
  ]
})

export default router
