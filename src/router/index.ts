import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Competitions from '@/views/competitions/Competitions.vue'
import CompetitionShow from '@/views/competitions/CompetitionShow.vue'
import CompetitionNew from '@/views/competitions/CompetitionNew.vue'
import CompetitionEdit from '@/views/competitions/CompetitionEdit.vue'
import Teams from '@/views/teams/Teams.vue'
import TeamShow from '@/views/teams/TeamShow.vue'
import TeamDetail from '@/views/teams/TeamDetail.vue'
import TeamNew from '@/views/teams/TeamNew.vue'
import TeamEdit from '@/views/teams/TeamEdit.vue'
import TeamProjects from '@/views/team_projects/TeamProjects.vue'
import TeamProjectNew from '@/views/team_projects/TeamProjectNew.vue'
import TeamProjectEdit from '@/views/team_projects/TeamProjectEdit.vue'
import TeamProject from '@/views/team_projects/TeamProject.vue'
import TeamCompetitions from '@/views/team_competitions/TeamCompetitions.vue'
import Login from '@/views/Login.vue'
import AuthCallback from '@/views/AuthCallback.vue'
import Onboarding from '@/views/Onboarding.vue'
import { useUserStore } from '@/store/user'
import { useFlashStore } from '@/store/flash'
import { useModalStore } from '@/store/modal'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: Dashboard, // has router-view -- wraps team and competition views
    redirect: to => { return '/teams' },
    children: [
      {
        path: '/teams',
        name: 'teams',
        component: Teams
      },
      {
        path: '/my-teams',
        name: 'my-teams',
        component: Teams
      },
      {
        path: '/teams/new',
        name: 'teams-new',
        component: TeamNew
      },
      {
        path: '/teams/:id/edit',
        name: 'team-edit',
        component: TeamEdit // edit a team instance directly
      },
      {
        path: '/teams/:id',
        name: 'team-parent',
        component: TeamShow, // has router-view -- container team children
        children: [
          {
            path: '',
            name: 'team-show',
            component: TeamDetail
          },
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
          },
          {
            path: 'competitions',
            name: 'team-competitions',
            component: TeamCompetitions
          }
        ],
      },
      {
        path: '/competitions',
        name: 'competitions',
        component: Competitions,
      },
      {
        path: '/competitions/:id',
        name: 'comp-show',
        component: CompetitionShow
      },
      {
        path: '/competitions/:id/edit',
        name: 'comp-edit',
        component: CompetitionEdit
      },
      {
        path: '/competitions/new',
        name: 'comp-new',
        component: CompetitionNew
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
  const flash = useFlashStore()
  const modal = useModalStore()
  flash.$reset()
  modal.$reset()

  if (store.oauth && !store.profile && to.name !== 'auth_callback') {
    return { name: 'auth_callback', query: { redirect: to.path }}
  }

})

export default router