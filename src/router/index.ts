import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Competitions from '@/views/Competitions.vue'
import Competition from '@/views/Competition.vue'
import Teams from '@/views/Teams.vue'
import TeamNew from '@/views/TeamNew.vue'
import TeamProjects from '@/views/TeamProjects.vue'
import TeamProjectNew from '@/views/TeamProjectNew.vue'
import TeamProjectEdit from '@/views/TeamProjectEdit.vue'
import TeamProject from '@/views/TeamProject.vue'
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
        path: '/teams/new',
        name: 'teams-new',
        component: TeamNew
      },
      {
        path: '/teams/:id',
        name: 'teams',
        redirect: to => `/teams/${to.params.id}/projects`,
        component: Teams,
        children: [
          {
            path: 'projects',
            name: 'team-projects',
            component: TeamProjects
          },
          {
            path: 'projects/:project_id',
            name: 'team-project-show',
            component: TeamProject
          },
          {
            path: 'projects/:project_id/edit',
            name: 'team-project-edit',
            component: TeamProjectEdit
          },
          {
            path: 'projects/new',
            name: 'team-project-new',
            component: TeamProjectNew
          }
        ]
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