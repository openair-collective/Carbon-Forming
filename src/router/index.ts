import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Competitions from '@/views/competitions/Competitions.vue'
import CompetitionShow from '@/views/competitions/CompetitionShow.vue'
import CompetitionDetail from '@/views/competitions/CompetitionDetail.vue'
import CompetitionNew from '@/views/competitions/CompetitionNew.vue'
import CompetitionEdit from '@/views/competitions/CompetitionEdit.vue'
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
    children: [
      {
        path: '',
        name: 'home',
        component: Home
      },
      {
        path: '/builds/:id',
        name: 'comp-parent',
        component: CompetitionShow, // has router-view -- container team children
        children: [
          {
            path: '',
            name: 'comp-show',
            component: CompetitionDetail
          }
        ]
      },
      {
        path: '/builds/:id/edit',
        name: 'comp-edit',
        component: CompetitionEdit
      },
      {
        path: '/builds/new',
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