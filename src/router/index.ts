import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import Competitions from '@/views/competitions/Competitions.vue'
import CompetitionShow from '@/views/competitions/CompetitionShow.vue'
import CompetitionDetail from '@/views/competitions/CompetitionDetail.vue'
import CompetitionNew from '@/views/competitions/CompetitionNew.vue'
import CompetitionEdit from '@/views/competitions/CompetitionEdit.vue'
import CompetitionEnter from '@/views/competitions/CompetitionEnter.vue'
import CompetitionProject from '@/views/competition_projects/CompetitionProject.vue'
import CompetitionProjects from '@/views/competition_projects/CompetitionProjects.vue'
import CompetitionResults from '@/views/competition_results/CompetitionResults.vue'
import CompetitionResultsEdit from '@/views/competition_results/CompetitionResultsEdit.vue'
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
import About from '@/views/About.vue'
import { useUserStore } from '@/store/user'
import { useFlashStore } from '@/store/flash'
import { useModalStore } from '@/store/modal'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    redirect: to => { return '/competitions' },
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
        ]
      },
      {
        path: '/competitions',
        name: 'competitions',
        component: Competitions,
      },
      {
        path: '/competitions/:id',
        name: 'comp-parent',
        component: CompetitionShow, // has router-view -- container team children
        children: [
          {
            path: '',
            name: 'comp-show',
            component: CompetitionDetail
          },
          {
            path: 'enter',
            name: 'comp-enter',
            component: CompetitionEnter
          },
          {
            path: 'projects',
            name: 'comp-projects',
            component: CompetitionProjects
          },
          {
            path: 'results',
            name: 'comp-results',
            component: CompetitionResults
          },
          {
            path: 'results/edit',
            name: 'comp-results-edit',
            component: CompetitionResultsEdit
          },
          {
            path: 'projects/:project_id',
            name: 'comp-project-show',
            component: CompetitionProject
          }
        ]
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
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/auth/callback',
    name: 'auth_callback',
    component: AuthCallback
  },
  {
    path: '/about',
    name: 'about',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  const flash = useFlashStore()
  const modal = useModalStore()
  flash.$reset()
  modal.$reset()

  if (userStore.oauth && !userStore.profile && to.name !== 'auth_callback') {
    return { name: 'auth_callback', query: { redirect: to.path }}
  }
})

export default router