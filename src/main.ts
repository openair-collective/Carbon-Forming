import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import Modal from './Modal.vue'
import FontAwesomeIcon from '@/utils/fontAwesome'

import './_layout.scss'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')

const modal = createApp(Modal)
modal.use(pinia)
modal.use(router)
modal.mount('#modals')
modal.component('font-awesome-icon', FontAwesomeIcon)

import { teamProjectsSync, compProjectsSync, teamsSync } from '@/jobs/firestore_sync'
teamProjectsSync(pinia)
compProjectsSync(pinia)
teamsSync(pinia)

import { useModalStore } from './store/modal'
let modal_store = useModalStore()
modal_store.$subscribe((mutation, state) => {
  if (state.options && state.options.fullscreen) {
    document.body.classList.add('has-modal--fullscreen')
  }
  else {
    document.body.classList.remove('has-modal--fullscreen')
  }
})

const hash = __COMMIT_HASH__.replace(/(\r\n|\n|\r)/gm, "")

console.info(`Version: ${__APP_VERSION__}+build.${hash} | Dev Mode: ${ import.meta.env.DEV }`)