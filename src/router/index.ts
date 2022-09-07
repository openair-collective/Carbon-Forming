import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Competitions from '@/views/Competitions.vue'
import Competition from '@/views/Competition.vue'
import Teams from '@/views/Teams.vue'
import Login from '@/views/Login.vue'
import AuthCallback from '@/views/AuthCallback.vue'
import Onboarding from '@/views/Onboarding.vue'
import { useUserStore } from '@/store/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: Dashboard,
    children: [
      {
        path: '/teams/:id',
        name: 'teams',
        component: Teams
      },
      {
        path: '/competitions',
        name: 'competitions',
        component: Competitions
      },
      {
        path: '/competitions/:id',
        name: 'competition',
        component: Competition
      }
    ]
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: Onboarding
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/auth/callback',
    name: 'auth_callback',
    component: AuthCallback
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from) => {
  const store = useUserStore()

  if (!store.oauth && to.name !== 'auth_callback' && to.name !== 'login') {
    return { name: 'login', query: { redirect: to.path }}
  }
  else if (!store.profile && to.name !== 'auth_callback' && to.name !== 'login') {
    return { name: 'auth_callback', query: { redirect: to.path }}
  }

})

export default router