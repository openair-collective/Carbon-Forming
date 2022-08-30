import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Competitions from '@/views/Competitions.vue'
import Login from '@/views/Login.vue'
import AuthCallback from '@/views/AuthCallback.vue'
import { useUserStore } from '@/store/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/competitions',
    name: 'competitions',
    component: Competitions
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

router.beforeEach(async (to, from, next) => {
  const store = useUserStore()
  // auth_callback should always load - it manages intermediate Auth states
  if (to.name === 'auth_callback') {
    next()
  }
  else if (store.oauth && !store.currentUser && to.name !== 'auth_callback') {
    next({ name: 'auth_callback'})
  }
  else if (!store.oauth && to.name !== 'login') {
    next({ name: 'login' })
  }
  else {
    next()
  }
})

// can set some router hooks here
export function useRouter(app: App<Element>) {
  app.use(router)
}

export default router