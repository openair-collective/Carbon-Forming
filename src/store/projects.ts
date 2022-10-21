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
    async saveProject(project:Project, image?:File):Promise<Project|undefined> {
      try {
        const response = await firestore.saveProject(project)
        if (image) {
          await this.saveProjectImage(project, image)
        }
        return project
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
    },
    async saveProjectImage(project:Project, image:File):Promise<Project|undefined> {
      try {
        const response = await storage.saveFile(image, project.id)
        project.image = response
        return await this.saveProject(project)
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#saveProjectDesignDoc > ' + message)
      }
    },
    async removeProjectImage(project:Project):Promise<Project|undefined> {
      try {
        if (project.image) {
          const response = await storage.removeFile(project.image)
          project.image = null
          return await this.saveProject(project)
        }
      }
      catch(error) {
        let message = (error instanceof Error) ? error.message : String(error)
        log.error(MODULE_ID, '#removeProjectImage > ' + message)
      }
    }
  }
})