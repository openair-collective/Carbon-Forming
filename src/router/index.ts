import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Competitions from '@/views/Competitions.vue'
import Team from '@/views/Team.vue'
import UserTeam from '@/views/UserTeam.vue'
import Login from '@/views/Login.vue'
import AuthCallback from '@/views/AuthCallback.vue'
import { useUserStore } from '@/store/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: Dashboard,
    children: [
      {
        path: '/user/:id/teams/:team_id',
        name: 'user-team',
        component: UserTeam
      }
    ]
  },
  {
    path: '/competitions',
    name: 'competitions',
    component: Competitions
  },
  {
    path: '/teams/:id',
    name: 'team',
    component: Team
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
  else if (store.oauth && !store.profile && to.name !== 'auth_callback') {
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