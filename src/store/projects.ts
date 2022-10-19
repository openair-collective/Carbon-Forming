import { defineStore } from 'pinia'
import { Project } from '@/types'
import firestore from '@/services/firestore'
import storage from '@/services/storage'
import log from '@/services/logger'

const MODULE_ID = 'store/projects'

interface State {}

export const useProjectsStore = defineStore('projects', {
  state: (): State => ({}),
  actions: {
    async saveProject(project:Project, design_doc?:File):Promise<Project|undefined> {
      try {
        return await firestore.saveProject(project)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#saveProject > ' + message)
      }
    },
    async deleteProject(project:Project):Promise<void> {
      try {
        await firestore.deleteProject(project)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#deleteProject > ' + message)
      }
    }
  }
})