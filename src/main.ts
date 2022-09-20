import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import Modal from './Modal.vue'
import ProjectModal from '@/modals/ProjectModal.vue'

import './_bulma.scss'



const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')

const modal = createApp(Modal)
modal.use(pinia)
modal.component('ProjectModal', ProjectModal)
modal.mount('#modals')