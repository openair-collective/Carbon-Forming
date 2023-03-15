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

import { teamProjectsSync, compProjectsSync, teamsSync } from '@/jobs/firestore_sync'
teamProjectsSync(pinia)
compProjectsSync(pinia)
teamsSync(pinia)

console.info(`Version: ${__APP_VERSION__}+build.${__COMMIT_HASH__}`)